import axios from 'axios';
import * as variables from "./variables.mjs"
export * from './classes/EmbedBuilder.mjs'
export * from './classes/Database.mjs'
export { variables }
export { cache } from './cache.mjs'


/**
 * Sanitizes a message by truncating it if it exceeds the specified character limit.
 * @param {string} message The message to sanitize.
 * @param {number} [limit=2000] The character limit. Default is 2000.
 * @returns {string} The sanitized message.
 */
export const sanitizeMessage = (message, limit = 2000) => {
    return message.length > limit ? message.slice(0, limit - 3) + "..." : message;
};


/**
 * Checks if the given image URL is valid by sending a HEAD request to the URL and
 * checking the response status and content type.
 * @param {string} imageURL - The URL of the image to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the image URL is valid, 
 *   and false otherwise.
 */
export const isImageURLValid = async (imageURL) => {
    try {
        const response = await axios.head(imageURL);
        if (response.status !== 200) {
            return false;
        }
        const contentType = response.headers['content-type'];
        if (!contentType.startsWith('image/')) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Checks if a string is a valid discord invite
 * @param {String} text
 */
export const containsDiscordInvite = (text) => {
    return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
        text
    );
}


/**
 * Checks if a string include link
 * @param {String} text
 */
export const containsLink = (text) => {
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
        text
    );
}


export const escapeRegex = (str) => {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (e) {
        console.log(String(e.stack))
    }
}