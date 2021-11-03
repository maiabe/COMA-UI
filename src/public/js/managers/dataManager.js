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
        if (validateVariables([varTest(msg, 'msg', 'object')], 'DataManager', '#sendMessage')) return false;
        else this.publisher.publishMessage(msg);
    }

    /**
     * Gets data associated with a key from the hash table if it exists.
     * @param {number} key the key to the data associated with a module
     * @returns the data associated with the key if found.
     */
    getData = key => {
        if (validateVariables([varTest(key, 'key', 'number')], 'DataManager', 'getData')) return undefined;
        if (this.#dataTable.has(key)) return this.#dataTable.get(key);
        else console.log(`ERROR: No data found for key: ${key}. -- Data Manager -> getData`);
        return undefined;
    }

    /**
     * Adds to the data table. If the specified key is in the table, it will be overwritten.
     * @param {number} key key into the data table. It is also the key to the module associated with this data.
     * @param {object} val the value linked to the key. This is the "data".
     */
    addData = (key, val) => {
        if (validateVariables([varTest(key, 'key', 'number'), varTest(val, 'val', 'object')], 'DataManager', 'addData')) return;
        if (this.#dataTable.has(key)) console.log(`Data Table already has key: ${key} in it. Will Overwrite. -- DataManager -> addData.`);
        this.#dataTable.set(key, val);
        // Notify Module Manager that new data was added to the table.
        this.#sendMessage(new Message(MODULE_MANAGER, DATA_MANAGER, 'New Data Loaded Event', { moduleKey: key }));
    }

    /**
     * Checks to see if any data exists for a specific module key.
     * @param {number} key 
     * @returns true if data exists, false if not.
     */
    hasData = key => {
        if (validateVariables([varTest(key, 'key', 'number')], 'DataManager', 'hasData')) return false;
        else return this.#dataTable.has(key);
    }
    /**
     * Deletes data from the datatable.
     * @param {number} key identifying  
     * @returns true if successful, false if not.
     */
    deleteData = key => {
        if (validateVariables([varTest(key, 'key', 'number')], 'DataManager', 'deleteData')) return false;
        else return this.#dataTable.delete(key);
    }

    /**
     * Data requests come with a key and a callback. All Data is returned as a parameter to this callback function.
     * @param {number} key the key to find the data.
     * @param {fn} callbackFunction the function to call and pass data as a parameter.
     */
    processDataRequest = (key, callbackFunction) => {
        if (validateVariables([varTest(key, 'key', 'number'), varTest(callbackFunction, 'callbackFunction', 'function')], 'DataManager', 'processDataRequest')) return;
        else callbackFunction(key, this.getData(key));
    }
}