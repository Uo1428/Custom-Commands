/**
 * Check whether a moderator can manage the specified member.
 * @param moderator The moderator.
 * @param member The member to manage.
 */

export const manageable = (moderator, member) => {
    if (moderator.id === moderator.guild.ownerId) return true;
    if (member.id === member.guild.ownerId) return false;
    if (moderator.id === member.id) return false;
    return moderator.roles.highest.comparePositionTo(member.roles.highest) > 0;
};

export const resolveStatus = (status) => {
    switch (status) {
        case "online":
            return "Online";
        case "idle":
            return "Idle";
        case "dnd":
            return "Do Not Disturb";
        case "invisible":
            return "Invisible";
        case "offline":
            return "Offline";
        default:
            return status;
    }
};



/**
* @param {GuildMember} member 
* @param {Bot} client 
* @param {PermissionsBitField} permissions
*/

export const memberPermissons = ({ member, client, permissions }) => {
    const userMarks = [];
    for (const permission of permissions) {
        const hasPermission = member.permissions.has(PermissionsBitField.resolve(permission));

        userMarks.push(hasPermission ? `!{y} ${Permissions[permission]}`.replaceEmojis(client) : `!{x} ${Permissions[permission]}`.replaceEmojis(client));
    }
    return userMarks;
}
