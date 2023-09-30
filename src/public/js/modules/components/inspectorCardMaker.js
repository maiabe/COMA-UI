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
    INSPECTOR_CARD, INSPECTOR_CARD_MAKER, MODULE_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, WORKER_MANAGER,
    DatasetTypes, DatasetFields, SearchFields, DefaultAxis,
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
        const uploadWrapper = this.HF.createNewDiv('', '', ['wrapper', 'upload-wrapper'], []);

        contentWrapper.appendChild(datasetTypeWrapper);
        contentWrapper.appendChild(uploadWrapper);
        this.inspectorCard.appendToBody(contentWrapper);

        const options = DatasetTypes.map(ds => { return ds.type });
        options.push('other');
        var datasetTypeLabel = this.HF.createNewLabel('', '', '', ['dataset-type-label'], [], 'Dataset Type: ');
        var datasetTypeDropdown = this.HF.createNewSelect('', '', ['dataset-type-dropdown'], [], options, options);
        datasetTypeWrapper.appendChild(datasetTypeLabel);
        datasetTypeWrapper.appendChild(datasetTypeDropdown);

        const upload = this.HF.createNewFileInput(`upload_csv-${moduleKey}`, 'upload_csv', [], [], 'file', false);
        uploadWrapper.appendChild(upload);

        upload.addEventListener('change', callback);

        this.dataTable.set('readFileButton', this.HF.createNewButton('read-file-button', 'read-file-button', ['read-file-button', 'button'], [], 'button', 'Read File', true));
        uploadWrapper.appendChild(this.getField('readFileButton'));
        this.getField('readFileButton').addEventListener('click', () => {
            const message = new Message(INPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Read File Event', {
                fileId: 'upload_csv-' + moduleKey,
                //elementId: inspectorId,
                moduleKey: moduleKey,
                fileType: 'csv',
            });
            this.sendMessage(message);
        });

        // Expand the size of the inspector card
        this.inspectorCard.maximizeCard();
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
        var options = DatasetTypes.map(dt => { return dt.type });
        this.dataTable.set(`QueryTypeSelectCard_${key}`, this.inspectorCard.addQueryTypeSelect(searchCardWrapper, { key: 'query-type-' + key, value: 'Query Type ' }, options, SearchFields.queryTypeTooltip));
        
        // Create Form Field Append
        /*var formFieldOptions = SearchFields.fieldsDict[0].fields;
        this.dataTable.set('FormFieldAppendSelectCard', this.inspectorCard.addFormFieldAppend(searchCardWrapper, { key: 'add-search-field', value: 'Add Field: ' }, formFieldOptions));*/

        //---------- Append Form Card to this inspector card
        var searchFormCard = this.getField('SearchFormCard_' + key);
        searchCardWrapper.appendChild(searchFormCard.getCard().wrapper);
        this.inspectorCard.appendToBody(searchCardWrapper);

        // Add Flatpickr Date Range Plugin
        const dateFields = defaultFields.filter(field => field.type === 'date');
        searchFormCard.createFlatpickrRangePlugin(dateFields);

        //this.inspectorCard.addFormFieldFunctions(key, searchFormCard, defaultFields, SearchFields.fieldTooltip);
        
        /********************************** js events ***********************************/
        var queryTypeSelectCard = this.getField(`QueryTypeSelectCard_${key}`).getCard();
        /**
         * Search Form Submit Event
         **/
        var submitButton = searchFormCard.getCard().submitButton;
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
    // --------------------------- Chart Module ---------------------------
    updateChartModuleInspectorCard(moduleKey, moduleData) {
        const chartAxisData = moduleData.chartAxisData;
        const datasetType = moduleData.datasetType;

        var contentWrapper = this.HF.createNewDiv('', '', ['chart-inspector-wrapper'], [{ style: 'padding', value: '4%' }]);
        this.inspectorCard.appendToBody(contentWrapper);

        //-- Add Chart Title
        var chartTitleWrapper = this.HF.createNewDiv('', '', ['chart-title-wrapper'], [{ style: "width", value: "100%" }]);
        var chartTitleLabel = this.HF.createNewLabel('', '', `chart-title-${moduleKey}`, ['chart-title-label'], [], 'Chart Title: ');
        var chartTitleInput = this.HF.createNewTextInput(`chart-title-${moduleKey}`, '', ['chart-title'], [], 'text', datasetType)
        chartTitleWrapper.appendChild(chartTitleLabel);
        chartTitleWrapper.appendChild(chartTitleInput);
        contentWrapper.appendChild(chartTitleWrapper);

        var chartAxisWrapper = this.HF.createNewDiv('', '', ['chart-axis-wrapper'], [{ style: "width", value: "100%" }]);
        contentWrapper.appendChild(chartAxisWrapper);

        //-- Add Axis Cards
        var xAxisFields = chartAxisData.filter(column => column.axis === 'xaxis');
        var yAxisFields = chartAxisData.filter(column => column.axis === 'yaxis');
        var errorFields = chartAxisData.filter(column => column.axis === 'error');

        // Find default field object to load (e.g. {type: "lightcurve", xaxis: "imagedate", yaxis: "mag", error: "mag_err"})
        console.log(datasetType);
        var defaultField = DefaultAxis.map(axisObj => { if (axisObj.datasetType == datasetType) { return axisObj } });

        // Create X axis card
        var xAxisName = { displayName: "X Axis", elementName: "xAxis" };
        var xAxisDefault = (defaultField.length > 0) ? defaultField[0] ? defaultField[0].xAxis : undefined : undefined;
        var xAxisCard = this.inspectorCard.addAxisCard(xAxisName, xAxisFields[0].fields, xAxisDefault);
        chartAxisWrapper.appendChild(xAxisCard.getCard().wrapper);

        // Create Y axis card
        var yAxisName = { displayName: "Y Axis", elementName: "yAxis" };
        var yAxisDefault = (defaultField.length > 0) ? defaultField[0] ? defaultField[0].yAxis : undefined : undefined;
        var yAxisCard = this.inspectorCard.addAxisCard(yAxisName, yAxisFields[0].fields, yAxisDefault);
        chartAxisWrapper.appendChild(yAxisCard.getCard().wrapper);

        var seriesCard = this.inspectorCard.addSeriesCard(yAxisFields[0].fields, yAxisDefault, errorFields[0].fields, this.updateSeriesAxisOptions);
        chartAxisWrapper.appendChild(seriesCard.getCard().wrapper);

        this.addSeriesAxisOptions(xAxisCard, yAxisCard, seriesCard);

        //-- Add generateChartButton
        var generateChartButton = this.HF.createNewButton(`generate-chart-button-${moduleKey}`, '', ['generate-chart-button', 'button'], [{ style: 'width', value: '100%' }], 'button', 'Generate Chart', false);
        contentWrapper.appendChild(generateChartButton);

        // Send message to Output Manager
        generateChartButton.addEventListener('click', (e) => {
            // get current trace card information
            const inspectorCard = e.target.closest('.inspector-card-body');
            const chartTitle = inspectorCard.querySelector('.chart-title');
            const axisCards = inspectorCard.querySelectorAll('.axis-card-wrapper');
            // foreach axisCards
            var traceData = {};
            axisCards.forEach(axisCard => {
                var axis = axisCard.getAttribute('id');
                var traceArea = axisCard.querySelector('.trace-area');
                var traceCards = traceArea.querySelectorAll('.trace-card-wrapper');
                traceData[axis] = [];
                traceCards.forEach(traceCard => {
                    var fieldName = traceCard.getAttribute('id');
                    var dataType = traceCard.querySelector('.data-type');
                    var fieldGroup = traceCard.querySelector('.field-group');
                    var labelName = traceCard.querySelector('.label-input');
                    var position = traceCard.querySelector('.position-options-dropdown');
                    var offset = traceCard.querySelector('.offset-option-wrapper .text-input');
                    var majorGridLines = traceCard.querySelector('.major-gridlines');
                    var minorGridLines = traceCard.querySelector('.minor-gridlines');
                    var ticks = traceCard.querySelector('.minor-ticks');
                    var inverse = traceCard.querySelector('.inverse');
                    var traceCardContent = {
                        fieldName: fieldName,
                        dataType: dataType.value,
                        fieldGroup: fieldGroup.value,
                        labelName: labelName ? labelName.value : fieldName,
                        position: position[position.selectedIndex].value,
                        offset: Number(offset.value),
                        majorGridLines: majorGridLines ? majorGridLines.checked : false,
                        minorGridLines: minorGridLines ? minorGridLines.checked : false,
                        ticks: ticks ? ticks.checked : false,
                        inverse: inverse ? inverse.checked : false, 
                    };
                    traceData[axis].push(traceCardContent);
                });
            });
            // add series data
            traceData['series'] = [];
            const seriesCard = inspectorCard.querySelector('.series-card-wrapper');
            var seriesTraceCards = seriesCard.querySelectorAll('.trace-card-wrapper');
            seriesTraceCards.forEach(traceCard => {
                var fieldName = traceCard.getAttribute('id');
                var dataType = traceCard.querySelector('.data-type');
                var fieldGroup = traceCard.querySelector('.field-group');
                var labelName = traceCard.querySelector('.label-input');
                var xAxisIndexDD = traceCard.querySelector('.xaxis-index-dropdown');
                var xAxisIndex = xAxisIndexDD.selectedIndex;
                var xAxisName = xAxisIndexDD[xAxisIndexDD.selectedIndex].textContent;
                var yAxisIndexDD = traceCard.querySelector('.yaxis-index-dropdown');
                var yAxisIndex = yAxisIndexDD.selectedIndex;
                var yAxisName = yAxisIndexDD[yAxisIndexDD.selectedIndex].textContent;
                var errorDD = traceCard.querySelector('.error-dropdown');
                var error = errorDD[errorDD.selectedIndex];
                var symbolsDD = traceCard.querySelector('.symbols-dropdown');
                var symbol = symbolsDD[symbolsDD.selectedIndex];
                var datapointSize = traceCard.querySelector('.symbols-size-range-wrapper .text-input');

                var seriesContent = {
                    fieldName: fieldName,
                    dataType: dataType.value,
                    fieldGroup: fieldGroup.value,
                    labelName: (labelName !== '') ? labelName.value : fieldName,
                    xAxisIndex: xAxisIndex,
                    xAxisName: xAxisName,
                    yAxisIndex: yAxisIndex,
                    yAxisName: yAxisName,
                    error: error.value,
                    symbol: symbol.value,
                    symbolSize: Number(datapointSize.value),
                };
                traceData['series'].push(seriesContent);
            });

            moduleData['moduleKey'] = moduleKey;
            moduleData['datasetType'] = datasetType;
            moduleData['chartTitle'] = chartTitle ? chartTitle.value : datasetType;
            moduleData['traceData'] = traceData;

            console.log(moduleData);
            const message = new Message(OUTPUT_MANAGER, INSPECTOR_CARD_MAKER, 'Set New Chart Event', moduleData);
            this.sendMessage(message);
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

        /*console.log(xTraces);
        console.log(yTraces);
        console.log(seriesTraces);*/

        var xOptions = [];
        var yOptions = [];
        xTraces.forEach((x, i) => { xOptions.push({ value: i, name: x.getAttribute('id') }) });
        yTraces.forEach((x, i) => { yOptions.push({ value: i, name: x.getAttribute('id') }) });
     
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
        var contentWrapper = this.HF.createNewDiv('', '', ['orbit-inspector-wrapper'], []);
        this.inspectorCard.appendToBody(contentWrapper);

        // objectNames
        var objectList = this.inspectorCard.addRenderedObjectsList(moduleData.objectNames);
        contentWrapper.appendChild(objectList);

        // add generate orbit button
        var generateOrbitButton = this.HF.createNewButton(`generate-orbit-button-${moduleKey}`, '', ['generate-orbit-button', 'button'], [], 'button', 'Generate Orbit', false);
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