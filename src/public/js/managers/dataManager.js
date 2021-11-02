class DataManager {

    publisher;
    #dataTable;                // Map that stores the data. Keys are the unique keys of the nodes.

    constructor() {
        this.publisher = new Publisher();
        this.#dataTable = new Map();
    };

    /**
     * Sends a message to all subscribers. (should only be hub).
     * @param {Message} msg the Message 
     */
    #sendMessage = msg => {
        if (msg) this.publisher.publishMessage(msg);
        else console.log(`ERROR: message was undefined. -- DataManager -> #sendMessage`);
    }

    /**
     * Gets data associated with a key from the hash table if it exists.
     * @param {number} key the key to the data associated with a module
     * @returns the data associated with the key if found.
     */
    getData = key => {
        if (key) {
            if (this.#dataTable.has(key)) return this.#dataTable.get(key);
            else console.log(`ERROR: No data found for key: ${key}. -- Data Manager -> getData`);
        } else console.log(`ERROR: key: ${key}. -- Data Manager -> getData`);
        return undefined;
    }

   /**
    * Adds to the data table. If the specified key is in the table, it will be overwritten.
    * @param {number} key key into the data table. It is also the key to the module associated with this data.
    * @param {*} val the value linked to the key. This is the "data".
    */
    addData = (key, val) => {
        if (key && val) {
            if (this.#dataTable.has(key)) console.log(`Data Table already has key: ${key} in it. Will Overwrite. -- DataManager -> addData.`);
            this.#dataTable.set(key, val);
            const data = { moduleKey: key };
            const msg = new Message(MODULE_MANAGER, DATA_MANAGER, 'New Data Loaded Event', data);   // Notify Module Manager that new data was added to the table.
            this.#sendMessage(msg);
        } else console.log(`ERROR: Parameter missing. key: ${key}, val: ${val}. -- Data Manager - addData.`);
    }

    /**
     * Checks to see if any data exists for a specific module key.
     * @param {number} key 
     * @returns true if data exists, false if not.
     */
    hasData = key => {
        if (!key) console.log(`ERROR: Trying to find data for key: ${key}. -- Data Manager -> hasData`);
        return this.#dataTable.has(key);
    }
    /**
     * Deletes data from the datatable.
     * @param {number} key identifying  
     * @returns true if successful, false if not.
     */
    deleteData = key => {
        if (!key) console.log(`ERROR: Trying to delete data for key: ${key}. -- Data Manager -> hasData`);
        return this.#dataTable.delete(key);
    }

    /**
     * Data requests come with a key and a callback. All Data is returned as a parameter to this callback function.
     * @param {number} key the key to find the data.
     * @param {fn} callbackFunction the function to call and pass data as a parameter.
     */
    processDataRequest = (key, callbackFunction) => {
        if (key && callbackFunction) {
            callbackFunction(key, this.getData(key));
        } else console.log(`ERROR: Either missing key: ${key} or null callbackFunction: ${callbackFunction}`);
    }
}