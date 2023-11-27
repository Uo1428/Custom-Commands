import { Guild, Message, MessagePayload } from "discord.js"
import { cache } from "../index.mjs"
import Bot from "../../client.mjs"
import "../replaceEmoji.mjs"
/**
* * Fetch data 
* @returns {String} 
*/
Guild.prototype.fetchData = async function () {
    let data;
    const Cache = cache.get(`GuildConfig:${this.id}:${this.client.user.id}`);
    if (Cache) data = Cache;
    else {
        data = await this.client.db.FindOne('GuildConfig', {
            Guild: this.id
        });


        if (data) cache.set(`GuildConfig:${this.id}:${this.client.user.id}`, data, 30);
        else {
            await this.client.db.Create('GuildConfig', { Guild: this.id }, { upsert: true, new: true })
            data = await this.client.db.FindOne('GuildConfig', {
                Guild: this.id
            });
        }
    }

    return data
}


Guild.prototype.updateData = async function () {
    // Update the guild config in database and cache
    cache.delete(`GuildConfig:${this.id}:${this.client.user.id}`)
    return await this.fetchData();
}