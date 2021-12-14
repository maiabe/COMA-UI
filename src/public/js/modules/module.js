import { Publisher, Message } from '../communication/index.js';
import { invalidVariables, varTest } from '../errorHandling/errorHandlers.js';
import { GM } from '../main.js';
import { InspectorCard } from '../components/inspector/inspectorCard.js';

export class Module {
    #command;
    #dataTable;
    inspectorCard;

    constructor(type, color, shape, command, name, imagePath, inports, outports, key, description) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.inspectorCard = new InspectorCard(name, color);
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
            this.addData('type', type, true, type, false);
            this.addData('image', imagePath, false, '', false);
            this.addData('color', color, false, '', false);
            this.addData('shape', shape, false, '', false);
            this.addData('inports', inports, false, '', false);
            this.addData('outports', outports, false, '', false);
            this.addData('name', name, true, name, false);
            this.addData('key', key, true, -1, false);
            this.addData('command', command, false, '', false);
            this.addData('description', description);
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
        return this.inspectorCard.getCard();
    };

    setInspectorCardDescriptionText(text) {
        this.inspectorCard.appendToBody(GM.HF.createNewParagraph('', '', ['inspector-card-description'], [], text));
    }

    addInspectorCardIDField() {
        this.inspectorCard.addKeyValueCard('Module Id', [this.getData('key').toString()]);
    }

    addInspectorCardDataConnectedField() {
        this.inspectorCard.addDynamicKeyValueCard('Data Linked', [false]);
    }

    addInspectorCardLinkedNodeField(key) {
        this.inspectorCard.addDynamicKeyValueCard('Linked Node(s)', [`(${key})`]);
    }
    addInspectorCardChartAxisCard(title, headers) {
        const dropDown = GM.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], headers, headers);
        const labelInput = GM.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        this.inspectorCard.addKeyValueCard(title, [dropDown, labelInput]);
        return { dropdown: dropDown, labelInput: labelInput };
    }

    addInspectorCardIncludeColumnCard(headers) {
        let checkboxes = [];
        headers.forEach((header, index) => {
            checkboxes.push(GM.HF.createNewCheckbox(`includeColumn-checkbox-module${this.getData('key')}-${index}`,
                `includeColumn-checkbox-module${this.getData('key')}-${index}`,
                ['include-column-checkbox'],
                [],
                header,
                header,
                true));
        });
        this.inspectorCard.addIncludeColumnCard(checkboxes);
        return checkboxes;
    }

    addInspectorCardGenerateChartButton() {
        const button = GM.HF.createNewButton(`create-line-chart-button-${this.getData('key')}`, `create-line-chart-button-${this.getData('key')}`, [], [], 'button', 'Generate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate Chart: ', button, false);
        return button;
    }

    addInspectorCardGenerateTablePreviewButton() {
        const button = GM.HF.createNewButton(`create-table-preview-button-${this.getData('key')}`, `create-table-preview-button-${this.getData('key')}`, [], [], 'button', 'Genereate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Preview Table: ', button, false);
        return button;
    }

    addInspectorCardGenerateCSVFileButton() {
        const button = GM.HF.createNewButton(`create-CSV-button-${this.getData('key')}`, `create-CSV-button-${this.getData('key')}`, [], [], 'button', 'Genereate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate CSV File: ', button, false);
        return button;
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
    }

    /** Call this when you want to create an inspector card keyValueCard object with a dropdown or other precreated HTML element */
    #addDynamicInspectorCardFieldWithPrebuiltValueDiv(key, valueDiv) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.#createInspectorCardKeyText(key);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
    }

    updateInspectorCardDynamicField(key, value) {
        this.inspectorCard.updateDynamicField(key, value);
    }

    createInspectorCardAxisCard(whichAxis, dropdownHeaders) {
        this.inspectorCard.addAxisCard(whichAxis, dropdownValues);
    }

    #createInspectorCardHorizontalFlexContainer = () => GM.HF.createNewDiv('', '', ['inspector-card-horizontal-flex-container'], []);
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


}
