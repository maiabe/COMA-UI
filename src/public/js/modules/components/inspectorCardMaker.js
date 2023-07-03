/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { InspectorCard } from '../../components/inspector/inspectorCard.js';
import { IncludeColumnCard } from '../../components/inspector/inspectorCardComponents/includeColumnCard.js';
import { Publisher, Message, Subscriber } from '../../communication/index.js';
import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import { INSPECTOR_CARD, INSPECTOR_CARD_MAKER, MODULE_MANAGER, INPUT_MANAGER, WORKER_MANAGER } from '../../sharedVariables/constants.js';
import { SearchFields } from '../../sharedVariables/moduleData.js';

/**
 * This class is an intermediary between the Insepctor Card and the Modules. This Object has specific function
 * names that I think were easier to read and understand when creating elements.
 */
export class InspectorCardMaker {
    dataTable;
    constructor(name, color, key) {
        this.dataTable = new Map();
        this.inspectorCard = new InspectorCard(name, color, key);
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler.bind(this));
        this.inspectorCard.publisher.subscribe(this.subscriber);
        this.messageHandlerMap = new Map();
        this.buildMessageHandlerMap();
        this.HF = new HTMLFactory();
    }

    buildMessageHandlerMap() {
        // TODO: Handle messages if necessary
    }

    messageHandler = msg => {
        const messageData = msg.readMessage();
        if (messageData.from === INSPECTOR_CARD && messageData.to !== INSPECTOR_CARD_MAKER) {
            msg.updateFrom(INSPECTOR_CARD_MAKER);
            this.sendMessage(msg);
        }
    }

    /** --- PUBLIC ---
     * Alerts Inspector to maximize Card */
    maximizeCard() {
        this.inspectorCard.maximizeCard();
    }

    /** --- PUBLIC ---
     * Adds a Module Id Field Key Value Card to the Inspector Card
     * Key: 'Module Id', value: key
     * @param {Number} key the module key */
    addInspectorCardIDField(key) {
        this.inspectorCard.addKeyValueCard('Module Id', [key.toString()]);
    }

    /** --- PUBLIC ---
     * Adds a Card to the Inspector Card for any linked nodes. Starts with a single key because it is created at first link.
     * Key: 'Linked Node(s), value: array of keys that are linked
     * @param {Number} key the key to the linked node */
    addInspectorCardLinkedNodeField(key) {
        this.inspectorCard.addDynamicKeyValueCard('Linked Node(s)', [`(${key})`]);
    }

    /** --- PUBLIC ---
     * Adds a Card to the inspector card called Data Linked. Starts as False but changed to true when a link is made in 
     * the GOJS Environment */
    addInspectorCardDataConnectedField() {
        this.inspectorCard.addDynamicKeyValueCard('Data Linked', [false]);
    }



    /** --- PUBLIC ---
     * Emits a Request List of Objects Event for the Input Manager. The HUB will call the callback function when it
     * gets the list of objects. */
    addInspectorCardObjectsDropdown() {
        const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Request List of Objects', { callbackFunction: this.createInspectorCardDropdown.bind(this) });
        this.sendMessage(message);
    }

    /** --- PUBLIC ---
     * Called by the HUB after it gets a list of all objects from the Input Manager.
     * This is not properly implemented. Currently the HUB is not passing a callback function, 
     * @param {Object[]} objectsList This is currently a key:value that is 2 strings. This will likely change when
     *                               the database is set up correctly
     */
    createInspectorCardDropdown(objectsList) {
        this.addData('Objects List', objectsList);
        this.addData('Selected Object', Object.keys(objectsList)[0]);
        const searchCard = this.inspectorCard.addObjectsSearchCard(objectsList);
        // TODO: handle changes in the dropdown list on the search card
    }

    /** --- PUBLIC ---
     * Notifies the inspector card to create the X Axis card
     * @param {stringp[]} headers the names of the fields in the dataset 
     * @param {Number} key the module key 
     * @param {function} addTraceFunction function attached to the add trace button when clicked
     * @returns { 
     * dropdown: HTML select, 
     * labelInput: HTML input, 
     * gridCheckbox: HTML checkbox, 
     * tickCheckbox: HTML checkbox, 
     * addTraceButton: HTML button, 
     * errorDropDown: undefined } This data is passed to the ChartData object and event listeners are applied. */
    addInspectorCardChartXAxisCard(headers, key, addTraceFunction) {
        const title = 'test'; // Change this is this element ever needs to be found by id
        const dropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const labelInput = this.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = this.HF.createNewButton('', '', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addXAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton, addTraceFunction, undefined);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton, errorDropDown: undefined };
    }

    /** --- PUBLIC ---
     * Adds a new trace to the inspector card after a button click
     * @param {HTML Select} dropdown a dropdown of available fields to chart
     * @param {HTML Select} errorDropDown a dropdown of available fields for error in the chart
     */
    addNewTraceToInspectorCard(dropdown, errorDropDown) {
        this.inspectorCard.addChartTrace(dropdown, errorDropDown);
    }

    /** --- PUBLIC ---
     * Notifies the inspector card to create the Y Axis card
     * @param {string[]} headers the names of the fields in the dataset 
     * @param {Number} key the module key 
     * @param {function} addTraceFunction function attached to the add trace button when clicked
     * @returns { 
     * dropdown: HTML select, 
     * labelInput: HTML input, 
     * gridCheckbox: HTML checkbox, 
     * tickCheckbox: HTML checkbox, 
     * addTraceButton: HTML button, 
     * errorDropDown: HTML select } This data is passed to the ChartData object and event listeners are applied.
     */
    addInspectorCardChartYAxisCard(headers, key, addTraceFunction) {
        const errorHeaders = [...headers];
        errorHeaders.unshift('None');
        const title = 'test';
        const dropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const errorDropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], errorHeaders, errorHeaders);
        const labelInput = this.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = this.HF.createNewButton('', '', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addYAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton, addTraceFunction, errorDropDown);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton, errorDropDown: errorDropDown };
    }

    /** --- PUBLIC ---
     * Creates an array of checkboxes for each available data column field. Then these checkboxes are 
     * passed to the inspector card to create an HTML element containing all checkboxes.
     * @param {string[]} headers the names of the headers of the dataset
     * @param {Number} key the key of the module 
     * @returns checkboxes[] so that event listeners can be applied.
     */
    addInspectorCardIncludeColumnCard(headers, key) {
        let checkboxes = [];
        headers.forEach((header, index) => {
            checkboxes.push(this.HF.createNewCheckbox(`includeColumn-checkbox-module${key}-${index}`,
                `includeColumn-checkbox-module${key}-${index}`,
                ['include-column-checkbox'],
                [],
                header,
                header,
                true));
        });
        this.inspectorCard.addIncludeColumnCard(checkboxes);
        return checkboxes;
    }

    /** --- PUBLIC ---
     * Creates a Generate Chart button with a callback
     * @param {Number} key Module Key
     * @param {Function} callbackFN Function that Emits a Create Local Chart Event
     * @returns the button 
     */
    addInspectorCardGenerateChartButton(key, callbackFN) {
        const button = this.HF.createNewButton(`create-line-chart-button-${key}`, `create-line-chart-button-${key}`, [], [], 'button', 'Generate', false);
        button.addEventListener('click', callbackFN);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate Chart: ', button, false);
        return button;
    }

    /** --- PUBLIC ---
     * Creates a Preview Table Button with a callback
     * @param {Nuber} key Module Key 
     * @param {*} callbackFN Function that emits a Create New Local Table Event
     * @returns the button
     */
    addInspectorCardGenerateTablePreviewButton(key, callbackFN) {
        const button = this.HF.createNewButton(`create-table-preview-button-${key}`, `create-table-preview-button-${key}`, [], [], 'button', 'Genereate', false);
        button.addEventListener('click', callbackFN);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Preview Table: ', button, false);
        return button;
    }

    /** --- PUBLIC ---
     * Creates a Generate CSV File Button with a callback. Button is passed ot the 
     * @param {Nuber} key Module Key 
     * @param {*} callbackFN Function that emits a Create New CSV File Event
     * @returns the button */
    addInspectorCardGenerateCSVFileButton(key, callbackFN) {
        const button = this.HF.createNewButton(`create-CSV-button-${key}`, `create-CSV-button-${key}`, [], [], 'button', 'Generate', false);
        button.addEventListener('click', callbackFN);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate CSV File: ', button, false);
        return button;
    }

    addInspectorDataCard() {
        // TODO: Inspector Card for the Data Module has not been implemented correctly yet.
        //       Currently it is just creating a mess of cards identifying fields and datatypes
    }

    /** --- PUBLIC ---
     * Appends a HTML p with description text to the inspector card
     * @param {string} description description of the module */
    addInspectorCardDescription(description) {
        this.inspectorCard.appendToBody(this.HF.createNewParagraph('', '', ['inspector-card-description'], [], description));
    }

    /** --- PUBLIC ---
     * Creates a card for a Composite Module. 
     * @param {Object} groupData JSON representation of the group of modules
     * @param {function} saveModuleCallback this function is called when a module is saved. */
    createInspectorCompositeDetailCard(groupData, saveModuleCallback) {
        this.inspectorCard.addCompositeDetailsCard(groupData, saveModuleCallback);
    }

    /** --- PUBLIC ---
     * Creates a card for the metadata that has the name, datatype, and format. 
     * This card should not be used in production unless a lot of changes are made. The CSS is bad and
     * I'm not sure its that useful
     * @param {Object[]} metadata Object containing all metadata for a dataset. */
    addMetadataCard(metadata) {
        metadata.columnHeaders.forEach(header => {
            this.inspectorCard.addKeyValueCard(header.name, [header.dataType, header.dataFormat]);
        });
    }

    /** --- PUBLIC ---
     * Creates all of the filter cards for a set of data. A filter card is a min/max card and has a range slider.
     * In the future, an additional type of card is necessary for categorical data. 
     * @param {Object} metadata Object containing all metadata for a Data set 
     * @returns Array of functions that can be used to access the data on each specific filter card. */
    addFilterCards(metadata) {
        const filterArray = [];
        metadata?.columnHeaders.forEach(header => {
            filterArray.push(this.inspectorCard.addMinMaxCard(header.name, header.min, header.max, header.dataType, header.dataFormat, header.changeDataTypeFunction));
        });
        return filterArray;
    }

    /** --- PUBLIC ---
     * This can add a new columns to the filter card in the inspector.
     * @param {object[]} columnHeaders array of data fields to add to the filter card.
     * @param {function[]} filterArray Existing array of functions that get data from the filter cards */
    addCardsToExistingFilter(columnHeaders, filterArray) {
        columnHeaders.forEach(col => {
            filterArray.push(this.inspectorCard.addMinMaxCard(col.name, col.min, col.max, col.dataType, col.dataFormat, col.changeDataTypeFunction))
        });
    }

    /** --- PUBLIC ---
     * Adds a card for converting data fields.
     * @param {Object} metadata Object representing all metadata for the dataset 
     * @returns the conversion card */
    addConversionCard(metadata) {
        return this.inspectorCard.addConversionCard(metadata);
    }

    /** --- PRIVATE ---
     * This generates a flex container and appends a text field followed by an HTML element. The HTML element is already
     * generated before calling and passed as an argument.
     * @param {string} text the label
     * @param {HTML element} valueDiv the HTML element to add to the inspector card. i.e. button or select */
    #addDynamicInspectorCardFieldWithPrebuiltValueDiv(text, valueDiv) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.HF.createNewParagraph('', '', ['inspector-card-key-text'], [], text);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
    }

    /** --- PUBLIC ---
     * Calls the InspectorCard and updates a key value pair with a new value and changes the card.
     * @param {string} key the key in the dataTable
     * @param {any} value the new value */
    updateInspectorCardDynamicField(key, value) {
        this.inspectorCard.updateDynamicField(key, value);
    }

    /** --- PUBLIC ---
     * Removes an inspector card from the DOM
     */
    deleteInspectorCard() {
        this.inspectorCard.getCard().remove();
    }

    /** --- PRIVATE ---
     * Creates a horizal flex container HTML Element
     * @returns the HTML element
     */
    #createInspectorCardHorizontalFlexContainer = () => this.HF.createNewDiv('', '', ['inspector-card-horizontal-flex-container'], []);


    /** --- PUBLIC ---
     * Creates the HTML elements for the file upload section and binds a callback function to the button.
     * @param {function} callback validates the file on the CSV module
     * @param {number} key id of the CSV module that created this.
     */
    createFileUploadField(callback, key) {
        const uploadWrapper = this.HF.createNewDiv('', '', ['uploadWrapper'], []);
        this.inspectorCard.appendToBody(uploadWrapper);
        const upload = this.HF.createNewFileInput(`upload_csv-${key}`, 'upload_csv', [], [], 'file', false);
        uploadWrapper.append(upload);
        upload.addEventListener('change', callback);

        this.dataTable.set('readFileButton', this.HF.createNewButton('read-file-button', 'read-file-button', [], [], 'button', 'Read File', true));
        uploadWrapper.appendChild(this.getField('readFileButton'));
        this.getField('readFileButton').addEventListener('click', () => {
            const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Read File Event', {
                type: 'csv',
                elementId: 'upload_csv-' + key,
                moduleKey: key
            });
            this.sendMessage(message);
        });
        

        // Expand the size of the inspector card
        this.inspectorCard.maximizeCard();
    }

    /** --- PUBLIC ---
     * Adds a Search Form to the Search module inspector card
     * @param {key number} key of the search module
     */
    addSearchFormFields(key) {
        //---------- Create Search Card Wrapper
        const searchCardWrapper = this.HF.createNewDiv('', '', ['search-card-wrapper'],
                                            [{ style: 'display', value: 'flex' },
                                            { style: 'flex-direction', value: 'column' },
                                            { style: 'width', value: '100%' },
                                        ]);
         
        //---------- Create Search Form Card
        const formName = { name: 'search-form-' + key, className: 'search-form', submitButton: 'Confirm' };
        const defaultFields = SearchFields.fieldsDict[0].fields;

        //const defaultFields = this.#handleRemoteDataFields(key, SearchFields.fieldsDict[0].fields);
        this.dataTable.set('SearchFormCard_' + key, this.inspectorCard.addSearchFormCard(key, formName, defaultFields, SearchFields.fieldTooltip));
        

        //---------- Create Query Type Options
        this.dataTable.set('QueryTypeSelectCard', this.inspectorCard.addQueryTypeSelect(searchCardWrapper, { key: 'query-type-' + key, value: 'Query Type ' }, SearchFields.types, SearchFields.queryTypeTooltip));
        
        // Create Form Field Append
        /*var formFieldOptions = SearchFields.fieldsDict[0].fields;
        this.dataTable.set('FormFieldAppendSelectCard', this.inspectorCard.addFormFieldAppend(searchCardWrapper, { key: 'add-search-field', value: 'Add Field: ' }, formFieldOptions));*/

        //---------- Append Form Card to this inspector card
        var searchFormCard = this.getField('SearchFormCard_' + key);
        searchCardWrapper.appendChild(searchFormCard.getCard().wrapper);
        this.inspectorCard.appendToBody(searchCardWrapper);

        /********************************** js events ***********************************/
        /**
         * Search Form Submit Event
         * */
        document.querySelector('#' + formName.name + '-btn').addEventListener('click', (e) => {
            e.preventDefault();

            const searchForm = document.querySelector('#' + formName.name);
            const formData = new FormData(searchForm);
            const entriesToDelete = [];
            for (const entry of formData.entries()) {
                if (!entry[1]) {
                    entriesToDelete.push(entry[0]);  
                }
            }
            for (const key of entriesToDelete) {
                formData.delete(key);
            }
            // get queryEntries
            const entries = {};
            if (formData) {
                formData.forEach((value, key) => { entries[key] = value });
            }
            // get query type
            const dropdown = document.querySelector("#query-type-" + key);
            var queryType = "lightcurve";
            if (dropdown) {
                queryType = dropdown.options[dropdown.value].text;
            }
            
            const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Search Form Submit Event',
            {
                /*type: 'form',*/
                moduleKey: key,
                queryType: queryType,
                queryEntries: entries
            });
            this.sendMessage(message);
        });

        /**
         * Update Search Form Field event (on query type change)
         * */
        document.querySelector('#query-type-' + key).addEventListener('change', (e) => {
            const dropdown = e.target;
            var queryType = dropdown.options[dropdown.selectedIndex];
            var fields = SearchFields.fieldsDict[queryType.value].fields;

            // update query type tooltip content
            var match = SearchFields.queryTypeTooltip.filter(x => x.type == queryType.text)[0];
            var description = "Query Type: " + queryType.text;
            if (match) {
                description = match.description;
            }
            var tooltipText = dropdown.closest('div').querySelector('.tooltip-text');
            tooltipText.textContent = description;

            // update form fields
            const formCard = this.getField('SearchFormCard_' + key);
            this.inspectorCard.updateSearchFormFields(formCard, fields, SearchFields.fieldTooltip);
        });
         
        /**
         * Set datepicker configuration for begin and end dates to be in a range mode
         * */
        var endInputId = '#' + formName.name + ' #' + 'date-end';
        /*var targetDiv = this.getField('SearchFormCard_' + key).getCard().wrapper;
        console.log(targetDiv);*/
        // Initialize flatpickr with the range plugin
        flatpickr('.date-range', {
            mode: 'range',
            dateFormat: 'Y-m-d', // Set the desired date format (ISO format: YYYY-MM-DD)
            plugins: [new rangePlugin({ input: endInputId })],
            //appendTo: targetDiv,
        });

        // Expand the size of the inspector card
        this.inspectorCard.maximizeCard();
    }


    // --------------------------- Table Module ---------------------------
    updateTableModuleInspectorCard(moduleKey, moduleData, fields) {
        var includeColumnCard = new IncludeColumnCard(moduleKey, fields, 'View Table');
        this.inspectorCard.appendToBody(includeColumnCard.getCard().wrapper);

        // add viewTable event listener
        document.querySelector('#include-column-card-view-button-' + moduleKey)
            .addEventListener('click', (e) => {
                // create table columns object to render
                var columnFields = e.target.closest('div').previousElementSibling;
                var checkedColumns = columnFields.querySelectorAll('input[type="checkbox"]:checked');
                var columns = [];
                checkedColumns.forEach((checkedColumn) =>
                {
                    var columnName = checkedColumn.getAttribute('name');
                    columns.push(columnName);
                });

                var data = undefined;
                if (moduleData.remoteData) {
                    data = {
                        type: 'form',
                        moduleKey: moduleKey,
                        remoteData: moduleData.remoteData,
                        queryType: moduleData.queryType,
                        queryEntries: moduleData.queryEntries,
                        columnsToRender: columns,
                    };
                    // send message with the query information
                    const message = new Message(WORKER_MANAGER, INSPECTOR_CARD_MAKER, 'Fetch Remote Table Data Event', data);
                    this.sendMessage(message);
                }
                else {
                    data = {
                        moduleKey: moduleKey,
                        remoteData: moduleData.remoteData,
                        fileId: moduleData.fileId,
                        columnsToRender: columns,
                        //columnHeaders: columns
                    };
                    // send message with the query information
                    const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Fetch Local Table Data Event', data);
                    this.sendMessage(message);
                }
            });
    }


    getField = key => this.dataTable.get(key);


    /** --- PUBLIC ---
     * Gets the wrapper element of the card
     * @returns the HTML element for the card
     */
    getCard = () => this.inspectorCard.getCard();

    sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}