import { Database as db } from "vantedb";
import fs from 'fs/promises';
import Bot from "../../client.mjs"

/**
 * @typedef {Object} Options
 * @property {Boolean} new 
 * @property {Boolean} upsert 
 */

class Database extends db {
    /**
     * 
     * @param {Bot} client 
     */
    constructor(client) {

        super({ Folder: "Database", UpdateCheck: false });

        this._Cluster = `${client.config.CLIENT_ID}`;

        (async () => {
            const Dir = await fs.readdir(`./src/Models`)
            Dir.filter((file) => file.endsWith('.mjs'))
                .forEach(async (Collection) => {
                    const { default: Model } = await import(`../../Models/${Collection}`);
                    await this.Model(Collection.split(".mjs")[0], Model)
                });
        })();

    }

    /**
     * Find documents in a collection that match the specified query.
     * @async
     * @param {string} Cluster - The cluster name.
     * @param {string} Collection - The name of the collection to search in.
     * @param {Object} Query - The query to filter documents.
     * @param {Object} Options - Additional options for the find operation.
     * @returns {Promise} A promise that resolves with the matching documents.
     * @throws {Error} Throws an error if required parameters are missing.
     */
    async FindOne(Collection, Query, Options) {
        return await this.findOne(this._Cluster, Collection, Query, Options)
    }

    /**
     * Find a single document in a collection that matches the specified query.
     * @async
     * @param {String} Collection - The name of the collection to search in.
     * @param {Object} Query - The query to find a document.
     * @param {Object} Options - Additional options for the find operation.
     * @returns {Promise} A promise that resolves with the matching document.
     * @throws {Error} Throws an error if required parameters are missing.
     */
    async Find(Collection, Query, Options) {
        return await this.find(this._Cluster, Collection, Query, Options)
    }
    /**
    * Create new documents in a collection.
    * @async
    * @param {String} Collection - The name of the collection to create documents in.
    * @param {Array|Object} Data - The data to be added to the collection.
    * @returns {Promise} A promise that resolves when documents are created.
    * @throws {Error} Throws an error if required parameters are missing.
    */
    async Create(Collection, Data) {
        return await this.create(this._Cluster, Collection, Data)
    }

    /**
     * Update a single document in a collection that matches the specified query.
     * @async
     * @param {String} Collection - The name of the collection to update documents in.
     * @param {Object} Query - The query to find the document to update.
     * @param {Object} Update - The update operation to apply to the document.
     * @param {Options} Options - Additional options for the update operation.
     * @returns {Promise} A promise that resolves when the document is updated.
     * @throws {Error} Throws an error if required parameters are missing.
     */
    async UpdateOne(Collection, Query, Update, Options) {
        return await this.updateOne(this._Cluster, Collection, Query, Update, Options)
    }


    /**
     * Update documents in a collection that match the specified query.
     * @async
     * @param {String} Collection - The name of the collection to update documents in.
     * @param {Object} Update - The update operation to apply to matching documents.
     * @param {Object} Options - Additional options for the update operation.
     * @returns {Promise} A promise that resolves when documents are updated.
     * @throws {Error} Throws an error if required parameters are missing.
     */
    async Update(Collection, Update, Options) {
        return await this.update(this._Cluster, Collection, Update, Options)
    }

    /**
     * Delete documents in a collection that match the specified query.
     * @async
     * @param {String} Collection - The name of the collection to delete documents from.
     * @param {Object} Query - The query to filter documents for deletion.
     * @returns {Promise} A promise that resolves when documents are deleted.
     */
    async Delete(Collection, Query) {
        return await this.delete(this._Cluster, Collection, Query)
    }

    /**
    * Get the size of a collection.
    * @async
    * @param {String} Collection - The name of the collection to get the size of.
    * @returns {Promise} A promise that resolves with the size of the collection.
    */
    async Size(Collection) {
        return await this.size(this.id, Collection)
    }

    /**
     * Define a model for a collection.
     * @async
     * @param {String} Collection - The name of the collection to define the model for.
     * @param {Object} Model - The model schema for the collection.
     * @returns {Promise} A promise that resolves when the model is defined.
     * @throws {Error} Throws an error if required parameters are missing.
     */
    async Model(...args) {
        return await this.model(...args)
    }

}

export default Database;
export { Database }