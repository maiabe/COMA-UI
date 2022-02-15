import { Publisher, Message } from '../communication/index.js';
import { invalidVariables, varTest } from '../errorHandling/errorHandlers.js';
import { GM } from '../main.js';
import { InspectorCardMaker } from './components/inspectorCardMaker.js';
import { PopupContentMaker } from './components/popupContentMaker.js';


export class Module {
    #command;
    #dataTable;
    inspectorCardMaker;
    popupContentMaker;

    constructor(type, color, shape, command, name, imagePath, inports, outports, key, description) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.inspectorCardMaker = new InspectorCardMaker(name, color, key);
        this.popupContentMaker = new PopupContentMaker();
        this.setInitialDataValues(type, color, shape, command, name, imagePath, inports, outports, key, description);
    };

    /**
     * This data is mostly used by gojs to make the graph node.
     * @param {string} type type of module
     * @param {string} color color of module
     * @param {string} shape shape of module 
     * @param {string} command server command associated with module
     * @param {string} name name of the module
     * @param {string} imagePath path to the image displayed by the module
     * @param {array} inports array of inports
     * @param {array} outports array of outports
     * @param {number} key key of module
     */
    setInitialDataValues = (type, color, shape, command, name, imagePath, inports, outports, key, description) => {
        if (type && color && shape && command && name && imagePath && inports && outports && key) {
            this.addData('type', type,);
            this.addData('image', imagePath);
            this.addData('color', color);
            this.addData('shape', shape);
            this.addData('inports', inports);
            this.addData('outports', outports);
            this.addData('name', name);
            this.addData('key', key);
            this.addData('command', command);
            this.addData('description', description);
        } else console.log(`ERROR: Missing Parameter. type: ${type}, imagePath: ${imagePath}, color: ${color}, shape: ${shape}, command: ${command}, name: ${name}, inports: ${inports}, outports: ${outports}, key: ${key}. -- Module -> setInitialDataValues`);
    };

    updateSelectedObject = event => {
        this.setData('Selected Object', event.target.value);
    }

    /** Gets the command associated with this module */
    getCommand = () => {
        if (this.#command) {
            if (this.#command !== '') return this.#command;
        } else console.log(`ERROR: command == ${this.#command}. -- Module -> getCommand`);
        return undefined;
    }

    /** Sets the popup content associated with this module. This is the generic function and will likely be overriden in the child classes. */
    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        popupContent.appendChild(GM.HF.createNewParagraph('', '', [], [], this.getData('name')));
        this.addData('popupContent', popupContent, false, '', false);
    }

    /**
     * Adds data to this modules data hash table.
     * @param {string} key the key for the hash table 
     * @param {*} value the value to add to the hash table, associated with the key
     * @param {boolean} allowInspection is this a value that should be added to the inspector for this module (true/false)
     * @param {string} inspectorText the text to display in the inspector
     * @param {boolean} modify true if user can modify this value in the inspector, false if it is read only.
     */
    addData = (key, value) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(value, 'value', 'any')], 'Module', 'addData')) return;
        else this.#dataTable.set(key, value);
    }

    /**
     * Updates a value for a key in the hash table.
     * @param {string} key Key for locaing value in hash table
     * @param {*} data the data value to update
     * @param {string} inspectorText inspector text to update for this value.
     */
    setData = (key, data) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(data, 'data', 'any')], 'Module', 'setDataValue')) return undefined;
        this.#dataTable.set(key, data);
    }

    updateMetadata = metadata => {
        if (this.#dataTable.has('metadata')) this.processMetadataChange(metadata);
        else this.processNewMetadata(metadata);
    }

    processMetadataChange(metadata) {
        console.log('Process Metadata Change Stub');
    }

    processNewMetadata(metadata){
        console.log('Process New Metadata Stub');
    }
    /**
     * Sets a key value pair in the dataTable hash table.
     * @param {string} key key for the hash table
     * @param {*} data value to set in the hash table for this key.
     * @returns this module.
     */
    setDataValue = (key, data) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(data, 'data', 'any')], 'Module', 'setDataValue')) return undefined;
        this.#dataTable.set(key, data);
        return this;
    }

    /**
     * Gets a value associated with a key from this module's datatable.
     * @param {string} key 
     * @returns the value if found.
     */
    getData = key => {
        if (key != undefined && key !== '') {
            if (this.#dataTable.has(key)) return this.#dataTable.get(key);
            else console.log(`ERROR: No data found for key: ${key}. -- Module -> getData`);
        } else console.log(`ERROR: key: ${key}. -- Module -> getData`);
        return undefined;
    }

    /**
     * Iterates the data table and returns all data that is flagged as allowInspection
     * @returns the inspector Content if found. Empty Map if not.
     */
    getInspectorContent = () => this.inspectorCardMaker.getCard();;

    getInspectorCard = () => this.inspectorCardMaker.inspectorCard;
    /**
     * Gets the content to populate a popup associated with this module.
     * @returns the content to populate the popup associated with this module
     */
    getPopupContent = () => {
        return { color: this.getData('color'), content: this.getData('popupContent'), headerText: this.getData('name') };
    }

    updatePopupData = field => {
        console.log(`Update Popup for ${field} has not been implemented for this module.`);
    }

    setLinkedDataKey(key) {
        this.addData('linkedDataKey', key, false, '', false);
    }

    destroyOldKey() {
        if (this.#dataTable.has('oldKey')) this.#dataTable.delete('oldKey');
    }


}
