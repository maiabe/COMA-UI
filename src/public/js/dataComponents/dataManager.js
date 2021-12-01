import { Publisher, Message } from "../communication/index.js";
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { MODULE_MANAGER, DATA_MANAGER, INSPECTOR } from "../sharedVariables/index.js";
import { InspectorCard } from "../components/inspector/inspectorCard.js";
import { GM } from "../main.js";

export class DataManager {

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
        if (invalidVariables([varTest(msg, 'msg', 'object')], 'DataManager', '#sendMessage')) return false;
        else this.publisher.publishMessage(msg);
    }

    /**
     * Gets data associated with a key from the hash table if it exists.
     * @param {number} key the key to the data associated with a module
     * @returns the data associated with the key if found.
     */
    getData = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'DataManager', 'getData')) return undefined;
        if (this.#dataTable.has(key)) return this.#dataTable.get(key).data;
        else console.log(`ERROR: No data found for key: ${key}. -- Data Manager -> getData`);
        return undefined;
    }

    /**
     * Adds to the data table. If the specified key is in the table, it will be overwritten.
     * @param {number} key key into the data table. It is also the key to the module associated with this data.
     * @param {object} val the value linked to the key. This is the "data".
     */
    addData = (key, val) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(val, 'val', 'object')], 'DataManager', 'addData')) return false;
        if (this.#dataTable.has(key)) console.log(`Data Table already has key: ${key} in it. Will Overwrite. -- DataManager -> addData.`);
        this.#dataTable.set(key, { data: val, card: this.#createInspectorDataCard(key, val) });
        // Notify Module Manager that new data was added to the table.
        this.#sendMessage(new Message(MODULE_MANAGER, DATA_MANAGER, 'New Data Loaded Event', { moduleKey: key }));
        return true;
    }

    /**
     * Checks to see if any data exists for a specific module key.
     * @param {number} key 
     * @returns true if data exists, false if not.
     */
    hasData = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'DataManager', 'hasData')) return false;
        else return this.#dataTable.has(key);
    }
    /**
     * Deletes data from the datatable.
     * @param {number} key identifying  
     * @returns true if successful, false if not.
     */
    deleteData = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'DataManager', 'deleteData')) return false;
        console.log(this.#dataTable.get(key));
        this.#removeDataCard(this.#dataTable.get(key).card);
        return this.#dataTable.delete(key);
    }

    #removeDataCard = card => card.remove();
    /**
     * Data requests come with a key and a callback. All Data is returned as a parameter to this callback function.
     * @param {number} key the key to find the data.
     * @param {function} callbackFunction the function to call and pass data as a parameter.
     */
    processDataRequest = (key, callbackFunction) => {
        console.log('pdr');
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(callbackFunction, 'callbackFunction', 'function')], 'DataManager', 'processDataRequest')) return;
        else callbackFunction(key, this.getData(key));
    }

    swapDataKeys(oldKey, newKey) {
        const data = this.getData(oldKey);
        if (data) {
            this.deleteData(oldKey);
            this.addData(newKey, data);
            return true;
        }
        return false;
    }

    #createInspectorDataCard(key, data) {
        const card = new InspectorCard('Data Card', 'orange');
        this.#createCardDescription(card);
        this.#sendMessage(new Message(INSPECTOR, DATA_MANAGER, 'New Data Card Event', { moduleKey: key, card: card.getCard() }));
        return card.getCard();
    }

    #createCardDescription(card) {
        card.appendToBody(GM.HF.createNewParagraph('', '', [], [], 'This data card will have information pertaining to this specific entry in the data table.'));
    }
}