import {Publisher, Message} from '../communication/communication.js';
import { invalidVariables, varTest } from '../../scripts/errorHandlers.js';
import {GM} from '../../scripts/main.js';

export class Module {
    #command;
    #dataTable;

    constructor(type, color, shape, command, name, imagePath, inports, outports) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.popupContent;
        this.setInitialDataValues(type, color, shape, command, name, imagePath, inports, outports);
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
     */
    setInitialDataValues = (type, color, shape, command, name, imagePath, inports, outports) => {
        if (type && color && shape && command && name && imagePath && inports && outports) {
            this.addData('type', type, true, type, false);
            this.addData('image', imagePath, false, '', false);
            this.addData('color', color, false, '', false);
            this.addData('shape', shape, false, '', false);
            this.addData('inports', inports, false, '', false);
            this.addData('outports', outports, false, '', false);
            this.addData('name', name, true, name, false);
            this.addData('key', -1, true, -1, false);
            this.addData('command', command, false, '', false);
        } else console.log(`ERROR: Missing Parameter. type: ${type}, imagePath: ${imagePath}, color: ${color}, shape: ${shape}, command: ${command}, name: ${name}, inports: ${inports}, outports: ${outports}. -- Module -> setInitialDataValues`);
    };

    /** Gets the command associated with this module */
    getCommand = () => {
        if (this.#command) {
            if (this.#command !== '') return this.#command;
        } else console.log(`ERROR: command == ${this.#command}. -- Module -> getCommand`);
        return undefined;
    }

    /** Sets the popup content associated with this module. This is the generic function and will likely be overriden in the child classes. */
    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.popupContent.appendChild(GM.HF.createNewParagraph('', '', [], [], this.getData('name')));
    }

    /**
     * Adds data to this modules data hash table.
     * @param {string} key the key for the hash table 
     * @param {*} value the value to add to the hash table, associated with the key
     * @param {boolean} allowInspection is this a value that should be added to the inspector for this module (true/false)
     * @param {string} inspectorText the text to display in the inspector
     * @param {boolean} modify true if user can modify this value in the inspector, false if it is read only.
     */
    addData = (key, value, allowInspection, inspectorText, modify) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(value, 'value', 'any'), varTest(allowInspection, 'allowInspection', 'boolean'), varTest(inspectorText, 'inspectorText', 'any'), varTest(modify, 'modify', 'boolean')], 'Module', 'addData')) return;
        else this.#dataTable.set(key, { data: value, inspector: { allowInspection: allowInspection, text: inspectorText, modify: modify, modifyType: 'text input' } });
    }

    /**
     * Updates a value for a key in the hash table.
     * @param {string} key Key for locaing value in hash table
     * @param {*} data the data value to update
     * @param {string} inspectorText inspector text to update for this value.
     */
    setData = (key, data, inspectorText) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(data, 'data', 'any'), varTest(inspectorText, 'inspectorText', 'any')], 'Module', 'setData')) return;
        if (this.#dataTable.has(key)) {
            const val = this.#dataTable.get(key);
            val.data = data;
            val.inspector.text = inspectorText.toString();
        } else printErrorMessage(`No data found for the key`, `key: ${key}. -- Module -> setData`);
    }

    /**
     * Sets a key value pair in the dataTable hash table.
     * @param {string} key key for the hash table
     * @param {*} data value to set in the hash table for this key.
     * @returns this module.
     */
    setDataValue = (key, data) => {
        if (invalidVariables([varTest(key, 'key', 'string'), varTest(data, 'data', 'any')], 'Module', 'setDataValue')) return undefined;
        const val = this.#dataTable.get(key);
        val.data = data;
        if (val.inspector.allowInspection) val.inspector.text = data.toString(); // Update inspector text if necessary
        return this;
    }

    /**
     * Gets a value associated with a key from this module's datatable.
     * @param {string} key 
     * @returns the value if found.
     */
    getData = key => {
        if (key != undefined && key !== '') {
            if (this.#dataTable.has(key)) return this.#dataTable.get(key).data;
            else console.log(`ERROR: No data found for key: ${key}. -- Module -> getData`);
        } else console.log(`ERROR: key: ${key}. -- Module -> getData`);
        return undefined;
    }

    /**
     * Iterates the data table and returns all data that is flagged as allowInspection
     * @returns the inspector Content if found. Empty Map if not.
     */
    getInspectorContent = () => {
        const inspectorContent = new Map();
        for (let entry of this.#dataTable) {
            const key = entry[0];
            const value = entry[1];
            if (value.inspector.allowInspection) {
                inspectorContent.set(key, { text: value.inspector.text, modify: value.inspector.modify, modifyType: value.inspector.modifyType });
            }
        }
        return inspectorContent;
    };

    /**
     * Gets the content to populate a popup associated with this module.
     * @returns the content to populate the popup associated with this module
     */
    getPopupContent = () => {
        return { color: this.getData('color'), content: this.popupContent, headerText: this.getData('name') };
    }

    updatePopupData = field => {
        console.log(`Update Popup for ${field} has not been implemented for this module.`);
    }

    /** THESE WERE FUNCTIONS PROPOSED BY JAN AND MAY OR MAY NOT BE IMPLEMENTED */
    // provides = () => { };
    // requires = () => { };
    // requirements = () => { };
    // inputs_OK = () => { };
    // run = () => { };
    // output_status = () => { };
    // get_output = name => { };
    // connect_input = () => { };
    // connections = () => { };
    // updatePopupContent = () => { };
    // updateInspectorContent = () => {
    //     INS.updateContent(this.key);
    // };

}
