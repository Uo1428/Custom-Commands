import { Message } from 'discord.js'
import "../utils/replaceEmoji.mjs"
import Bot from '../client.mjs'
import { escapeRegex, variables } from '../utils/index.mjs';

export default {
    name: "messageCreate",
    /**
     * @param {Bot} client - The Discord client.
     * @param {Message} message - The message object.
     */
    run: async (client, message) => {
        try {

            if (message.author.bot || message.system) return;
            if (message.channel.type !== 0) return;

            const guildData = await message.guild.fetchData();
            if (!guildData?.CustomCommands?.Enable || !guildData.CustomCommands.List.length) return;
            
            const prefix = guildData?.CustomCommands?.Prefix
            const prefixRegex = new RegExp(`^(${escapeRegex(prefix)})`);
            if (!prefixRegex.test(message.content)) return;
            const [mPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(mPrefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            const command = guildData.CustomCommands.List.find(y => y.Triger === cmd)

            if (command) {
                if (command.Roles?.length) {
                    let hasRole = false;
                    for (const role of command.Roles) {
                        if (message.member._roles.includes(role)) {
                            hasRole = true;
                            break;
                        }
                    }

                    if (!hasRole) return await message.reply({
                        content: "!{i} You dont have permisson to use this command".replaceEmojis(guildData.Theme)
                    }).then(msg => {
                        setTimeout(() => {
                            msg.delete().catch((e) => {
                                console.log(String(e).grey)
                            })
                        }, 6000)
                    })

                }

                const Response = JSON.parse(
                    variables.Replace(
                        JSON.stringify(command.Response),
                        message.member
                    ))

                await message.reply(Response).catch(() => {})
            }

        } catch (e) {
            console.log(e)
        }
    }
}