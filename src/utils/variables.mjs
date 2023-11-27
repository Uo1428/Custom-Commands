import { GuildMember, Message } from "discord.js";

/**
 * Replace variables in the specified string with their values.
 * @param {string} string The string containing the variables.
 * @param {import("discord.js").PartialGuildMember | GuildMember | Message} context The context in which these variables are to be replaced.
 */
const Replace = (string, context) => {
    const vars = {
        "{id}": context?.id,
        "{content}": context instanceof Message ? context?.content : "",
        "{content.clean}": context instanceof Message ? context?.cleanContent : "",
        "{server}": context?.guild.name,
        "{server.id}": context?.guild.id,
        "{server.icon}": context?.guild.icon ? context?.guild.iconURL() : `https://dummyimage.com/128/7289DA/FFFFFF/&text=${encodeURIComponent(context?.guild.nameAcronym)}`,
        "{server.channels.size}": context?.guild.channels.cache.size,
        "{server.roles.size}": context?.guild.roles.cache.size,
        "{server.members.size}": context?.guild.memberCount,
        "{server.users.size}": context?.guild.members.cache.filter(context => context?.user.bot === false).size,
        "{server.bots.size}": context?.guild.members.cache.filter(context => context?.user.bot === true).size,
        "{author}": "<@" + (context instanceof Message ? context?.author.id : context?.id) + ">",
        "{author.id}": context instanceof Message ? context?.author.id : context?.id,
        "{author.tag}": context instanceof Message ? context?.author.tag : context?.user.tag,
        "{author.name}": context instanceof Message ? context?.author.username : context?.user.username,
        "{author.nick}": context instanceof Message ? context?.member.displayName : context?.displayName,
        "{author.avatar}": context instanceof Message ? context?.author.displayAvatarURL() : context?.user.displayAvatarURL(),
        "{author.roles.size}": context instanceof Message ? context?.member.roles.cache.size : context?.roles.cache.size,
        "{bot}": "<@" + context?.client.user.id + ">",
        "{bot.id}": context?.client.user.id,
        "{bot.tag}": context?.client.user.tag,
        "{bot.name}": context?.client.user.username,
        "{bot.nick}": context?.guild.members.me.displayName,
        "{bot.avatar}": context?.guild.members.me.user.displayAvatarURL(),
        "{bot.roles.size}": context?.guild.members.me.roles.cache.size,
    };

    const variableRegExp = new RegExp(Object.keys(vars).join("|"), "ig");

    string = string.replace(variableRegExp, matched => vars[matched]);

    return string;
};

const description = `\`{id}\` - Your unique identifier.
\`{content}\` - Your message content.
\`{content.clean}\` - Your message content without mentions.
\`{server}\` - The name of the server.
\`{server.id}\` - The ID of the server.
\`{server.icon}\` - The server's icon.
\`{server.channels.size}\` - Number of channels in the server.
\`{server.roles.size}\` - Number of roles in the server.
\`{server.members.size}\` - Total members in the server.
\`{server.users.size}\` - Non-bot members in the server.
\`{server.bots.size}\` - Bot members in the server.
\`{author}\` - Your username or display name.
\`{author.id}\` - Your unique identifier.
\`{author.name}\` - Your username.
\`{author.nick}\` - Your display name in the server.
\`{author.avatar}\` - Your profile picture.
\`{author.roles.size}\` - Number of roles you have.
\`{bot}\` - The bot's mention.
\`{bot.id}\` - The bot's unique identifier.
\`{bot.name}\` - The bot's username.
\`{bot.nick}\` - The bot's display name in the server.
\`{bot.avatar}\` - The bot's profile picture.
\`{bot.roles.size}\` - Number of roles the bot has.`

export {
    Replace,
    description
};