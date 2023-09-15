/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { AxisCard, XAxisCard, YAxisCard } from './inspectorCardComponents/axisCard.js';
import { SeriesCard } from './inspectorCardComponents/seriesCard.js';
import { ObjectSearchCard } from './inspectorCardComponents/objectSearchCard.js';
import { KeyValueCard } from './inspectorCardComponents/keyValueCard.js';
import { HTMLFactory } from '../../htmlGeneration/index.js';
import { IncludeColumnCard } from './index.js';
import { CompositeDetailsCard } from './inspectorCardComponents/compositeDetailsCard.js';
import { MinMaxFilter } from './inspectorCardComponents/minMaxFilter.js';
import { FormCard } from './inspectorCardComponents/formCard.js';
import { FormSelectCard } from './inspectorCardComponents/formSelectCard.js';
import { ConversionCard } from './inspectorCardComponents/conversionCard.js';
import { Publisher, Message } from '../../communication/index.js';
import { INSPECTOR, INSPECTOR_CARD, WORKER_MANAGER } from '../../sharedVariables/constants.js';

/**
 * This class should not be called directly but called through the InspectorCardMaker.
 */
export class InspectorCard {
    
    #cardId;
    #wrapperElement;
    #headerElement;
    bodyElement;
    #titleElement;
    #maxButton;
    #collapseButton;
    #expandButton;
    #title;
    #expanded;
    #maximized;
    #color;
    #dynamicFields;
    #axisCardMap;
    #dragElement;
    maxExpansion;


    constructor(title, color, key) {
        this.HF = new HTMLFactory();
        this.#cardId = key;
        this.resizing = false;
        this.maxExpansion = 200;
        this.expandSize = 200;
        this.minHeight = 10;
        this.#dynamicFields = new Map();
        this.#axisCardMap = new Map();
        this.#color = color;
        this.#expanded = false;
        this.#maximized = false;
        this.#title = title;
        this.mousePositions = [];
        this.#createDomNode();
        this.publisher = new Publisher();
    };

    #createDomNode() {
        this.#wrapperElement = this.#createWrapperNode();
        this.#headerElement = this.#createHeaderNode();
        this.bodyElement = this.#createBodyNode();
        this.#titleElement = this.#createTitleNode();
        this.#dragElement = this.#createDragElement();
        this.#maxButton = this.#createMaxButton();
        this.#expandButton = this.#createExpandButton();
        this.#collapseButton = this.#createCollapseButton();
        this.#wrapperElement.appendChild(this.#headerElement).append(this.#titleElement);
        this.#headerElement.appendChild(this.#maxButton);
        this.#headerElement.appendChild(this.#expandButton);
        this.#headerElement.append(this.#collapseButton);
        this.#wrapperElement.appendChild(this.bodyElement);
        this.#wrapperElement.appendChild(this.#dragElement);
        this.#addResizeEventListeners();
        this.#addExpansionEventListener();
        this.#addMaximizeEventListener();
        this.#addCollapseEventListener();
    }

    #createWrapperNode() {
        return this.HF.createNewDiv(`Inspector-card-${this.#cardId}`, `Inspector-card-${this.#cardId}`, ['inspector-card'], []);
    }

    #createHeaderNode() {
        return this.HF.createNewDiv(`Inspector-card-header-${this.#cardId}`, `Inspector-card-header-${this.#cardId}`, ['inspector-card-header'], [{ style: 'backgroundColor', value: this.#color }]);
    }

    #createBodyNode() {
        return this.HF.createNewDiv(`Inspector-card-body-${this.#cardId}`, `Inspector-card-body-${this.#cardId}`, ['inspector-card-body'], []);
    }

    #createTitleNode() {
        return this.HF.createNewH3(`Inspector-card-header-h3-${this.cardId}`, `Inspector-card-header-h3-${this.cardId}`, [], [], this.#title);
    }

    #createDragElement() {
        return this.HF.createNewDiv('', '', ['inspector-card-drag-element'], []);
    }


    #createMaxButton() {
        const buttonDiv = this.HF.createNewDiv('', '', ['inspector-card-max-button'], []);
        const img = this.HF.createNewIMG('', '', '../../../images/icons/maximize.png', [], [], 'Minimize or Maximize Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
    }

    #createCollapseButton() {
        const buttonDiv = this.HF.createNewDiv('', '', ['inspector-card-collapse-button'], []);
        const img = this.HF.createNewIMG('', '', '../../../images/icons/minus.png', [], [], 'Collapse Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
    }

    #createExpandButton() {
        const buttonDiv = this.HF.createNewDiv('', '', ['inspector-card-expand-button'], []);
        const img = this.HF.createNewIMG('', '', '../../../images/icons/squares.png', [], [], 'Expand Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
    }

    #addResizeEventListeners() {
        this.#dragElement.addEventListener('mousedown', this.startResize.bind(this));
        document.addEventListener('mouseup', this.endResize);
        document.addEventListener('mousemove', e => {
            this.resize(e);
            e.preventDefault();
        });
    }

    // RESIZE FUNCTIONS

    startResize = () => {
        this.resizing = true;
        this.mousePositions = [];
    };

    endResize = () => {
        if (this.resizing) this.resizing = false;
    };

    resize = e => {
        if (this.resizing) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const distance = this.#calculateDistanceTraveled(this.mousePositions[0], this.mousePositions[this.mousePositions.length - 1]);
                this.#resetMousePositionsArray(this.mousePositions[this.mousePositions.length - 1]);
                this.#updateHeight(distance.y);
                this.setHeight(this.maxExpansion);
            }
        }
    }

    #updateHeight = yDistanceTraveled => {
        const value = this.maxExpansion + parseInt(yDistanceTraveled);
        if (value > 50) this.maxExpansion = value;
    }

    setHeight = (height) => {
        this.bodyElement.style.height = `${height}px`;
    }

    /**
     * Calculates the distance the mouse has traveled in pixels
     * @param {object} firstPosition index [0] in the mousePositions array - contains x and y
     * @param {object} lastPosition  index [array.length-1] in the mousePositions array - contains x and y
     * @returns {x: xdistance (number), y: ydistance (number)}
     */
    #calculateDistanceTraveled = (firstPosition, lastPosition) => {
        return { x: lastPosition.x - firstPosition.x, y: lastPosition.y - firstPosition.y };
    };

    /**
     * When a drag is completed, this function is called to reset the positions array. The last measured position is places in the first index.
     * @param {number} lastPosition the last captured mouse position
     */
    #resetMousePositionsArray = lastPosition => this.mousePositions = [lastPosition];

    #addExpansionEventListener() {
        this.#expandButton.addEventListener('click', this.expandCard.bind(this));
    }

    #addMaximizeEventListener() {
        this.#maxButton.addEventListener('click', this.maximizeCard.bind(this));
    }
    #addCollapseEventListener() {
        this.#collapseButton.addEventListener('click', this.minimizeCard.bind(this));
    }

    maximizeCard() {
        if (this.#maximized) {
            const message = new Message(INSPECTOR, INSPECTOR_CARD, 'Minimize Card Event', {});
            this.sendMessage(message);
            this.minimizeCard();
        }
        else {
            const message = new Message(INSPECTOR, INSPECTOR_CARD, 'Maximize Card Event', { id: this.#cardId });
            this.sendMessage(message)
            this.bodyElement.style.height = `${this.getParentHeight() - 40}px`;
            this.#maximized = true;
        }
        this.showAllElements();
    }

    /** --- PUBLIC ---
     * When a user selects a Node in the GOJS environment, the associated inspector card is maximized.
     */
    maximizeCardEnvironmentClick() {
        const message = new Message(INSPECTOR, INSPECTOR_CARD, 'Maximize Card Event', { id: this.#cardId });
        this.sendMessage(message)
        this.bodyElement.style.height = `${this.getParentHeight() - 40}px`;
        this.#maximized = true;
        this.showAllElements();
    }

    minimizeCard() {
        if (this.#maximized) {
            const message = new Message(INSPECTOR, INSPECTOR_CARD, 'Minimize Card Event', {});
            this.sendMessage(message);
        }
        this.#maximized = false;
        this.#expanded = false;
        this.setHeight(this.minHeight);
        this.hideAllBodyChildren();
    }

    expandCard() {
        if (!this.#expanded) {
            if (this.#maximized) {
                const message = new Message(INSPECTOR, INSPECTOR_CARD, 'Minimize Card Event', {});
                this.sendMessage(message);
            }
            this.#expanded = true;
            this.#maximized = false;
            this.setHeight(this.expandSize);
            this.showAllElements();
        } else {
            this.minimizeCard();
        }

    }

    hideAllBodyChildren() {
        this.bodyElement.childNodes.forEach(child => child.style.display = 'none');
    }

    showAllElements() {
        this.bodyElement.childNodes.forEach(child => child.style.display = 'flex');
    }

    getParentHeight() {
        return document.querySelector('#mainWrapper').getBoundingClientRect().height;
    }

    appendToBody(element) {
        this.bodyElement.appendChild(element);
        if (!this.#maximized && !this.#expanded) element.style.display = 'none';
    }

    /** --- PUBLIC ---
     * Dynamic fields are key, values that can be changed. 
     * @param {string} key key identifying the field 
     * @param {string} text value to change in the card. 
     */
    updateDynamicField(key, text) {
        const keyValueCard = this.#dynamicFields.get(key);
        if (keyValueCard) {
            keyValueCard.updateValue(text);
        } else printErrorMessage(`Undefined or Null Variable`, `data: ${data}. -- Inspector Card -> updateDynamicField`);
    }

    

    /** --- PUBLIC ---
     * This builds a card for including columns of a data table. It is a row of checkboxes that can be toggled on or off.
     * @param {*} checkboxes 
     * @returns 
     */
    addIncludeColumnCard(checkboxes) {
        const card = new IncludeColumnCard(checkboxes);
        this.appendToBody(card.getCard());
        return card;
    }


    // add Xaxis card for Chart modules
    addAxisCard(axisName, fields, defaultField) {
        const card = new AxisCard(axisName, fields, defaultField);
        return card;
    }

    addSeriesCard(fields, defaultField, xAxisCard, yAxisCard) {
        const card = new SeriesCard(fields, defaultField, xAxisCard, yAxisCard);
        return card;
    }

    /** --- PUBLIC ---
     * This passes HTML elements and generates a field in the inspector card where user can select options for the x axis of a chart.
     * When adding options in the future, pass them through this function and add them to the axis card.
     * @param {HTML Select Object} dropdown dropdown for selecting main field to chart 
     * @param {HTML p Object} labelInput label for the dropdown 
     * @param {HTML Checkbox Object} gridCheckbox Checkbox to toggle background grid
     * @param {HTML Checkbox Object} tickCheckbox Checkbox to toggle ticks
     * @param {HTML Button Object} addTraceButton Button that can be clicked to add a new trace
     * @param {function} addTraceFunction function that can be called to add a trace to the chart when add trace button is clicked
     * @param {HTML Select Object} errorDropDown dropdown to choose error field
     * @returns the card
     */
    addXAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        const card = new XAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
        this.appendToBody(card.getCard());
        this.#axisCardMap.set('x', card);
        return card;
    }

    /** --- PUBLIC ---
     * This passes HTML elements and generates a field in the inspector card where user can select options for the x axis of a chart.
     * When adding options in the future, pass them through this function and add them to the axis card.
     * @param {HTML Select Object} dropdown dropdown for selecting main field to chart 
     * @param {HTML p Object} labelInput label for the dropdown 
     * @param {HTML Checkbox Object} gridCheckbox Checkbox to toggle background grid
     * @param {HTML Checkbox Object} tickCheckbox Checkbox to toggle ticks
     * @param {HTML Button Object} addTraceButton Button that can be clicked to add a new trace
     * @param {function} addTraceFunction function that can be called to add a trace to the chart when add trace button is clicked
     * @param {HTML Select Object} errorDropDown dropdown to choose error field
     * @returns the card
     */
    addYAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        const card = new YAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
        this.appendToBody(card.getCard());
        this.#axisCardMap.set('y', card);
        return card;
    }

    /** --- PUBLIC ---
     * Creates a KeyValueCard instance and appends it to the DOM.
     * @param {string} key The id of the field and the label for the card.
     * @param {*} value The value of the card.
     * @returns The KeyValue Card object. */
    addKeyValueCard(key, value) {
        const card = new KeyValueCard(key, value);
        this.appendToBody(card.getCard());
        return card;
    }

    /** --- PUBLIC ---
     * Creates a card with a dropdown populated with available object names.
     * @param {string[]} objects array of strings with the object names
     * @returns The ObjectSearchCard object */
    addObjectsSearchCard(objects) {
        const card = new ObjectSearchCard(objects);
        this.appendToBody(card.getCard().wrapper);
        return card;
    }

    /** --- PUBLIC ---
     * Min Max Cards are elements of the filter inspector card. Each field gets a single min/max card where the user can apply the filters
     * to a data field based on the metadata for that field.
     * @param {string} label the name of the column
     * @param {Number} min the min value in the metadata
     * @param {Number} max the max value in the metadata
     * @param {string} dataType the data type
     * @param {string} dataFormat the format of the data (useful for floats/ints or dates etc.)
     * @param {function} changeDataTypeFunction function called when user wants to change an incorrectly assigned datatype
     * @returns a function that gets the data from this card for applying the filters. */
    addMinMaxCard(label, min, max, dataType, dataFormat, changeDataTypeFunction) {
        const card = new MinMaxFilter(label, min, max, dataType, dataFormat, changeDataTypeFunction);
        this.appendToBody(card.getHTML());
        return card.getData.bind(card);
    }

    addDynamicKeyValueCard(key, value) {
        this.#dynamicFields.set(key, this.addKeyValueCard(key, value));
    }

    addChartTrace(dropdown, errorDropdown) {
        this.#axisCardMap.get('y').addTraceDropdown(dropdown, errorDropdown);
    }

    /** --- PUBLIC ---
     * Creates a Composite Details Card (This is not really implemented yet, except for the option to save the modules)
     * @param {Object} groupData Details of the group
     * @param {function} saveModuleCallback Function that is bound to the group card where user can save the group to be used later as a prefab
     */
    addCompositeDetailsCard(groupData, saveModuleCallback) {
        const card = new CompositeDetailsCard(groupData, saveModuleCallback);
        this.appendToBody(card.getCard());
    }

    /** --- PUBLIC ---
     * This is the card that is used for the Data Conversion. Metadata is passed to the card and the options are generated there.
     * @param {Metadata Object} metadata object containing full set of metadata for a dataset
     * @returns The card object (not just the HTML element)
     */
    addConversionCard(metadata) {
        const cardObject = new ConversionCard(metadata);
        this.appendToBody(cardObject.getCard());
        return cardObject;
    }


    //------------------------------------------- SEARCH MODULE ------------------------------------------------
    /** --- PUBLIC ---
     * This adds the select element to select the type of the query
     * @param { Object } label of the select element. key is the class name and value is the label text
     * @param { Object } options of the select element
     */
    addQueryTypeSelect(wrapper, label, options, tooltipContent) {
        const selectCard = new FormSelectCard(label, options);
        var selectWrapper = selectCard.getCard().wrapper;
        // Create tooltip of the selected query type option
        const dropdown = selectCard.getCard().dropdown;
        var selected = dropdown.options[dropdown.selectedIndex].text;
        var match = tooltipContent.filter(x => x.type == selected)[0];
        var description = "Query Type: " + selected;
        if (match) {
            description = match.description;
        }
        // tooltip
        var tooltipElement = selectWrapper.querySelector('label');
        var tooltip = selectCard.appendToolTip(description, tooltipElement);
        selectWrapper.insertBefore(tooltip, selectWrapper.firstChild);

        wrapper.appendChild(selectCard.getCard().wrapper);
        return selectCard;
    }

    /** --- PUBLIC ---
     * This adds the form fields to the Search Form. This is the initial load where the default fields are added.
     * @param { string } name of form to add
     * @param { Object } fields of the initial form format
     * @param { Array } fieldsTooltip Array of objects containing field tooltip content
     * @returns The card object (not just the HTML element)
     */
    addSearchFormCard(moduleKey, formName, fields) {
        const card = new FormCard(formName, fields);

        

        // Append form message
        const btnWrapper = card.getCard().submitButton;
        card.appendMessage(btnWrapper, 'Empty fields will not be searched.');

        return card;
    }

    // adds tooltip and remote field functions
    addFormFieldFunctions(moduleKey, searchFormCard, fields, fieldsTooltip) {
        var formFields = searchFormCard.getFormFields();
        formFields.forEach((formField) => {
            const fieldLabel = formField.querySelector('label');
            const fieldElement = formField.querySelector('.field-input');
            if (fieldElement) {
                // Append form field tooltips
                const fieldName = fieldElement.getAttribute('name');
                const match = fieldsTooltip.filter(x => x.field == fieldName);
                if (match.length > 0) {
                    let tooltip = searchFormCard.appendToolTip(match[0].format, fieldLabel);
                    formField.insertBefore(tooltip, formField.firstChild);
                }

                const fieldObject = fields.filter(x => x.fieldName == fieldName)[0]; 
                // Handle Remote Data Search Fields... create function for this?
                if (fieldObject && fieldObject.remote) {
                    this.#handleRemoteSearchField(moduleKey, fieldObject, fieldElement);
                }
            }
        });
    }

    #handleRemoteSearchField(moduleKey, fieldObject, fieldElement) {
        const fieldWrapper = fieldElement.closest('.field-input-wrapper');

        switch (fieldObject.dirName) {
            case "objects":
                var resultContainer = fieldElement.nextElementSibling;
                // Close the suggestions container when clicking outside
                document.addEventListener('click', event => {
                    if (!event.target.closest('.typeahead-result-container') && !event.target.closest('.typeahead-input')) {
                        resultContainer.style.display = 'none';
                    }
                });
                // add eventListener for object field typeahead function
                fieldElement.addEventListener('input', event => {
                    const inputValue = event.target.value.trim();
                    if (inputValue === '') {
                        // If the input is empty, hide the suggestions container
                        resultContainer.style.display = 'none';
                    } else {
                        // Fetch suggestions from the API and update the suggestions container
                        //const suggestions = await fetchSuggestions(inputValue);
                        //updateSuggestions(suggestions);
                        const message = new Message(WORKER_MANAGER, INSPECTOR_CARD, 'Get Remote Objects Suggestions',
                            {
                                moduleKey: moduleKey,
                                dirName: fieldObject.dirName,
                                fieldWrapperId: fieldWrapper.getAttribute('id'),
                                term: inputValue,
                                delay: 1500,
                            });
                        this.sendMessage(message);
                    }
                });
                break;
            default: // dropdown remote fields
                const message = new Message(WORKER_MANAGER, INSPECTOR_CARD, 'Get Remote Dropdown Options',
                    {
                        moduleKey: moduleKey,
                        dirName: fieldObject.dirName,
                        fieldWrapperId: fieldWrapper.getAttribute('id'),
                        delay: 1000,
                    });
                this.sendMessage(message);
        }
    }

    /** --- PUBLIC ---
     * This updates the form fields of the specified Search Form.
     * @param { string } fromCard object to update
     * @param { Object } fields of the form to update with
     * @param { Array } fieldsTooltip Array of objects containing field tooltip content
     * @returns The card object (not just the HTML element)
     */
    updateSearchFormFields(moduleKey, formCard, fields, fieldsTooltip) {
        formCard.updateFormFields(fields);
        const formFields = formCard.getFormFields();
        console.log(formFields);
        formFields.forEach((formField) => {            
            const fieldLabel = formField.querySelector('label');
            const fieldElement = formField.querySelector('.field-input');
            if (fieldElement) {
                const fieldName = fieldElement.getAttribute('name');
                const match = fieldsTooltip.filter(x => x.field == fieldName);
                if (match.length > 0) {
                    var tooltip = formCard.appendToolTip(match[0].format, fieldLabel);
                    formField.insertBefore(tooltip, formField.firstChild);
                }

                //console.log(fields);
                //console.log(fieldName);
                const fieldObject = fields.filter(x => x.fieldName == fieldName)[0];
                //console.log(fieldObject);

                // Handle Remote Data Search Fields... create function for this?
                if (fieldObject && fieldObject.remote) {
                    this.#handleRemoteSearchField(moduleKey, fieldObject, fieldElement);
                }
            }
        });
    }



    //------------------------------------------- ORBIT MODULE (temporary) ------------------------------------------------
    // Add object names for data points
    addObjectOptions(objectNames) {
        var wrapper = this.HF.createNewDiv('', '', ['object-options', 'options'], []);
        var objectsLabel = this.HF.createNewLabel('', '', '', ['objects-title'], [], 'Objects: ');
        wrapper.appendChild(objectsLabel);
        
        var checkboxGroupWrapper = this.HF.createNewDiv('', '', ['object-checkbox-group', 'checkbox-group'], []);
        objectNames.forEach(object => {
            if (object) {
                var checkbox = this.HF.createNewCheckbox('', '', ['object-checkbox'], [], object, object, true);
                checkboxGroupWrapper.appendChild(checkbox.wrapper);
            }
        });
        //var checkbox = this.HF.createNewCheckbox('', '', ['object-checkbox'], [], 'C/2017 K2', 'C/2017 K2', true);
        //checkboxGroupWrapper.appendChild(checkbox.wrapper);
        wrapper.appendChild(checkboxGroupWrapper);

        return wrapper;
    }

    // Add planet names for eliptic data
    addPlanetOptions(planetNames) {
        var wrapper = this.HF.createNewDiv('', '', ['orbit-options', 'options'], []);
        var orbitLabel = this.HF.createNewLabel('', '', '', ['orbit-title'], [], 'Orbits: ');
        wrapper.appendChild(orbitLabel);

        var checkboxGroupWrapper = this.HF.createNewDiv('', '', ['orbit-checkbox-group', 'checkbox-group'], []);
        /*var planetNames = Object.keys(eclipticData[0]).map(key => {
            if (!key.includes('id')) {
                var lastIndex = key.lastIndexOf('_');
                return key.slice(0, lastIndex);
            }
        });*/
        //planetNames = new Set(planetNames);
        planetNames.forEach(planet => {
            if (planet) {
                var checkbox = this.HF.createNewCheckbox('', '', ['planet-checkbox'], [], planet, planet, true);
                checkboxGroupWrapper.appendChild(checkbox.wrapper);
            }
        });
        wrapper.appendChild(checkboxGroupWrapper);

        return wrapper;

    }






    /////////////////////////////////////////////// temp removed ///////////////////////////////////////////////////
    /** --- PUBLIC ---
     * This adds the dynamical field append element to the inspector card.
     * @param { Object } label of the select element. key is the class name and value is the label text
     * @param { Object } options of the select element
     * @returns The card object (not just the HTML element)
     */
    addFormFieldAppend(wrapper, label, options) {
        const card = new FormSelectCard(label, options);
        // add a addButton to the card
        card.createAddButton(label);
        wrapper.appendChild(card.getCard().wrapper);
        return card;
    }

    /** --- PUBLIC ---
     * Updates the options of the formFieldAppend select element depending on the query type.
     * @param { Object } formSelectCard FormSelect object to update the options of
     * @param { Object } options of the dropdown to update to
     */
    /*updateFormFieldAppend(formSelectCard, options) {
        formSelectCard.updateDropdown(options);
    }*/

    /** --- PUBLIC ---
     * This adds the form field to the target FormCard element.
     * @param { Object } formCard object to append the field to
     * @param { Object } field of the form to append to target form
     */
    appendFormField(formCard, field) {
        formCard.appendFormField(field);
    }

    /** --- PUBLIC ---
     * This adds the form field remove function to each form fields of the target FormCard element.
     * @param { Object } formCard object to append the field to
     */
    appendFormFieldRemove(formCard) {
        formCard.appendRemoveField();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    getCard = () => this.#wrapperElement;

    sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}