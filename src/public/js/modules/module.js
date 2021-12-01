import { Publisher, Message } from '../communication/index.js';
import { invalidVariables, varTest } from '../errorHandling/errorHandlers.js';
import { GM } from '../main.js';
import { InspectorCard } from '../components/inspector/inspectorCard.js';

export class Module {
    #command;
    #dataTable;
    inspectorCard;

    constructor(type, color, shape, command, name, imagePath, inports, outports, key) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.popupContent;
        this.inspectorCard = new InspectorCard(name, color);
        this.setInitialDataValues(type, color, shape, command, name, imagePath, inports, outports, key);
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
    setInitialDataValues = (type, color, shape, command, name, imagePath, inports, outports, key) => {
        if (type && color && shape && command && name && imagePath && inports && outports && key) {
            this.addData('type', type, true, type, false);
            this.addData('image', imagePath, false, '', false);
            this.addData('color', color, false, '', false);
            this.addData('shape', shape, false, '', false);
            this.addData('inports', inports, false, '', false);
            this.addData('outports', outports, false, '', false);
            this.addData('name', name, true, name, false);
            this.addData('key', key, true, -1, false);
            this.addData('command', command, false, '', false);
        } else console.log(`ERROR: Missing Parameter. type: ${type}, imagePath: ${imagePath}, color: ${color}, shape: ${shape}, command: ${command}, name: ${name}, inports: ${inports}, outports: ${outports}, key: ${key}. -- Module -> setInitialDataValues`);
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
        // const inspectorContent = new Map();
        // for (let entry of this.#dataTable) {
        //     const key = entry[0];
        //     const value = entry[1];
        //     if (value.inspector.allowInspection) {
        //         inspectorContent.set(key, { text: value.inspector.text, modify: value.inspector.modify, modifyType: value.inspector.modifyType });
        //     }
        // }
        return this.inspectorCard.getCard();
    };

    setInspectorCardDescriptionText(text) {
        this.inspectorCard.appendToBody(GM.HF.createNewParagraph('','', ['inspector-card-description'], [], text));
    }
    
    addInspectorCardIDField() {
        this.#addInspectorCardField('Module Id: ', this.getData('key').toString(), false);
    }

    addInspectorCardDataConnectedField() {
        this.#addInspectorCardField('Data Linked: ', false,  true)
    }

    addInspectorCardLinkedNodeField(key) {
        this.#addInspectorCardField('Linked Node(s): ', `(${key})`, true);
    }
    addInspectorCardXAxisDropDown(headers) {
        const dropDown = GM.HF.createNewSelect(`x-axis-selector-${this.getData('key')}`, `x-axis-selector-${this.getData('key')}`, [], [], headers, headers);
        this.#addInspectorCardFieldWithPrebuiltValueDiv('X Axis Data: ', dropDown, true);
    }

    addInspectorCardYAxisDropDown(headers) {
        const dropDown = GM.HF.createNewSelect(`y-axis-selector-${this.getData('key')}`, `y-axis-selector-${this.getData('key')}`, [], [], headers, headers);
        this.#addInspectorCardFieldWithPrebuiltValueDiv('Y Axis Data: ', dropDown, true);
    }

    addInspectorCardGenerateChartButton() {
        const button = GM.HF.createNewButton(`create-line-chart-button-${this.getData('key')}`, `create-line-chart-button-${this.getData('key')}`, [], [], 'button', 'Generate', false);
        this.#addInspectorCardFieldWithPrebuiltValueDiv('Generate Chart: ', button, false);
        console.log('here');
    }

    #createInspectorCardKeyText = text => GM.HF.createNewParagraph('', '', ['inspector-card-key-text'], [], text);
    #createInspectorCardValueText = text => GM.HF.createNewParagraph('', '', ['inspector-card-value-text'], [], text);
    
    #addInspectorCardField(key, value, dynamic) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.#createInspectorCardKeyText(key);
        const valueDiv = this.#createInspectorCardValueText(value);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
        if (dynamic) this.inspectorCard.storeDynamicField(key, valueDiv, container);
    }

    #addInspectorCardFieldWithPrebuiltValueDiv(key, valueDiv, dynamic) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.#createInspectorCardKeyText(key);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
        if (dynamic) this.inspectorCard.storeDynamicField(key, valueDiv, container);
    }

    updateInspectorCardDynamicField(key, value) {
        this.inspectorCard.updateDynamicField(key, this.#createInspectorCardValueText(value));
    }


    #createInspectorCardHorizontalFlexContainer = () => GM.HF.createNewDiv('', '', ['inspector-card-horizontal-flex-container'], []);
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


}
