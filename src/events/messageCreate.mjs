import { Collection, PermissionsBitField, Message } from 'discord.js'
import EmbedBuilder from '../utils/classes/EmbedBuilder.mjs'
import { msg as CoolDown } from '../utils/Cooldown.mjs'
import { msg as ErrorHandler } from '../utils/errorHandler.mjs';
import { memberPermissons } from '../utils/member.mjs'
import cache from '../utils/cache.mjs'
import Bot from '../client.mjs'

export default {
    name: "messageCreate",
    /**
     * @param {Bot} client - The Discord client.
     * @param {Message} message - The message object.
     */
    run: async (client, message) => {
        const err = (err, i) => ErrorHandler(!i ? message : i, err);
        // ==============================< Command Handling >=============================\\	
        if (message.author.bot || message.system) return;
        if (message.channel.type !== 0) return;
        const guildData = await message.guild.fetchData();
        const prefix = guildData?.Prefix || client.config.Prefix;
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);
        if (!prefixRegex.test(message.content)) return;
        const [mPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(mPrefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        let command = client.commands.get(cmd) || client.commands.find(c => c.aliases && c.aliases.includes(cmd)) //|| client.commands.get(client.aliases.get(cmd));
        // ==============================< If command doesn't found >=============================\\         
        if (cmd.length === 0) {
            if (mPrefix.includes(client.user.id))
                return message.reply({
                    // components: [client.linksButtons],
                    embeds: [new EmbedBuilder(client)
                        .setColor("Blurple")
                        .setDescription(`Hy My prefix is ${prefix}`)
                    ],
                }).catch(() => { });
            return;
        }
        // ==============================< If !command return >=============================\\
        if (!command || !command.run) {
            // return message.reply({
            //     embeds: [
            //         new EmbedBuilder(client)
            //             .setColor(client.embed.wrongcolor)
            //             .setDescription(`!{i} The command \`${cmd}\` does not exist`)
            //     ]
            // }).then(m => setTimeout(() => m.delete(), 6000));
        }
        if (command) {
            // ==============================< Toggle off >=============================\\
            if (command.toggleOff) {
                return await message.reply({
                    embeds: [new EmbedBuilder(client)
                        .setDescription(`**That Command Has Been Disabled By The Developers! Please Try Later.**`)
                        .setColor(client.embed.wrongcolor)
                    ]
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete().catch((e) => {
                            console.log(String(e).grey)
                        })
                    }, 6000)
                }).catch((e) => {
                    console.log(String(e).grey)
                });
            }
            // ==============================< On Mainenance Mode >============================= \\
            if (command.maintenance) {
                return await message.reply({
                    content: ` **${command.name} command is on __Maintenance Mode__** try again later!`
                })
            }
            // ==============================< Owner Only >============================= \\
            if (command.ownerOnly) {
                const owners = client.config.Owners
                if (!owners.includes(message.author.id)) return await message.reply({
                    embeds: [new EmbedBuilder(client)
                        .setDescription(` **You cannot use \`${prefix}${command.name}\` command as this is a developer command.**`).setColor(client.embed.wrongcolor)
                    ]
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete().catch((e) => {
                            console.log(String(e).grey)
                        })
                    }, 6000)
                }).catch((e) => {
                    console.log(String(e).grey)
                });
            }
            // ==============================< Permissions checking >============================= \\
            if (command.permissions) {
                if (command.permissions.bot || command.permissions.user) {
                    if (!message.member.permissions.has(PermissionsBitField.resolve(command.permissions.user || []))) {
                        const userPerms = new EmbedBuilder(client)
                            .setTitle("You dont have permission")
                            .setDescription(`***${message.author}, The Following permission is required to run this command!***\n\n ${memberPermissons({
                                member: message.member,
                                client,
                                permissions: command.permissions.user
                            }).join("\n")}`)
                            .setColor("Blurple")
                            .setDefaultFooter()
                            .setTimestamp()
                        // .setAuthor({
                        //     name: message.guild.name,
                        //     iconURL: message.guild.iconURL({
                        //         dynamic: true
                        //     })
                        // })
                        return message.reply({ embeds: [userPerms] })
                    }
                    if (!message.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.permissions.bot || []))) {
                        const botPerms = new EmbedBuilder(client)
                            .setTitle("I need permission")
                            .setDescription(`***${message.author}, The Following permission is required for Me!***\n\n ${memberPermissons({
                                member: message.guild.members.me,
                                client,
                                permissions: command.permissions.bot
                            }).join("\n")}`)
                            .setColor("Blurple")
                            .setDefaultFooter()
                            .setTimestamp()
                        // .setAuthor({
                        //     name: message.guild.name,
                        //     iconURL: message.guild.iconURL({
                        //         dynamic: true
                        //     })
                        // })
                        return message.reply({ embeds: [botPerms] })
                    }
                }
            }
            // ==============================< Music Command >============================= \\
            if (command.music) {
                const { member, guild } = message, { channel } = member.voice, VC = member.voice.channel;
                if (!VC) return message.reply({
                    embeds: [new EmbedBuilder(client)
                        .setColor(client.embed.wrongcolor)
                        .setDescription(`Please Join a Voice Channel`)
                    ]
                });
                if (channel.userLimit != 0 && channel.full)
                    return message.reply({
                        embeds: [new EmbedBuilder(client)
                            .setColor(client.embed.wrongcolor)
                            .setDescription(`Your Voice Channel is full, I can't join!`)
                        ]
                    });
                if (guild.members.me.voice.channel && VC !== guild.members.me.voice.channel) return message.reply({
                    embeds: [new EmbedBuilder(client)
                        .setColor(client.embed.wrongcolor)
                        .setDescription(`Join my channel ${guild.members.me.voice.channel}`)
                    ]
                });
            }

            // ==============================< NSFW checking >============================= \\
            if (command.nsfwOnly && !message.channel.nsfw) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder(client)
                            .setTitle(`${message.author.username} This command only works in NSFW channels!`)
                            .setDescription(`Please go to the NSFW channel to use this command!`)
                            .setColor(client.embed.wrongcolor)
                    ]

                }).then(m => setTimeout(() => m.delete(), 6000));
            }

            // ==============================< Options Manager >============================= \\
            const optionsMap = new Map();
            if (command.options) {
                const options = command.options;
                const errorMessages = [];
                const argsMessages = [];
                let maped = `Syntax: ${prefix}${command.name} ${command.options.map(op => `${op.required ? `<${op.name}>` : `[${op.name}]`}`).join(" ")}`;
                if ((!args || !args[0]) && options[0].required && options[0].type !== "attachment") {
                    argsMessages.push(maped)
                } else for (let index = 0; index < options.length; index++) {
                    const option = options[index];
                    if (option.required) {
                        if (!args[index] && option.type !== "attachment") {
                            errorMessages.push(` Missing **${th(index + 1)}** Parameter\n\`\`\`yml\n${maped}\n\`\`\``);
                            break;
                        } else {
                            if (option.type === "string") {
                                if (option.choices?.length) {
                                    const choices = option.choices.map(i => i.toLowerCase());

                                    if (!choices.includes(args[index].toLowerCase())) {
                                        errorMessages.push(`Kindly Provide a valid input for **${th(index + 1)}** Parameter.\n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else {
                                        optionsMap.set(option.id, args[index]);
                                    }

                                } else optionsMap.set(option.id, args[index])

                            }
                            else if (option.type === "user" || option.type === "member") {
                                await ForUser()
                            } else if (option.type === "role") {
                                await ForRole()
                            } else if (option.type === "channel") {
                                if (isValidChannel(message.guild, args[index])) optionsMap.set(option.id, args[index].match(/^<#(\d+)>$/)[1])
                                else errorMessages.push(` Invalid Channel, Kindly provide valid Channel Name, ID or Mention it.\n\`\`\`yml\n${maped}\n\`\`\``);
                            } else if (option.type === "number") {
                                if (isNaN(args[index])) errorMessages.push(`Invalid Number, Kindly Provide a vaild number.\n\`\`\`yml\n${maped}\n\`\`\``);
                                else {
                                    if ((option.max && args[index] > option.max) ||
                                        (option.min && args[index] < option.min)) {
                                        errorMessages.push(`Kindly Provide a Number amoung ${option.min ?? 0}-${option.max ?? `Infinte`} \n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else {
                                        optionsMap.set(option.id, args[index])
                                    }
                                }

                            } else if (option.type === "attachment") {
                                if (option.required) {
                                    if (!message.attachments || message.attachments.size === 0) {
                                        errorMessages.push(`Missing **${th(index + 1)}** Parameter\n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else optionsMap.set(option.id, message.attachments)
                                }

                            }
                        }
                    } else {

                        if (option.type === "string") {
                            if (option.type === "string") {
                                if (option.choices?.length) {
                                    const choices = option.choices.map(i => i.toLowerCase());

                                    if (!choices.includes(args[index].toLowerCase())) {
                                        errorMessages.push(`!{i} Kindly Provide a valid input for **${th(index + 1)}** Parameter.\n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else {
                                        optionsMap.set(option.id, args[index]);
                                    }

                                } else optionsMap.set(option.id, args[index])

                            }
                        }

                        await ForUser()
                        await forNumber();
                        await ForRole()

                        break;
                    };
                    async function forNumber() {
                        if (option.type === "number") {
                            if (option.required && isNaN(args[index])) errorMessages.push(`!{i} Invalid Number, Kindly Provide a vaild number.\n\`\`\`yml\n${maped}\n\`\`\``);
                            else {
                                if ((option.max && args[index] > option.max) ||
                                    (option.min && args[index] < option.min)) {
                                    errorMessages.push(`!{i} Kindly Provide a Number amoung ${option.min ?? 0}-${option.max ?? `Infinte`} \n\`\`\`yml\n${maped}\n\`\`\``);
                                } else {
                                    optionsMap.set(option.id, args[index])
                                }
                            }
                        }
                    }
                    async function ForUser() {
                        if (args?.[index] && (option.type === "user" || option.type === "member")) {
                            let userMatch = args[index].match(/^<@!?(\d+)>$/) || args[index].match(/^(\d+)$/);
                            let user;
                            let Type = option.type === "user" ? "user-" : `member-${message.guild.id}-`
                            if (userMatch) {
                                if (cache.get(Type + userMatch[1])) {
                                    user = cache.get(Type + userMatch[1]);
                                    optionsMap.set(option.id, user)
                                } else {
                                    if (option.type === "user") {
                                        let fetchedUser = await client.users.fetch(userMatch[1]).catch(() => null)
                                        if (!fetchedUser) {
                                            errorMessages.push(`!{x} Invalid mention, Kindly mention a correct user\n\`\`\`yml\n${maped}\n\`\`\``);
                                        } else {
                                            optionsMap.set(option.id, fetchedUser)
                                            cache.set(Type + fetchedUser.id, fetchedUser, 150)
                                        }
                                    } else {
                                        let fetchedUser = await message.guild.members.fetch(userMatch[1]).catch(() => null)
                                        if (!fetchedUser) {
                                            errorMessages.push(`!{x} Invalid mention, Kindly mention a correct user\n\`\`\`yml\n${maped}\n\`\`\``);
                                        } else {
                                            optionsMap.set(option.id, fetchedUser)
                                            cache.set(Type + fetchedUser.id, fetchedUser, 150)
                                        }
                                    }
                                }
                            } else {
                                if (option.type === "user") {
                                    let fetchedUser = await client.users.fetch(args[index]).catch(() => null) || client.users.cache.find(u => u.username === args[index]);
                                    if (!fetchedUser) {
                                        errorMessages.push(`!{x} Invalid mention, Kindly mention a correct user\n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else {
                                        optionsMap.set(option.id, fetchedUser)
                                        cache.set(Type + fetchedUser.id, fetchedUser, 150)
                                    }
                                } else {
                                    let fetchedUser = await message.guild.members.fetch(args[index]).catch(() => null) || message.guild.members.cache.find(u => u.user.username === args[index]);
                                    if (!fetchedUser) {
                                        errorMessages.push(`!{x} Invalid mention, Kindly mention a correct user\n\`\`\`yml\n${maped}\n\`\`\``);
                                    } else {
                                        optionsMap.set(option.id, fetchedUser)
                                        cache.set(Type + fetchedUser.id, fetchedUser, 150)
                                    }
                                }
                            }

                        }
                    }
                    async function ForRole() {
                        if (option.type === "role") {
                            const mentionMatch = args[index].match(/^<@&(\d+)>$/);
                            const key = `Role:${mentionMatch?.[1] || args[index]}`;
                            const cacheData = cache.get(key)
                            if (cacheData) optionsMap.set(option.id, cacheData)
                            else {
                                const role = message.guild.roles.cache.get(mentionMatch?.[1]) ||
                                    message.guild.roles.cache.find(r => r.name === args[index]) ||
                                    message.guild.roles.cache.find(r => r.name.includes(args[index]));
                                if (role) optionsMap.set(option.id, role);
                                else errorMessages.push(`!{i} Invalid Role, Kindly provide valid role Name, ID or Mention it.\n\`\`\`yml\n${maped}\n\`\`\``);
                            }
                        }
                    }
                }
                if (argsMessages.length > 0) {
                    const embed = new EmbedBuilder(client).setFooter({
                        text: "Required Parameters: < > - Optional Parameters: [ ]"
                    })
                        .setDescription(`***Make Sure to follow the syntax to run  \`${command.name}\` command***\n\`\`\`yml\n${argsMessages[0]}\`\`\``)
                        .setColor(client.embed.wrongcolor)
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({
                                format: "png", dynamic: true
                            })
                        }).setTimestamp()
                    message.reply({
                        embeds: [embed]
                    });
                    return;
                } else if (errorMessages.length > 0) {
                    const embed = new EmbedBuilder(client)
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({
                                format: "png", dynamic: true
                            })
                        }).setTimestamp()
                        .setDescription(errorMessages[0])
                        .setColor(client.embed.wrongcolor)
                        .setFooter({
                            text: "Required Parameters: < > - Optional Parameters: [ ]"
                        });
                    message.reply({
                        embeds: [embed]
                    });
                    return;
                }
            }
            // ==============================< CoolDown checking >============================= \\
            if (command.cooldown) {
                if (CoolDown(message, command, client)) {
                    return await message.reply({
                        embeds: [
                            new EmbedBuilder(client)
                                .setDescription(`!{x} Please wait ***\`${CoolDown(message, command).toFixed(1)}\` Seconds*** Before using the \`${command.name}\` command again!`)
                                .setColor(client.embed.wrongcolor)
                        ]
                    }).then(m => setTimeout(() => m.delete(), CoolDown(message, command) * 1000));
                }
            }

            // ==============================< Start The Command >============================= \\
            await command.run({ client, message, args, command, options: optionsMap, err, guildData });

            client.channels.cache.get(client.config.Channels.CommandLogs)?.send({
                embeds: [new EmbedBuilder(client)
                    .setColor("Blurple")
                    .setAuthor({
                        name: message.guild.name,
                        iconURL: message.guild.iconURL({
                            dynamic: true
                        })
                    })
                    .setTitle(`Prefix Command`)
                    .addFields([
                        { name: "**Author**", value: `\`\`\`yml\n${message.author.username} [${message.author.id}]\`\`\`` },
                        { name: "**Command Name**", value: `\`\`\`yml\n${command.name}\`\`\`` },
                        { name: `**Guild**`, value: `\`\`\`yml\n${message.guild?.name} [${message.guild?.id}]\`\`\`` }
                    ])
                ]
            });
        }
    }
}


// escapeRegex
function escapeRegex(str) {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (e) {
        console.log(String(e.stack))
    }
}

function th(index) {
    if (index == 1) return "First"
    else if (index == 2) return "2nd"
    else if (index == 3) return "3rd"
    else return index + "th"
}



function isValidChannel(guild, input) {

    const mentionMatch = input.match(/^<#(\d+)>$/);
    if (mentionMatch) {
        const channelId = mentionMatch[1];
        return guild.channels.cache.has(channelId);
    }

    if (guild.channels.cache.has(input)) {
        return true;
    }

    const channel = guild.channels.cache.find((c) => c.name === input);
    return !!channel;
}