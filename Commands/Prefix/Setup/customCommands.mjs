import Bot from '../../../src/client.mjs';
import {
    EmbedBuilder,
    roleMention,
    ActionRowBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    Message,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import { sanitizeMessage, cache, variables, isImageURLValid } from '../../../src/utils/index.mjs';

export default {
    name: "setup-commands",
    category: "setup",
    cooldown: 5,
    description: "Setup custom commands for this server.",
    aliases: ["set-custom-command", "setup-customcommands", "setcommand", "set-custom-commands", "setup-cc", "set-cc", "custom-commands", "setcc"],
    permissions: {
        user: ["Administrator", "SendMessages"],
        bot: ["ManageRoles", "ManageWebhooks", "ManageMessages"]
    },

    /** 
    * @param {Object} object
    * @param {Message | import('discord.js').Interaction} object.message
    * @param {String[]} object.args
    * @param {Bot} object.client
    * @param {Object} object.Slash
    * @param {Map} object.options
    * @param object.err ErrorHnadler
    */
    run: async ({ message, client, err, Slash, options, guildData }) => {
        try {

            if (Slash && Slash.is) await message.deferReply({ fetchReply: true });
            const cacheKey = `setup:cc`
            const user = message.author || message.user

            const data = guildData

            let homeBtn = new ButtonBuilder().setCustomId("cc:home-btn").setStyle(2).setLabel("Back");
            let resetBtn = (isdata = data) => new ButtonBuilder()
                .setCustomId("setup:cc:reset")
                .setStyle(2).setLabel("Reset All")
                .setEmoji("979818265582899240")
                .setDisabled(isdata?.CustomCommands?.Enable && isdata?.CustomCommands?.List?.length > 0 ? false : true)

            let addBtn = (isdata = data) => new ButtonBuilder()
                .setCustomId("setup:cc:add")
                .setStyle(3).setLabel("Add Command")
                // .setEmoji("979818265582899240")
                .setDisabled(isdata?.CustomCommands?.Enable && isdata?.CustomCommands?.List?.length < 25 ? false : true)

            let removeBtn = (isdata = data) => new ButtonBuilder()
                .setCustomId("setup:cc:remove:btn")
                .setStyle(4).setLabel("Remove Command")
                // .setEmoji("979818265582899240")
                .setDisabled(isdata?.CustomCommands?.Enable && isdata?.CustomCommands?.List?.length > 0 ? false : true)

            let prefixBtn = (isdata = data) => new ButtonBuilder()
                .setCustomId("setup:cc:prefix")
                .setStyle(2).setLabel("Update Prefix")
                .setDisabled(isdata?.CustomCommands?.Enable ? false : true)


            let enableBtn = (isdata = data) => new ButtonBuilder()
                .setCustomId("setup:cc:Enable")
                .setStyle(2)
                .setLabel(`${isdata?.CustomCommands?.Enable ? "Disable" : "Enable"}`)

            const row = (d = data) => new ActionRowBuilder()
                .addComponents(addBtn(d), removeBtn(d));

            const row2 = (isdata = data) => new ActionRowBuilder()
                .addComponents(enableBtn(isdata), resetBtn(isdata), prefixBtn(isdata))

            let emebd = (d = data) => {
                let des = "**Click The Fllowing Buttons to get started!**\n"

                if (d?.CustomCommands?.List?.length) {
                    des += "\n**List Of Custom Commands**\n"
                    d.CustomCommands.List.forEach(y => {
                        des += `- ${y.Triger}\n - ${y.Response?.content ? sanitizeMessage(y.Response.content, 10) : "Embed Response"}\n`;
                    })
                }

                des += `\n\n> *Join Our [**Discord**](${client.config.Links.Discord}) or dm [@uoaio](https://discord.com/users/922120042651451423) if you need help!*`

                return new EmbedBuilder()
                .setColor("Blurple")
                    .setAuthor({
                        name: "Custom Command",
                        url: `${client.config.Links.Discord}`
                    })
                    .setDescription(des)
                    .setThumbnail("https://cdn.discordapp.com/emojis/1068024801186295808.gif")
                    .setFooter({
                        text: `Custom Command Prefix: ${d?.CustomCommands?.Prefix} - Commands: ${d.CustomCommands?.List?.length || 0}/24`
                    })
                    .setTimestamp()
            }

            let msg = await message[Slash?.is ? "editReply" : "reply"]({
                components: [row(), row2()],
                embeds: [emebd()]
            });

            const collector = msg.createMessageComponentCollector({
                componentType: 0,
                time: 100 * 1000
            })

            collector.on("collect", async (i) => {
                if (i.user.id !== user.id) return await i.reply({
                    content: "You Cant".replaceEmojis(client),
                    ephemeral: true
                });

                const data2 = await i.guild.fetchData();

                const wait = async () => await i.update({
                    embeds: [new EmbedBuilder().setColor("Blurple").setDescription("Loading...")],
                    components: []
                });

                if (i.customId === "setup:cc") {

                    if (!data2.CustomCommands.Enable) return await i.reply({
                        content: "Enable Custom Commands System First!",
                        ephemeral: true
                    })

                    await wait();

                    const data4 = await client.db.UpdateOne('GuildConfig', {
                        Guild: i.guild.id,
                    }, {
                        $set: {
                            ["CustomCommands.Channel"]: i.values[0]
                        }
                    }, { upsert: true, new: true })

                    await msg.edit({
                        components: [row(data4), row2(data4)],
                        embeds: [emebd(data4)]
                    });

                    await i.guild.updateData()

                } else if (i.customId === "setup:cc:Enable") {

                    await wait();

                    const data3 = await client.db.UpdateOne('GuildConfig', {
                        Guild: i.guild.id,
                    }, {
                        $set: {
                            ["CustomCommands.Enable"]: data2.CustomCommands.Enable ? false : true
                        }
                    }, { upsert: true, new: true })

                    await msg.edit(await home(data3))

                    await i.guild.updateData()


                } else if (i.customId === "setup:cc:reset") {

                    await wait();

                    const data4 = await client.db.UpdateOne('GuildConfig', {
                        Guild: i.guild.id,
                    }, {
                        $set: {
                            ["CustomCommands"]: {
                                Enable: false,
                                Prefix: data.Prefix,
                                List: []
                            }
                        }
                    }, { upsert: true, new: true })

                    await msg.edit({
                        components: [row(false), row2(data4)],
                        embeds: [emebd(data4)]
                    })

                    await i.guild.updateData()

                } else if (i.customId === "setup:cc:prefix") {

                    const input_1 = new TextInputBuilder()
                        .setCustomId('prefix')
                        .setLabel("Enter A prefix")
                        .setRequired(true)
                        .setPlaceholder("Enter Prefix like: ! , . : ;")
                        .setStyle(1).setMaxLength(2);

                    const modal = new ModalBuilder().setCustomId('cc:prefix')
                        .setTitle('Custom Command Prefix')
                        .addComponents(new ActionRowBuilder().addComponents(input_1));

                    await i?.showModal(modal);

                    const response = await i.awaitModalSubmit({
                        filter: i => i.customId === "cc:prefix" && i.user.id === user.id,
                        time: 40 * 1000
                    });

                    /// on modal submit
                    if (response.isModalSubmit()) {
                        let value = response.fields.fields.get("prefix").value;


                        await response?.update({
                            embeds: [new EmbedBuilder().setColor("Blurple").setDescription("Wait a sec!")],
                            components: [],
                            files: []
                        });

                        const data4 = await client.db.UpdateOne('GuildConfig', {
                            Guild: i.guild.id,
                        }, {
                            $set: {
                                ["CustomCommands.Prefix"]: value,
                            }
                        }, { upsert: true, new: true })

                        await msg.edit(await home(data4))

                        await i.guild.updateData()

                    }


                } else if (i.customId === "setup:cc:add") {
                    await wait();

                    await msg.edit(await updateAdd())

                } else if (i.customId === "setup:cc:remove:btn") {

                    const Select = new StringSelectMenuBuilder()
                        .setCustomId(`setup:cc:remove:menu`)
                        .setPlaceholder('Dont Make Selection!')

                    data2.CustomCommands.List.forEach(y => {
                        Select.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`${y.Triger}`)
                                .setValue(`${y.Triger}`)
                        )
                    })

                    Select.setMinValues(1)
                    Select.setMaxValues(data2.CustomCommands.List.length)

                    await i.update({
                        embeds: [
                            new EmbedBuilder().setColor("Blurple")
                                .setDescription("*Select commands from following menu to remove*")
                        ],
                        components: [
                            new ActionRowBuilder().addComponents(Select),
                            new ActionRowBuilder().addComponents(homeBtn)
                        ]
                    })

                } else if (i.customId === "setup:cc:remove:menu") {
                    await wait()

                    data2.CustomCommands.List = data2.CustomCommands.List.filter(y => !i.values.includes(y.Triger))

                    const updated = await client.db.UpdateOne('GuildConfig', {
                        Guild: i.guild.id
                    }, {
                        $set: {
                            ['CustomCommands.List']: data2.CustomCommands.List
                        }
                    }, { upsert: true, new: true });

                    await msg.edit(await home(updated))
                    await i.guild.updateData()
                } else if (i.customId === "cc:set:res") {
                    // set response type

                    const resTypeRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("cc:withEmbed")
                                .setLabel("With Embed")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId("cc:withOutEmbed")
                                .setLabel("No Embed")
                                .setStyle(2),
                        )

                    const varRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("cc:variables")
                                .setLabel("Varibales")
                                .setStyle(1)
                        )

                    await i.update({
                        embeds: [
                            new EmbedBuilder().setColor("Blurple")
                                .setDescription("You want response with embed or without embed?")
                        ],
                        components: [resTypeRow, varRow]
                    })

                } else if (i.customId === "cc:withOutEmbed" || i.customId === "cc:set:triger") {
                    const type = i.customId === "cc:set:triger" ? true : false

                    const input_1 = new TextInputBuilder()
                        .setCustomId('content')
                        .setLabel("Enter Something")
                        .setRequired(true)
                        .setPlaceholder(type ? "Set Trigger" : "What You want to response when some use command? (Dont Use Spaces)")
                        .setStyle(!type ? 2 : 1).setMaxLength(!type ? 400 : 20);

                    const modal = new ModalBuilder().setCustomId('cc:withOutEmbedOrTrigger')
                        .setTitle('Custom Command')
                        .addComponents(new ActionRowBuilder().addComponents(input_1));

                    await i?.showModal(modal);

                    const response = await i.awaitModalSubmit({
                        filter: i => i.customId === "cc:withOutEmbedOrTrigger" && i.user.id === user.id,
                        time: 40 * 1000
                    });

                    /// on modal submit
                    if (response.isModalSubmit()) {
                        let value = response.fields.fields.get("content").value;

                        const cacheData = cache.get(cacheKey)

                        if (type) {
                            const check = data2?.CustomCommands?.List.find(y => y.Triger === value.toLowerCase().trim().replace(" ", ""))
                            if (check) return response.reply({
                                content: "Triger With this name already exits",
                                ephemeral: true
                            })
                            cache.set(cacheKey, {
                                ...cacheData,
                                triger: value.toLowerCase().trim().replace(" ", "")
                            });
                        } else cache.set(cacheKey, {
                            ...cacheData,
                            response: value
                        })

                        await response.update(await updateAdd())
                    }

                } else if (i.customId === "cc:withEmbed") {
                    const input_1 = new TextInputBuilder()
                        .setCustomId('title')
                        .setLabel("Title")
                        .setValue("Title Of Embed")
                        .setRequired(true)
                        .setPlaceholder('Enter some text!')
                        .setStyle(1)
                        .setMaxLength(60)
                    const input_2 = new TextInputBuilder()
                        .setCustomId('ds')
                        .setLabel("Description")
                        .setValue("Description Of Embed")
                        .setRequired(true)
                        .setPlaceholder('Enter some Description!')
                        .setStyle(2)
                        .setMaxLength(200)
                    const input_3 = new TextInputBuilder()
                        .setCustomId('color')
                        .setLabel("Embed Color")
                        .setRequired(false)
                        .setPlaceholder('Enter Hex Code!')
                        .setStyle(1)
                        .setMaxLength(6).setMinLength(6)
                    const input_4 = new TextInputBuilder()
                        .setCustomId('image')
                        .setLabel("Embed Image")
                        .setRequired(false)
                        .setPlaceholder('Enter Vaild Image URL!')
                        .setStyle(1)
                        .setMaxLength(300)
                    const input_5 = new TextInputBuilder()
                        .setCustomId('thumbnail')
                        .setLabel("Embed Thumbnail")
                        .setRequired(false)
                        .setPlaceholder('Enter Vaild Image URL!')
                        .setStyle(1)
                        .setMaxLength(300)

                    const modal = new ModalBuilder()
                        .setCustomId('cc:withEmbed')
                        .setTitle('Custom Command')
                        .addComponents(new ActionRowBuilder().addComponents(input_1))
                        .addComponents(new ActionRowBuilder().addComponents(input_3))
                        .addComponents(new ActionRowBuilder().addComponents(input_4))
                        .addComponents(new ActionRowBuilder().addComponents(input_5))
                        .addComponents(new ActionRowBuilder().addComponents(input_2))

                    await i?.showModal(modal);

                    const response = await i.awaitModalSubmit({
                        filter: i => i.customId === "cc:withEmbed" && i.user.id === user.id,
                        time: 40 * 1000
                    });

                    /// on modal submit
                    if (response.isModalSubmit()) {
                        let title = response.fields.fields.get("title").value
                        let description = response.fields.fields.get("ds").value
                        let color = response.fields.fields.get("color").value || "060606"
                        let image = response.fields.fields.get("image").value || null
                        let thumbnail = response.fields.fields.get("thumbnail").value || null

                        const Embed = new EmbedBuilder().setColor("Blurple")

                        if (color && !/^[A-Fa-f0-9]{6}$/.test(color)) return await response.reply({
                            embeds: [Embed.setDescription("Kindly Provide A Vaild Hex Code. eg: 00ffaa, ffffff, 000000......")],
                            ephemeral: true
                        });

                        if (image) {
                            if (!await isImageURLValid(variables.Replace(image, i.member))) return await response.reply({
                                embeds: [Embed.setDescription("Kindly Provide A Vaild URL.")],
                                ephemeral: true
                            });
                        }

                        if (thumbnail) {
                            if (!await isImageURLValid(variables.Replace(thumbnail, i.member))) return await response.reply({
                                embeds: [Embed.setDescription("Kindly Provide A Vaild URL fro thumbnail.")],
                                ephemeral: true
                            });
                        }


                        const d = cache.get(cacheKey) || {}
                        const ccOptions = {
                            ...d,
                            response: "<Embed>",
                            Embed: {
                                description,
                                title,
                                thumbnail,
                                image,
                                color,
                            }
                        }

                        cache.set(cacheKey, ccOptions)

                        await response.update(await updateAdd())
                    }
                } else if (i.customId === "cc:set:roles:btn") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId(`cc:set:roles:menu`)
                        .setPlaceholder('Dont Make Selection!')
                        .setMaxValues(6);

                    const Embed = new EmbedBuilder().setColor("Blurple")
                        .setTitle("Select Roles")
                        .setDescription("*You can select upto 6 roles!*")

                    const roleRow = new ActionRowBuilder()
                        .addComponents(roleSelect)

                    await i.update({
                        embeds: [Embed],
                        components: [roleRow]
                    })
                } else if (i.customId === "cc:set:roles:menu") {
                    let selectedRoles = i.values;
                    const d = cache.get(cacheKey) || {};

                    const ccoptions = {
                        ...d,
                        roles: selectedRoles,
                    };
                    cache.set(cacheKey, ccoptions)
                    await i.update(await updateAdd())

                } else if (i.customId === "cc:set:save") {
                    await wait();
                    const data = cache.get(cacheKey);
                    let Response = {};

                    if (data.response === "<Embed>") {
                        let embed = new EmbedBuilder()
                            .setColor(`#${data.Embed.color}`)
                            .setDescription(data.Embed.description)
                            .setTitle(data.Embed.title);
                        if (data.image) embed.setImage(data.Embed.image)
                        if (data.thumbnail) embed.setThumbnail(data.Embed.thumbnail)
                        Response.embeds = [embed.toJSON()]
                    } else Response.content = data.response

                    data2.CustomCommands.List.push({
                        Triger: data.triger,
                        Response,
                        Roles: data.roles
                    })

                    const updated = await client.db.UpdateOne('GuildConfig', {
                        Guild: i.guild.id
                    }, {
                        $set: {
                            ['CustomCommands.List']: data2.CustomCommands.List
                        }
                    }, { upsert: true, new: true })

                    msg.edit({
                        embeds: [
                            new EmbedBuilder().setColor("Blurple").setDescription(`Successfully created custom command! Type \`${updated.CustomCommands.Prefix}${data.triger}\` to test.`)
                        ]
                    })

                    await i.guild.updateData()

                    cache.delete(cacheKey)
                } else if (i.customId === "cc:variables") await i.reply({
                    content: variables.description,
                    ephemeral: true
                })
                else if (i.customId === "cc:home-btn") await i.update(await home())


                //* Go to main page
                async function home(data) {
                    if (!data) data = await i.guild.fetchData()
                    return {
                        files: [],
                        embeds: [emebd(data)],
                        content: "",
                        components: [row(data), row2(data)]
                    };
                }

                async function updateAdd(/*data*/) {
                    // if (!data) data = await i.guild.fetchData()

                    const cacheData = cache.get(cacheKey) || {}

                    const ccOptions = {
                        triger: "Not Set",
                        response: "Not Set",
                        ...cacheData
                    }

                    let ccTriger = new ButtonBuilder()
                        .setCustomId("cc:set:triger")
                        .setStyle(2).setLabel("Set Triger")

                    let ccResType = new ButtonBuilder()
                        .setCustomId("cc:set:res")
                        .setStyle(2).setLabel("Set Response")


                    let ccSetRole = new ButtonBuilder()
                        .setCustomId("cc:set:roles:btn")
                        .setStyle(2).setLabel("Set Roles")

                    let ccSave = new ButtonBuilder()
                        .setCustomId("cc:set:save")
                        .setStyle(3).setLabel("Save")
                        .setDisabled(ccOptions.triger === "Not Set" || ccOptions.response === "Not Set" ? true : false)

                    const ccRow = new ActionRowBuilder()
                        .addComponents(ccTriger, ccResType, ccSetRole)
                    const ccRow2 = new ActionRowBuilder()
                        .addComponents(homeBtn, ccSave)


                    const Embed = new EmbedBuilder().setColor("Blurple")
                        .setTitle("Add Custom Command")
                        .setDescription(`- Trigger: ${ccOptions.triger}\n- Response: ${ccOptions.response}\n${ccOptions?.roles ? `- Roles: ${ccOptions.roles.map(r => `<@&${r}>`).join(", ")}` : ""}`)


                    return {
                        files: [],
                        content: "",
                        embeds: [Embed],
                        components: [ccRow, ccRow2]
                    }

                }
            });


            collector.on('end', async i => {
                await msg.edit({
                    embeds: [new EmbedBuilder().setColor("White").setDescription("**Timeout!** Run Command Again.")],
                    files: [],
                    content: "",
                    components: []
                }).catch(() => { })
            })


        } catch (error) {
            err(error)
        }
    }
};