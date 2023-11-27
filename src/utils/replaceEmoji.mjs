import Bot from "../client.mjs";
import emotes from "../../Assets/Config/emotes.mjs";

/**
* * Replace Emotes
* @param {Bot} param
*/

String.prototype.replaceEmojis = function (param) {
    const emojiRegex = /!\{([^}]+)\}/g;
    let Emotes = emotes;
    return this.replace(emojiRegex, (match, emojiKey) => {
        if (Emotes[emojiKey]) return Emotes[emojiKey];
        else return match;
    });

}