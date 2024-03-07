/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { InspectorCard } from '../../components/inspector/inspectorCard.js';
import { IncludeColumnCard } from '../../components/inspector/inspectorCardComponents/includeColumnCard.js';
import { Publisher, Message, Subscriber } from '../../communication/index.js';
import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
/*import { INSPECTOR_CARD, INSPECTOR_CARD_MAKER, MODULE_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, WORKER_MANAGER } from '../../sharedVariables/constants.js';
import { DatasetTypes, DatasetFields, SearchFields, DefaultAxis } from '../../sharedVariables/moduleData.js';*/
import {
    INSPECTOR_CARD, INSPECTOR_CARD_MAKER, MODULE_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, PROCESSOR_MANAGER, WORKER_MANAGER,
    DatasetTypes, DatasetFields, SearchFields, DefaultAxes,
} from '../../sharedVariables/index.js'
import g from '../../dataComponents/charts/lil-gui.module.min.js';


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
        const buttonWrapper = this.HF.createNewDiv('', '', ['generate-chart-button-wrapper'], []);
        const button = this.HF.createNewButton(`generate-chart-button-${key}`, `generate-chart-button-${key}`, ['generate-chart-button'], [], 'button', 'Generate Chart', false);
        buttonWrapper.appendChild(button);
        this.inspectorCard.appendToBody(buttonWrapper);
        button.addEventListener('click', callbackFN);
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


    createCSVModuleInspectorCard(callback, moduleKey) {
        const contentWrapper = this.HF.createNewDiv('', '', ['wrapper', 'csv-inspector-wrapper'], []);
        const datasetTypeWrapper = this.HF.createNewDiv('', '', ['wrapper', 'dataset-type-wrapper'], []);
        const objectsDropdownWrapper = this.HF.createNewDiv(`objects-dropdown-wrapper-${moduleKey}`, '', ['wrapper', 'objects-dropdown-wrapper'], []);
        const uploadWrapper = this.HF.createNewDiv('', '', ['wrapper', 'upload-wrapper'], []);

        contentWrapper.appendChild(datasetTypeWrapper);
        contentWrapper.appendChild(objectsDropdownWrapper);
        contentWrapper.appendChild(uploadWrapper);
        this.inspectorCard.appendToBody(contentWrapper);
        this.dataTable.set(`CSVInspectorCard_${moduleKey}`, contentWrapper);

        // Create DatasetType dropdown
        const options = DatasetTypes.map(ds => { return ds.type });
        options.push('other');
        const datasetTypeLabel = this.HF.createNewLabel('', '', '', ['dataset-type-label'], [], 'Dataset Type: ');
        const datasetTypeDropdown = this.HF.createNewSelect('', '', ['dataset-type-dropdown'], [], options, options);
        datasetTypeWrapper.appendChild(datasetTypeLabel);
        datasetTypeWrapper.appendChild(datasetTypeDropdown);

        // Create objects dropdown field
        const objectLabelDiv = this.HF.createNewDiv('', '', ['object-label-wrapper'], []);
        const objectLabel = this.HF.createNewLabel('', '', `csv-objects-input-${moduleKey}`, ['objects-label'], [], 'Objects: ');
        objectLabelDiv.appendChild(objectLabel);
        objectsDropdownWrapper.appendChild(objectLabelDiv);

        const objectInputDiv = this.HF.createNewDiv('', '', ['object-input-wrapper'], []);
        let textInput = this.HF.createNewTextInput(`csv-objects-input-${moduleKey}`, 'objects', ['typeahead-input', 'objects-input'], [{ style: 'border', value: 'inset' }], 'text', '');
        textInput.setAttribute('remote', true);
        const resultContainer = this.HF.createNewDiv('', '', ['typeahead-result-container'], [{ style: 'display', value: "none" }]);
        objectInputDiv.appendChild(textInput);
        objectInputDiv.appendChild(resultContainer);
        objectsDropdownWrapper.appendChild(objectInputDiv);

        // Create CSV load component
        const upload = this.HF.createNewFileInput(`upload_csv-${moduleKey}`, 'upload_csv', [], [], 'file', false);
        uploadWrapper.appendChild(upload);

        upload.addEventListener('change', callback);

        this.dataTable.set('readFileButton', this.HF.createNewButton('read-file-button', 'read-file-button', ['read-file-button', 'button'], [], 'button', 'Read File', true));
        uploadWrapper.appendChild(this.getField('readFileButton'));
        this.getField('readFileButton').addEventListener('click', (e) => {
            const objectInput = e.target.closest('.csv-inspector-wrapper').querySelector('.objects-input');
            const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Read File Event', {
                fileId: 'upload_csv-' + moduleKey,
                //elementId: inspectorId,
                moduleKey: moduleKey,
                fileType: 'csv',
                objectName: objectInput.value
            });
            this.sendMessage(message);
        });

        // Expand the size of the inspector card
        this.inspectorCard.maximizeCard();
    }

    addCSVObjectsFieldFunction(moduleKey) {
        const csvInspectorWrapper = this.getField(`CSVInspectorCard_${moduleKey}`);
        const objectInputField = csvInspectorWrapper.querySelector(`#csv-objects-input-${moduleKey}`);

        this.inspectorCard.addCSVObjectFieldFunction(moduleKey, objectInputField);
        //this.inspectorCard.maximizeCard();
    }

    /** --- PUBLIC ---
     * Creates the HTML elements for the file upload section and binds a callback function to the button.
     * @param {function} callback validates the file on the CSV module
     * @param {number} key id of the CSV module that created this.
     */
    #createFileUploadField(callback, key) {
        const uploadWrapper = this.HF.createNewDiv('', '', ['upload-wrapper'], []);
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
        
        return uploadWrapper;
    }

    // --------------------------- Search Module ---------------------------

    /** --- PUBLIC ---
     * Adds a Search Form to the Search module inspector card
     * @param {key number} key of the search module
     */
    addSearchFormFields(key) {
        console.log(key);
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
        this.dataTable.set(`SearchFormCard_${key}`, this.inspectorCard.addSearchFormCard(key, formName, defaultFields));

        //---------- Create Query Type Options
        const options = DatasetTypes.map(dt => { return dt.type });
        this.dataTable.set(`QueryTypeSelectCard_${key}`, this.inspectorCard.addQueryTypeSelect(searchCardWrapper, { key: 'query-type-' + key, value: 'Query Type ' }, options, SearchFields.queryTypeTooltip));
        
        // Create Form Field Append
        /*var formFieldOptions = SearchFields.fieldsDict[0].fields;
        this.dataTable.set('FormFieldAppendSelectCard', this.inspectorCard.addFormFieldAppend(searchCardWrapper, { key: 'add-search-field', value: 'Add Field: ' }, formFieldOptions));*/

        //---------- Append Form Card to this inspector card
        const searchFormCard = this.getField('SearchFormCard_' + key);
        searchCardWrapper.appendChild(searchFormCard.getCard().wrapper);
        this.inspectorCard.appendToBody(searchCardWrapper);

        // Add Flatpickr Date Range Plugin
        const dateFields = defaultFields.filter(field => field.type === 'date');
        searchFormCard.createFlatpickrRangePlugin(dateFields);

        //this.inspectorCard.addFormFieldFunctions(key, searchFormCard, defaultFields, SearchFields.fieldTooltip);
        
        /********************************** eventListeners ***********************************/
        const queryTypeSelectCard = this.getField(`QueryTypeSelectCard_${key}`).getCard();
        /**
         * Search Form Submit Event
         **/
        const submitButton = searchFormCard.getCard().submitButton;
        this.dataTable.set('SubmitFormButton_' + key, submitButton.querySelector('.btn'));
        this.getField(`SubmitFormButton_${key}`).addEventListener('click', (e) => {
            e.preventDefault();

            //const searchForm = document.querySelector('#' + formName.name);
            const searchForm = searchFormCard.getCard().form;
            const entries = {};

            // get objectId
            var objectsFields = searchForm.querySelectorAll('[name="objects"]');
            objectsFields.forEach(objectField => {
                if (objectField.getAttribute('object-id')) { entries["objects"] = objectField.getAttribute('object-id'); }
            });

            const formData = new FormData(searchForm);
            // Organize formData to only include non-empty field inputs
            const entriesToDelete = [];
            for (const entry of formData.entries()) {
                if (!entry[1] || entry[1] === '-1' || entry[0] === 'objects') {
                    entriesToDelete.push(entry[0]);  
                }
            }
            for (const key of entriesToDelete) {
                formData.delete(key);
            }
            // get queryEntries
            if (formData) {
                formData.forEach((value, key) => { entries[key] = value });
            }
            // get query type
            const dropdown = queryTypeSelectCard.dropdown;
            var datasetType = "Photometry";
            var queryType = "lightcurves"; // default in case dropdown does not exist
            var responseKey = 'lightcurve';
            var sortBy = undefined;
            if (dropdown) {
                var dataset = DatasetTypes.filter(dt => dt.type === dropdown.options[dropdown.value].text);
                if (dataset) {
                    datasetType = dataset[0].type;
                    queryType = dataset[0].queryKey;
                    responseKey = dataset[0].responseKey;
                    sortBy = dataset[0].sortBy;
                }
            }
            console.log(entries);

            const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Search Form Submit Event',
            {
                type: 'form',
                remoteData: true,
                moduleKey: key,
                datasetType: datasetType,
                queryType: queryType,
                queryEntries: entries,
                responseKey: responseKey,
                sortBy: sortBy,
                delay: 1000,
            });
            this.sendMessage(message);
        });

        /**
         * Update Search Form Field event (on query type change)
         * */
        queryTypeSelectCard.dropdown.addEventListener('change', (e) => {
            const dropdown = e.target;
            //var datasetType = dropdown.options[dropdown.selectedIndex].text;
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
            this.inspectorCard.updateSearchFormFields(key, formCard, fields, SearchFields.fieldTooltip);
        });

        this.inspectorCard.maximizeCard();
    }

    addFormFieldFunctions(moduleKey) {
        var searchCard = this.getField(`SearchFormCard_${moduleKey}`);
        const defaultFields = SearchFields.fieldsDict[0].fields;

        this.inspectorCard.addFormFieldFunctions(moduleKey, searchCard, defaultFields, SearchFields.fieldTooltip);
        //this.inspectorCard.maximizeCard();
    }

    /** Recursive Helper function to build columnsToRender information
     * 
     * */
    #buildColumnsToRender(columnElements, columnHeaders, columnsToRender) {
        columnElements.forEach(element => {
            if (element.classList.contains('column-group-wrapper')) {
                var columnGroup = element.querySelector('.column-group');
                var columnName = columnGroup.getAttribute('name');
                var nestedColumnElements = columnGroup.children;
                var nestedColumnHeader = columnHeaders.find(h => h.fieldName === columnName);
                var nestedColumnHeaders = nestedColumnHeader.data;
                var nestedColumnsToRender = [];
                columnsToRender.push({ fieldName: columnName, data: nestedColumnsToRender });
                this.#buildColumnsToRender(nestedColumnElements, nestedColumnHeaders, nestedColumnsToRender);
            }
            else {
                var checkedColumn = element.querySelector('input[type="checkbox"]:checked');
                if (checkedColumn) {
                    var target = columnHeaders.find(h => h.fieldName === checkedColumn.getAttribute('name'));
                    columnsToRender.push(target);
                }
            }
        });
    }

    // --------------------------- Table Module ---------------------------
    updateTableModuleInspectorCard(moduleKey, moduleData) {
        var includeColumnCard = new IncludeColumnCard(moduleKey, moduleData.columnHeaders, 'View Table');
        this.inspectorCard.appendToBody(includeColumnCard.getCard().wrapper);

        var datasetType = moduleData.datasetType;
        var columnHeaders = moduleData.columnHeaders;
        var sourceData = moduleData.sourceData;
        // add viewTable event listener
        document.querySelector('#view-button-' + moduleKey)
            .addEventListener('click', (e) => {
                // create table columns object to render
                var columnFields = e.target.closest('div').previousElementSibling;
                var columnsWrapper = columnFields.querySelector('.include-columns-wrapper');
                var includeColumns = columnsWrapper.children;

                var columnsToRender = [];
                this.#buildColumnsToRender(includeColumns, columnHeaders, columnsToRender);

                var moduleData = {
                    moduleKey: moduleKey,
                    datasetType: datasetType,
                    columnsToRender: columnsToRender,
                    sourceData: sourceData,
                };
                console.log(sourceData);
                const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Table Event', moduleData);
                this.sendMessage(message);

                //var checkedColumns = columnFields.querySelectorAll('input[type="checkbox"]:checked');
                /*var columnsToRender = [];
                checkedColumns.forEach((checkedColumn) =>
                {
                    var columnName = checkedColumn.getAttribute('name');
                    columnsToRender.push(columnName);
                });

                moduleData['moduleKey'] = moduleKey;
                moduleData['columnsToRender'] = columnsToRender;

                console.log(moduleData);
                const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Table Event', moduleData);
                this.sendMessage(message);*/
            });
    }


    // send message to setModuleData (x and y values and plotly options)
    /**********************************************************************************************************************************/
    /**********************************************************************************************************************************/
    /**********************************************************************************************************************************/

    /** 
     *  Updates Chart module inspectorCard when link is drawn from a previous module (source/processor)
     *  @param { moduleKey } Number key specific to this chart module
     *  @param { moduleData } Object of the data passed on from the previous module
     * */
    updateChartModuleInspectorCard(moduleKey, moduleData) {
        const chartData = moduleData.chartData; // change variable name to chartData?
        const datasetType = moduleData.datasetType;
        console.log(chartData);

        let contentWrapper = this.HF.createNewDiv(`chart-inspector-${moduleKey}`, '', ['chart-inspector-wrapper'], []);
        this.inspectorCard.appendToBody(contentWrapper);

        //-- Add Chart Title
        const chartTitle = moduleData.objectName ? moduleData.objectName : datasetType;
        let chartTitleWrapper = this.HF.createNewDiv('', '', ['chart-title-wrapper'], []);
        const chartTitleLabel = this.HF.createNewLabel('', '', `chart-title-${moduleKey}`, ['chart-title-label'], [], 'Chart Title: ');
        const chartTitleInput = this.HF.createNewTextInput(`chart-title-${moduleKey}`, '', ['chart-title'], [], 'text', chartTitle);
        chartTitleWrapper.appendChild(chartTitleLabel);
        chartTitleWrapper.appendChild(chartTitleInput);
        contentWrapper.appendChild(chartTitleWrapper);

        //-- Add Chart margin options
        const chartMarginWrapper = this.HF.createNewDiv('', '', ['chart-margin-wrapper'], [], []);
        const chartMarginTitle = this.HF.createNewLabel('', '', 'chart-margin-title', ['chart-margin-title'], [], 'Chart Margins');
        const chartMarginInputWrapper = this.HF.createNewDiv('', '', ['chart-margin-input-wrapper'], [], []);

        const topWrapper = this.HF.createNewDiv('', '', ['chart-margin-top-wrapper', 'margin-wrapper'], [], []);
        const leftWrapper = this.HF.createNewDiv('', '', ['chart-margin-left-wrapper', 'margin-wrapper'], [], []);
        const bottomWrapper = this.HF.createNewDiv('', '', ['chart-margin-bottom-wrapper', 'margin-wrapper'], [], []);
        const rightWrapper = this.HF.createNewDiv('', '', ['chart-margin-right-wrapper', 'margin-wrapper'], [], []);
        const topLabel = this.HF.createNewLabel('', '', 'chart-margin-top', ['margin-label'], [], 'Top: ');
        const leftLabel = this.HF.createNewLabel('', '', 'chart-margin-left', ['margin-label'], [], 'Left: ');
        const bottomLabel = this.HF.createNewLabel('', '', 'chart-margin-bottom', ['margin-label'], [], 'Bottom: ');
        const rightLabel = this.HF.createNewLabel('', '', 'chart-margin-right', ['margin-label'], [], 'Right: ');
        const topInput = this.HF.createNewTextInput('chart-margin-top', '', ['chart-margin'], [], 'text', 100);
        const leftInput = this.HF.createNewTextInput('chart-margin-left', '', ['chart-margin'], [], 'text',150);
        const bottomInput = this.HF.createNewTextInput('chart-margin-bottom', '', ['chart-margin'], [], 'text', 100);
        const rightInput = this.HF.createNewTextInput('chart-margin-right', '', ['chart-margin'], [], 'text', 150);
        topWrapper.appendChild(topLabel);
        topWrapper.appendChild(topInput);
        leftWrapper.appendChild(leftLabel);
        leftWrapper.appendChild(leftInput);
        bottomWrapper.appendChild(bottomLabel);
        bottomWrapper.appendChild(bottomInput);
        rightWrapper.appendChild(rightLabel);
        rightWrapper.appendChild(rightInput);
        chartMarginInputWrapper.appendChild(topWrapper);
        chartMarginInputWrapper.appendChild(leftWrapper);
        chartMarginInputWrapper.appendChild(bottomWrapper);
        chartMarginInputWrapper.appendChild(rightWrapper);

        chartMarginWrapper.appendChild(chartMarginTitle);
        chartMarginWrapper.appendChild(chartMarginInputWrapper);
        contentWrapper.appendChild(chartMarginWrapper);

        //-- Chart Tab wrapper
        let chartInspectorWrapper = this.HF.createNewDiv('', '', ['chart-tabs-wrapper'], [{ style: "width", value: "100%" }]);
        contentWrapper.appendChild(chartInspectorWrapper);

        //-- Create xAxis, yAxis, series tabs
        const tabsWrapper = this.HF.createNewDiv('', '', ['chart-tabs'], [{ style: "width", value: "100%" }]);
        const xAxisTab = this.HF.createNewDiv('', '', ['x-axis-tab', 'tab-button', 'active'], [{ style: "width", value: "15%" }], [{ attribute: 'data-tab', value: `xAxis-${moduleKey}` }], 'X Axis');
        const yAxisTab = this.HF.createNewDiv('', '', ['y-axis-tab', 'tab-button'], [{ style: "width", value: "15%" }], [{ attribute: 'data-tab', value: `yAxis-${moduleKey}` }], 'Y Axis');
        const seriesTab = this.HF.createNewDiv('', '', ['series-tab', 'tab-button'], [{ style: "width", value: "15%" }], [{ attribute: 'data-tab', value: `series-${moduleKey}` }], 'Series');
        tabsWrapper.appendChild(xAxisTab);
        tabsWrapper.appendChild(yAxisTab);
        tabsWrapper.appendChild(seriesTab);
        chartInspectorWrapper.appendChild(tabsWrapper);

        //-- Add Axis Cards
        const xAxisData = chartData.filter(cd => cd.name === 'xaxis')[0];
        const yAxisData = chartData.filter(cd => cd.name === 'yaxis')[0];

        // Find default field object to load (e.g. {type: "lightcurve", xaxis: "imagedate", yaxis: "mag", error: "mag_err"})
        const defaultAxis = DefaultAxes.filter(da=> da.datasetType == datasetType)[0];

        //-- Create X axis card
        const xAxisContentInfo = { name: 'xAxis', displayName: 'X Axis', activeTab: true };
        const defaultXAxis = defaultAxis ? defaultAxis.xAxis : undefined;
        const xAxisCard = this.inspectorCard.addAxisCard(moduleKey, xAxisContentInfo, xAxisData.axes, defaultXAxis);
        chartInspectorWrapper.appendChild(xAxisCard.getCard().wrapper);

        //-- Create Y axis card
        const yAxisContentInfo = { name: 'yAxis', displayName: 'Y Axis', activeTab: false };
        const defaultYAxis = defaultAxis ? defaultAxis.yAxis : undefined;
        const yAxisCard = this.inspectorCard.addAxisCard(moduleKey, yAxisContentInfo, yAxisData.axes, defaultYAxis);
        chartInspectorWrapper.appendChild(yAxisCard.getCard().wrapper);

        //-- Prepare series fields here
        const seriesData = chartData.filter(cd => cd.name === 'series')[0];
        const errorData = chartData.filter(cd => cd.name === 'error')[0];

        //-- Create series card
        const seriesCard = this.inspectorCard.addSeriesCard(moduleKey, seriesData.fields, errorData.fields);
        chartInspectorWrapper.appendChild(seriesCard.getCard().wrapper);

        //-- Add tab button event listener
        this.#createTabButtonEventListener(chartInspectorWrapper);

        //-- Add generateChartButton
        const generateChartButton = this.HF.createNewButton(`generate-chart-button-${moduleKey}`, '', ['generate-chart-button', 'button'], [{ style: 'width', value: '100%' }], 'button', 'Generate Chart', false);
        contentWrapper.appendChild(generateChartButton);

        //-- Send message to Output Manager
        generateChartButton.addEventListener('click', (e) => {
            //-- Get current axis card information
            const inspectorCard = e.target.closest('.inspector-card-body');
            const chartTitle = inspectorCard.querySelector('.chart-title');
            const marginTop = inspectorCard.querySelector('#chart-margin-top');
            const marginLeft = inspectorCard.querySelector('#chart-margin-left');
            const marginBottom = inspectorCard.querySelector('#chart-margin-bottom');
            const marginRight = inspectorCard.querySelector('#chart-margin-right');

            //-- Get axisData
            const axisTabContents = inspectorCard.querySelectorAll('.axis-tab-content'); // xAxis and yAxis contents
            // foreach axisCards
            const chartData = {};
            axisTabContents.forEach(axisTabContent => {
                const axisContentName = axisTabContent.getAttribute('id').split('-')[0];
                const axisArea = axisTabContent.querySelector('.axis-area');
                const axisCards = axisArea.querySelectorAll('.axis-card-wrapper');
                chartData[axisContentName] = [];
                axisCards.forEach(axisCard => {
                    console.log(axisCard);
                    const primary = axisCard.classList.contains('primary');
                    const axisName = axisCard.getAttribute('id');
                    const dataType = axisCard.querySelector('.data-type');
                    const labelName = axisCard.querySelector('.label-input');
                    const axisPos = axisCard.querySelector('.axis-position-dropdown');
                    const tickPos = axisCard.querySelector('.tick-position-dropdown');
                    const offset = axisCard.querySelector('.offset-option-wrapper .text-input');
                    const majorGridLines = axisCard.querySelector('.major-gridlines');
                    const minorGridLines = axisCard.querySelector('.minor-gridlines');
                    const ticks = axisCard.querySelector('.axis-ticks');
                    const inverse = axisCard.querySelector('.inverse');
                    const axisCardContent = {
                        primary: primary,
                        axisName: axisName,
                        dataType: dataType.value,
                        labelName: labelName ? labelName.value : axisName,
                        axisPosition: axisPos[axisPos.selectedIndex].value,
                        tickPosition: tickPos[tickPos.selectedIndex].value,
                        offset: Number(offset.value),
                        majorGridLines: majorGridLines ? majorGridLines.checked : false,
                        minorGridLines: minorGridLines ? minorGridLines.checked : false,
                        ticks: ticks ? ticks.checked : false,
                        inverse: inverse ? inverse.checked : false,
                    };
                    if (primary) {
                        chartData['primaryXAxisName'] = axisName;
                        console.log(chartData['primaryXAxisName']);
                    }
                    chartData[axisContentName].push(axisCardContent);
                });
            });

            // add colors
            chartData['colors'] = [];
            chartData['legendData'] = [];

            // add series data
            chartData['series'] = [];
            const seriesTabContent = inspectorCard.querySelector('.series-tab-content');
            const seriesCards = seriesTabContent.querySelectorAll('.series-card-wrapper');
            seriesCards.forEach(seriesCard => {
                const seriesCardId = seriesCard.getAttribute('id');
                const fieldName = seriesCardId.split('-')[0];

                const header = seriesCard.querySelector('.series-card-header span');
                const dataType = seriesCard.querySelector('.data-type');
                const labelName = seriesCard.querySelector('.label-input');
                const xAxisIndexRef = seriesCard.querySelector('.xaxis-index-ref');
                const xAxisIndexInput = seriesCard.querySelector('.xaxis-index-input');
                const xAxisIndex = xAxisIndexInput.value;
                const xAxisName = xAxisIndexRef.textContent;
                const yAxisIndexDD = seriesCard.querySelector('.yaxis-index-dropdown');
                const yAxisIndex = yAxisIndexDD.selectedIndex;
                const yAxisName = yAxisIndexDD[yAxisIndexDD.selectedIndex].textContent;
                const errorDD = seriesCard.querySelector('.error-dropdown');
                const errorName = errorDD[errorDD.selectedIndex].textContent;
                const symbolShapeDD = seriesCard.querySelector('.symbol-shape-dropdown');
                const symbolShape = symbolShapeDD[symbolShapeDD.selectedIndex];
                const symbolColorDD = seriesCard.querySelector('.symbol-color-dropdown');
                const symbolColor = symbolColorDD[symbolColorDD.selectedIndex];
                const symbolOpacity = seriesCard.querySelector('.symbols-opacity-wrapper .text-input');
                const datapointSize = seriesCard.querySelector('.symbols-size-range-wrapper .text-input');

                const seriesContent = {
                    fieldName: fieldName,
                    seriesName: header.textContent,
                    // add seriesName
                    dataType: dataType.value,
                    labelName: (labelName !== '') ? labelName.value : seriesName,
                    xAxisIndex: Number(xAxisIndex),
                    xAxisName: xAxisName,
                    yAxisIndex: yAxisIndex,
                    yAxisName: yAxisName,
                    errorName: errorName,
                    symbolShape: symbolShape.value,
                    symbolColor: symbolColor.value,
                    symbolOpacity: Number(symbolOpacity.value),
                    symbolSize: Number(datapointSize.value),
                    visible: true,
                };
                chartData['series'].push(seriesContent);
                chartData['colors'].push(symbolColor.value);
                chartData['colors'].push('#5470c6');
                chartData['legendData'].push(seriesContent.seriesName);
            });

            moduleData['datasetType'] = datasetType;
            moduleData['chartTitle'] = chartTitle ? chartTitle.value : datasetType;
            chartData['margins'] = {
                top: Number(marginTop.value),
                left: Number(marginLeft.value),
                bottom: Number(marginBottom.value),
                right: Number(marginRight.value)
            };
            /*chartData['marginTop'] = marginTop.value;
            chartData['marginLeft'] = marginLeft.value;
            chartData['marginBottom'] = marginBottom.value;
            chartData['marginRight'] = marginRight.value;*/
            moduleData['chartData'] = chartData;

            console.log(moduleData);
            const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Chart Event', { moduleKey: moduleKey, moduleData: moduleData });
            this.sendMessage(message);
        });
    }

    /** 
     *  Creates a tab button event listener for toggling tab contents
     *  @param { chartInspectorWrapper } HTMLObject of a chart inspector card
     */
    #createTabButtonEventListener(chartInspectorWrapper) {
        const tabButtons = chartInspectorWrapper.querySelectorAll('.tab-button');
        const tabContents = chartInspectorWrapper.querySelectorAll('.tab-content');

        // Add click event listeners to all tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('click', e => {
                // Remove 'active' classes from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => { content.classList.remove('active') });
                // Add 'active' class to the clicked button
                button.classList.add('active');

                // Show the associated content
                const tabId = button.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                tabContent.classList.add('active');
            });
        });


    }


    /** Adds xAxisIndex & yAxisIndex dropdown options on initial inspector card load
     * @param {xAxisCard object} xAxisCard object for getting the xAxis traces
     * @param {yAxisCard object} yAxisCard object for getting the yAxis traces
     * @param {seriesCard object} seriesCard to add the options for
     * */
    addSeriesAxisOptions(xAxisCard, yAxisCard, seriesCard) {
        var xAxisTraceArea = xAxisCard.getCard().traceArea;
        var yAxisTraceArea = yAxisCard.getCard().traceArea;
        var seriesTraceArea = seriesCard.getCard().traceArea;

        var xTraces = xAxisTraceArea.querySelectorAll('.trace-card-wrapper');
        var yTraces = yAxisTraceArea.querySelectorAll('.trace-card-wrapper');
        var seriesTraces = seriesTraceArea.querySelectorAll('.trace-card-wrapper');

        console.log(xTraces);
        console.log(yTraces);
        console.log(seriesTraces);

        var xOptions = [];
        var yOptions = [];
        xTraces.forEach((x, i) => { xOptions.push({ value: i, name: x.getAttribute('id') }) });
        yTraces.forEach((y, i) => { yOptions.push({ value: i, name: y.getAttribute('id') }) });
     
        // append to xAxisIndex & yAxisIndex dropdowns in each series trace cards
        seriesTraces.forEach(trace => {
            var xAxisDD = trace.querySelector('.xaxis-index-dropdown-wrapper .xaxis-index-dropdown');
            var yAxisDD = trace.querySelector('.yaxis-index-dropdown-wrapper .yaxis-index-dropdown');
            this.HF.updateSelectOptions(xAxisDD, xOptions);
            this.HF.updateSelectOptions(yAxisDD, yOptions);
        });
    }

    // --------------------------- Orbit Module ---------------------------
    updateOrbitModuleInspectorCard(moduleKey, moduleData) {
        const contentWrapper = this.HF.createNewDiv('', '', ['orbit-inspector-wrapper'], []);
        this.inspectorCard.appendToBody(contentWrapper);
        //console.log(moduleData);

        // objectNames
        const objectList = this.inspectorCard.addRenderedObjectsList(moduleData.objectNames);
        contentWrapper.appendChild(objectList);

        // add generate orbit button
        const generateOrbitButton = this.HF.createNewButton(`generate-orbit-button-${moduleKey}`, '', ['generate-orbit-button', 'button'], [], 'button', 'Generate Orbit', false);
        contentWrapper.appendChild(generateOrbitButton);

        // add generate orbit button onclick event listener
        generateOrbitButton.addEventListener('click', (e) => {

            var data = {
                moduleKey: moduleKey,
                //objectsData: moduleData.sourceData,
                //eclipticData: moduleData.eclipticData,
                objectsToRender: moduleData.objectNames,
                orbitsToRender: moduleData.planetNames,
            }

            // send message
            const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Orbit Event', data);
            this.sendMessage(message);
        });

    }

    updateImageModuleInspectorCard(moduleKey, moduleData) {
        var contentWrapper = this.HF.createNewDiv('', '', ['object-images-inspector-wrapper'], []);
        this.inspectorCard.appendToBody(contentWrapper);

        var object = this.inspectorCard.addRenderedObjectsList([moduleData.objectName]);
        contentWrapper.appendChild(object);

        var generateImagesButton = this.HF.createNewButton(`generate-images-button-${moduleKey}`, '', ['generate-images-button', 'button'], [], 'button', 'Generate Images', false);
        contentWrapper.appendChild(generateImagesButton);

        // add generate orbit button onclick event listener
        generateImagesButton.addEventListener('click', (e) => {
            let imagePopupContent = document.querySelector(`#popup-${moduleKey} .popup-content`);
            const imagePopupExists = imagePopupContent.firstChild ? true : false;
            //console.log(imagePopupExists);

            var data = {
                moduleKey: moduleKey,
                //objectsData: moduleData.sourceData,
                //eclipticData: moduleData.eclipticData,
                objectToRender: moduleData.objectName,
                imagePopupExists: imagePopupExists
            }

            // send message
            const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Images Event', data);
            this.sendMessage(message);
            
        });
    }


    /**
     * Updates filter mnodule inspector card
     * 
     * */
    updateFilterModuleInspectorCard(moduleKey, moduleData) {
        console.log(moduleData);

        const filterData = moduleData.filterData;

        let contentWrapper = this.HF.createNewDiv(`filter-inspector-${moduleKey}`, '', ['filter-inspector-wrapper'], []);
        this.inspectorCard.appendToBody(contentWrapper);

        filterData.forEach(field => {

            // Create field wrapper
            const fieldWrapper = this.HF.createNewDiv('', '', ['filter-field-wrapper'], [], [], '');
            contentWrapper.appendChild(fieldWrapper);

            // Create field card
            const fieldCard = this.HF.createNewDiv(`filter-${field.fieldName}`, '', ['field-card'], [], [], '');
            fieldWrapper.appendChild(fieldCard);

            // Create field header
            const fieldHeader = this.HF.createNewDiv('', '', ['field-header'], [], [], '');
            const fieldCheckbox = this.HF.createNewCheckbox(field.fieldName, '', ['field-check'], [], field.fieldName, field.displayName, true);
            const fieldExpand = this.HF.createNewSpan('', '', ['field-expand'], [], '+');
            fieldHeader.appendChild(fieldCheckbox.wrapper);
            fieldHeader.appendChild(fieldExpand);
            fieldCard.appendChild(fieldHeader);

            // Create field body
            const fieldBody = this.HF.createNewDiv('', '', ['field-body', 'collapsed'], [], [], '');
            fieldCard.appendChild(fieldBody);

            const filterOptionsWrapper = this.HF.createNewDiv('', '', ['filter-options-wrapper'], [], [], '');
            const filterOptionsLabel = this.HF.createNewSpan('', '', ['filter-options-label', 'filter-label'], [], 'Filtering Option:');
            filterOptionsWrapper.appendChild(filterOptionsLabel);
            fieldBody.appendChild(filterOptionsWrapper);

            if (field.dataType === 'value') {
                // Set datatype to the fieldWrapper
                fieldWrapper.setAttribute('data-type', field.dataType);

                // Create filter option dropdown
                const filterOptions = ['Range', 'Less Than', 'Greater Than', 'Value'];
                const filterOptionsDD = this.HF.createNewSelect('', '', ['filter-options-dropdown'], [], [0, 1, 2, 3], filterOptions);
                filterOptionsWrapper.appendChild(filterOptionsDD);

                filterOptionsDD.addEventListener('change', (e) => {
                    const selectedVal = e.target.value;
                    const selectedOption = filterOptions[selectedVal];

                    // delete filter content
                    //const currentFilterContent = fieldBody.querySelector('.filter-content-wrapper');

                    console.log(selectedOption);
                    // set all filter content hidden
                    const filterContents = fieldBody.querySelectorAll('.filter-content-wrapper');
                    filterContents.forEach(fc => { if (!fc.classList.contains('hidden')) { fc.classList.add('hidden') } });

                    // Toggle the hidden class of the selected filter option
                    switch (selectedOption) {
                        case 'Range':
                            const rangeContent = fieldBody.querySelector('.filter-minmax-wrapper');
                            rangeContent.classList.toggle('hidden');
                            break;
                        case 'Less Than':
                            const lessthanContent = fieldBody.querySelector('.filter-lessthan-wrapper');
                            lessthanContent.classList.toggle('hidden');
                            break;
                        case 'Greater Than':
                            const greaterthanContent = fieldBody.querySelector('.filter-greaterthan-wrapper');
                            greaterthanContent.classList.toggle('hidden');
                            break;
                        case 'Value':
                            const valueContent = fieldBody.querySelector('.filter-value-wrapper');
                            valueContent.classList.toggle('hidden');
                            break;
                    }



                    //if (currentFilterContent) { currentFilterContent.remove() }

                    /*const filterContent = this.#createNumericalFilterContent(selectedVal, filterOptions, field);
                    fieldBody.appendChild(filterContent);*/

                });

                // Create Numerical Filter Content
                this.#createNumericalFilterContent(fieldBody, field);


                // Create minmaxRangeInput
                /*let min = field.domain[0];
                let max = field.domain[1];

                const minmaxWrapper = this.HF.createNewDiv('', '', ['filter-minmax-wrapper', 'filter-content-wrapper'], [], [], '');
                const minmaxLabel = this.HF.createNewSpan('', '', ['filter-minmax-label', 'filter-label'], [], 'Min Max Range Slider:');
                const minmaxSlider = this.HF.createNewMinMaxSlider('', '', ['filter-minmax-slider'], [{ style: 'position', value: 'relative' }], '', min, max, min, max, field.step, field.step, true);

                minmaxWrapper.appendChild(minmaxLabel);
                minmaxWrapper.appendChild(minmaxSlider);
                fieldBody.appendChild(minmaxWrapper);*/


            }
            else if (field.dataType === 'category') {
                // Set datatype to the fieldWrapper
                fieldWrapper.setAttribute('data-type', field.dataType);

                const filterOptions = ['Keyword', 'Category Selection'];
                const filterOptionsDD = this.HF.createNewSelect('', '', ['filter-options-dropdown'], [], [0, 1], filterOptions);
                filterOptionsWrapper.appendChild(filterOptionsDD);
                // Create textInput for keyword filter


            }
            else if (field.dataType === 'date') {
                // Set datatype to the fieldWrapper
                fieldWrapper.setAttribute('data-type', field.dataType);

                const filterOptions = ['Range', 'Before/After', 'Relative Date', 'Date Selection'];
                const filterOptionsDD = this.HF.createNewSelect('', '', ['filter-options-dropdown'], [], [0, 1, 2, 3], filterOptions);
                filterOptionsWrapper.appendChild(filterOptionsDD);

                // Create minmaxRangeInput

                // Create date picker for specific data filter

            }


            // Add eventListener for field-header to toggle collapsing
            fieldHeader.addEventListener('click', (e) => {
                const fieldHeader = e.target;
                const fieldBody = fieldHeader ? fieldHeader.nextElementSibling : undefined;
                if (fieldBody) {
                    fieldBody.classList.toggle('collapsed');
                }
            });
            fieldExpand.addEventListener('click', (e) => {
                const fieldHeader = e.target.closest('.field-header');
                const fieldBody = fieldHeader ? fieldHeader.nextElementSibling : undefined;
                if (fieldBody) {
                    fieldBody.classList.toggle('collapsed');
                }
            });
        });


        // Add a Filter button to process the module
        const filterButtonWrapper = this.HF.createNewDiv('', '', ['filter-button-wrapper', 'button-wrapper'], [], [], '');
        const filterButton = this.HF.createNewButton(`filter-button-${moduleKey}`, '', ['filter-button', 'button'], [], 'button', 'Process Filter', false);
        filterButtonWrapper.appendChild(filterButton);
        contentWrapper.appendChild(filterButtonWrapper);

        filterButton.addEventListener('click', (e) => {
            console.log(filterData);

            const filterInspectorWrapper = e.target.closest('.filter-inspector-wrapper');
            const filterFields = filterInspectorWrapper.querySelectorAll('.filter-field-wrapper');

            let filterOptions = [];
            filterFields.forEach((field) => {
                console.log(field);
                const fieldCard = field.querySelector('.field-card');
                const fieldCardId = fieldCard.getAttribute('id');
                const fieldName = fieldCardId.split('filter-')[1];
                const dataType = field.getAttribute('data-type');

                let filterOption = { fieldName: fieldName, dataType: dataType };  // dataType, option, values (obj)

                const fieldHeader = field.querySelector('.field-card .field-header');
                const fieldBody = field.querySelector('.field-card .field-body');

                //-- fields to include (field checkboxes)
                const fieldCheck = fieldHeader.querySelector('.field-check');
                const includeField = (fieldCheck) ? fieldCheck.checked : false;

                if (includeField) {

                    // Get filter options
                    const filterOptionsDD = fieldBody.querySelector('.filter-options-wrapper select');
                    if (filterOptionsDD) {
                        const selectedFilterOption = filterOptionsDD.options[filterOptionsDD.selectedIndex];
                        filterOption['optionName'] = selectedFilterOption.text;
                    }

                    //--- Get filter option values
                    //const filterContent = field.querySelector('.filter-content-wrapper');
                    const optionValues = this.#getFilterOptionValues(dataType, filterOption.optionName, fieldBody);
                    filterOption['optionValues'] = optionValues;

                    filterOptions.push(filterOption);
                }

                //-- for numerical data types => choose selected filter option and choose the


            });



            const message = new Message(PROCESSOR_MANAGER, INSPECTOR_CARD_MAKER, 'Process Filter Event',
            {
                moduleKey: moduleKey,
                datasetType: moduleData.datasetType,
                sourceData: moduleData.sourceData,
                filterOptions: filterOptions,
            });
            this.sendMessage(message);

        });


    }

    /**
     * Creates the filtering option content on filtering option selection change
     * */
    #createNumericalFilterContent(wrapper, field) {
        console.log(field);

        // Create range content
        let min = field.domain[0];
        let max = field.domain[1];

        const minmaxWrapper = this.HF.createNewDiv('', '', ['filter-minmax-wrapper', 'filter-content-wrapper'], [], [], '');
        const minmaxLabel = this.HF.createNewSpan('', '', ['filter-minmax-label', 'filter-label'], [], 'Min Max Range Slider:');
        const minmaxSlider = this.HF.createNewMinMaxSlider('', '', ['filter-minmax-slider'], [{ style: 'position', value: 'relative' }], '', min, max, min, max, field.step, field.step, true);

        minmaxWrapper.appendChild(minmaxLabel);
        minmaxWrapper.appendChild(minmaxSlider);
        wrapper.appendChild(minmaxWrapper);


        // Create lessthan content
        const lessthanWrapper = this.HF.createNewDiv('', '', ['filter-lessthan-wrapper', 'filter-content-wrapper', 'hidden'], [], [], '');
        const lessthanLabel = this.HF.createNewSpan('', '', ['filter-lessthan-label', 'filter-label'], [], 'Less Than: ');
        lessthanLabel.innerHTML = lessthanLabel.innerHTML + '&nbsp;';
        const lessthanInput = this.HF.createNewTextInput('', '', ['filter-lessthan-input'], [], 'number', max);

        lessthanWrapper.appendChild(lessthanLabel);
        lessthanWrapper.appendChild(lessthanInput);
        wrapper.appendChild(lessthanWrapper);

        // Create greaterthan content
        const greaterthanWrapper = this.HF.createNewDiv('', '', ['filter-greaterthan-wrapper', 'filter-content-wrapper', 'hidden'], [], [], '');
        const greaterthanLabel = this.HF.createNewSpan('', '', ['filter-greaterthan-label', 'filter-label'], [], 'Greater Than: ');
        greaterthanLabel.innerHTML = greaterthanLabel.innerHTML + '&nbsp;';
        const greaterthanInput = this.HF.createNewTextInput('', '', ['filter-greaterthan-input'], [], 'number', min);

        greaterthanWrapper.appendChild(greaterthanLabel);
        greaterthanWrapper.appendChild(greaterthanInput);
        wrapper.appendChild(greaterthanWrapper);


        // Create value content
        const valueWrapper = this.HF.createNewDiv('', '', ['filter-value-wrapper', 'filter-content-wrapper', 'hidden'], [], [], '');
        const valueDD = this.HF.createNewSelect('', '', ['filter-value-dropdown'], [], ['equal', 'notequal'], ['Equal', 'Not Equal']);
        const valueInputWrapper = this.HF.createNewDiv('', '', ['filter-value-input-wrapper'], [], [], '');
        const valueLabel = this.HF.createNewSpan('', '', ['filter-value-label', 'filter-label'], [], 'Value: ');
        valueLabel.innerHTML = valueLabel.innerHTML + '&nbsp;';
        const valueInput = this.HF.createNewTextInput('', '', ['filter-value-input'], [], 'number', '');

        valueWrapper.appendChild(valueDD);
        valueInputWrapper.appendChild(valueLabel);
        valueInputWrapper.appendChild(valueInput);
        valueWrapper.appendChild(valueInputWrapper);
        wrapper.appendChild(valueWrapper);

/*
        const selectedOption = filterOptions[selectedVal];

        let wrapper;
        switch (selectedOption) {
            case 'Range':
                // Create minmaxRangeInput
                let min = field.domain[0];
                let max = field.domain[1];

                const minmaxWrapper = this.HF.createNewDiv('', '', ['filter-minmax-wrapper', 'filter-content-wrapper'], [], [], '');
                const minmaxLabel = this.HF.createNewSpan('', '', ['filter-minmax-label', 'filter-label'], [], 'Min Max Range Slider:');
                const minmaxSlider = this.HF.createNewMinMaxSlider('', '', ['filter-minmax-slider'], [{ style: 'position', value: 'relative' }], '', min, max, min, max, field.step, field.step, true);

                minmaxWrapper.appendChild(minmaxLabel);
                minmaxWrapper.appendChild(minmaxSlider);
                wrapper = minmaxWrapper;

                break;
            case 'Threshold':
                const thresholdWrapper = this.HF.createNewDiv('', '', ['filter-threshold-wrapper', 'filter-content-wrapper'], [], [], '');

                const lessWrapper = this.HF.createNewDiv('', '', ['filter-less-wrapper'], [], [], '');
                const lessLabel = this.HF.createNewSpan('', '', ['filter-less-label', 'filter-label'], [], 'Less than: ');
                lessLabel.innerHTML = lessLabel.innerHTML + '&nbsp;';
                const lessInput = this.HF.createNewTextInput('', '', ['filter-less-input'], [], 'number', '');

                const greaterWrapper = this.HF.createNewDiv('', '', ['filter-greater-wrapper'], [], [], '');
                const greaterLabel = this.HF.createNewSpan('', '', ['filter-greater-label', 'filter-label'], [], 'Greater than: ');
                greaterLabel.innerHTML = greaterLabel.innerHTML + '&nbsp;';
                const greaterInput = this.HF.createNewTextInput('', '', ['filter-greater-input'], [], 'number', '');

                lessWrapper.appendChild(lessLabel);
                lessWrapper.appendChild(lessInput);
                greaterWrapper.appendChild(greaterLabel);
                greaterWrapper.appendChild(greaterInput);
                thresholdWrapper.appendChild(lessWrapper);
                thresholdWrapper.appendChild(greaterWrapper);
                wrapper = thresholdWrapper;

                break;
            case 'Value':
                const valueWrapper = this.HF.createNewDiv('', '', ['filter-value-wrapper', 'filter-content-wrapper'], [], [], '');
                const valueDD = this.HF.createNewSelect('', '', ['filter-value-dropdown'], [], ['equal', 'notequal'], ['Equal', 'Not Equal']);
                const valueInputWrapper = this.HF.createNewDiv('', '', ['filter-value-input-wrapper'], [], [], '');
                const valueLabel = this.HF.createNewSpan('', '', ['filter-value-label', 'filter-label'], [], 'Value: ');
                valueLabel.innerHTML = valueLabel.innerHTML + '&nbsp;';
                const valueInput = this.HF.createNewTextInput('', '', ['filter-value-input'], [], 'number', '');

                valueWrapper.appendChild(valueDD);
                valueInputWrapper.appendChild(valueLabel);
                valueInputWrapper.appendChild(valueInput);
                valueWrapper.appendChild(valueInputWrapper);
                wrapper = valueWrapper;

                break;
        }

        return wrapper;*/
    }

    /**
     * Gets the filtering option content values
     * */
    #getFilterOptionValues(dataType, filterOption, fieldBody) {
        let filterOptionValues = {};

        switch (dataType) {
            case 'value':
                filterOptionValues = this.#getNumericalFilterOptionValues(filterOption, fieldBody);
                break;
            case 'category':
                filterOptionValues = this.#getCategoryFilterOptionValues(filterOption, fieldBody);
                break;
            case 'date':
                filterOptionValues = this.#getDateFilterOptionValues(filterOption, fieldBody);
                break;
        }

        return filterOptionValues;
    }

    #getNumericalFilterOptionValues(filterOption, fieldBody) {
        let filterOptionValues = {};
        switch (filterOption) {
            case 'Range':
                const minmaxContent = fieldBody.querySelector('.filter-minmax-wrapper');
                console.log('filterOption: ', filterOption);
                const rangeInputs = minmaxContent.querySelectorAll('.range-input');
                const minRange = rangeInputs[0];
                const maxRange = rangeInputs[1];
                const minVal = minRange.value;
                const maxVal = maxRange.value;

                filterOptionValues['min'] = Number(minVal);
                filterOptionValues['max'] = Number(maxVal);

                break;
            case 'Less Than':
                const lessthanContent = fieldBody.querySelector('.filter-lessthan-wrapper');

                const lessthanInput = lessthanContent.querySelector('input');
                const lessthanVal = lessthanInput.value;

                filterOptionValues['lessThanVal'] = Number(lessthanVal);
                break;
            case 'Greater Than':
                const greaterthanContent = fieldBody.querySelector('.filter-greaterthan-wrapper');

                const greaterthanInput = greaterthanContent.querySelector('input');
                const greaterthanVal = greaterthanInput.value;

                filterOptionValues['greaterThanVal'] = Number(greaterthanVal);
                break;
            case 'Value':
                const valueContent = fieldBody.querySelector('.filter-value-wrapper');
                const equalityDD = valueContent.querySelector('select');

                const equality = equalityDD.options[equalityDD.selectedIndex];
                const valueInput = valueContent.querySelector('input');
                const val = valueInput.value;

                filterOptionValues['equality'] = equality.text;
                filterOptionValues['value'] = val ? Number(val) : undefined;

                break;
        }
        return filterOptionValues;
    }

    #getCategoryFilterOptionValues(filterOption, fieldBody) {
        switch (filterOption) {
            case 'Keyword':
                console.log('filterOption: ', filterOption);

                break;
            case 'Category Selection':
                console.log(filterOption);
                break;
        }
    }

    #getDateFilterOptionValues(filterOption, fieldBody) {
        switch (filterOption) {
            case 'Range':
                console.log('filterOption: ', filterOption);

                break;
            case 'Before/After':
                console.log(filterOption);
                break;
            case 'Relative Date':
                console.log(filterOption);
                break;
            case 'Date Selection':
                console.log(filterOption);
                break;
        }
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