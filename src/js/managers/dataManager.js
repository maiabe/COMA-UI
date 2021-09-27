class DataManager {

    publisher;
    #dataTable;                // Map that stores the data. Keys are the unique keys of the nodes.

    constructor() {
        this.publisher = new Publisher();
        this.#dataTable = new Map();
    };

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }

    getData = key => {
        return this.#dataTable.get(key);
    }

    /** if key already exists, the data will be overwritten */
    addData = (key, val) => {
        this.#dataTable.set(key, val);
        const data = {moduleKey: key};
        const msg = new Message(MODULE_MANAGER, DATA_MANAGER, 'New Data Loaded Event', data);
        this.publisher.publishMessage(msg);
    }

    hasData = key => {
        return this.#dataTable.has(key);
    }

    deleteData = key => {
        return this.#dataTable.delete(key);
    }

    processDataRequest = (key, cb) => {
        cb(key, this.getData(key));
    }
}