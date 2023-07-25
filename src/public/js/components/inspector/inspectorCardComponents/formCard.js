import { GM } from "../../../main.js";
import { MinMaxFilter } from './minMaxFilter.js';


/** 
 * Creates Form elements
 * @param {formName Object} formName contains the 'name' of the form used as id of HTML elements in the form and
 *                                            the 'className'' of the form used as the class name of the HTML elements in the form
 * @param {fields Object} fields contains the 'type' of the field HTML element, 'labelName' for the label of the field, and
 *                                            the 'fieldName' as the name of the field used as an id of the HTML element
 * */
export class FormCard {

    #wrapper;
    #formName;
    #form;
    #submitButton;

    constructor(formName, fields) {
        this.#formName = formName.name;
        this.#createElements(formName, fields);
        this.#buildCard();
    }

    #createElements(formName, fields) {
        this.#createWrapper();
        this.#createForm(formName, fields);
        this.#createSubmitButton(formName);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#form);
        this.#wrapper.appendChild(this.#submitButton);
    }

    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['form-wrapper'], []);
    }

    /** --- PRIVATE ---
     * Creates the initial form
     * @param {formName string} formName of the form
     * @param {fields Array} fields array of objects containing labelName, type and fieldName data
     * @returns {form Object} form html element
     */
    #createForm(formName, fields) {
        this.#form = GM.HF.createNewForm(formName.name, '', [formName.className], []);
        fields.forEach((field) => {
            const fieldWrapper = GM.HF.createNewDiv('', '', ['field-wrapper'], []);

            // create field label
            const fieldInputId = field.fieldName + '-' + field.index;
            const fieldLabel = GM.HF.createNewLabel('', '', [`${fieldInputId}`], [], [], field.labelName + ': ');

            // create fields
            var formField = this.#createFormField(field, fieldInputId);
            // append to fieldWrapper
            fieldWrapper.appendChild(fieldLabel);
            fieldWrapper.appendChild(formField);

            // append fields to the form
            this.#form.appendChild(fieldWrapper);
        });
    }

    /** --- PRIVATE ---
     * Creates the form field
     * @param {field Object} field object contains labelName, type, and fieldName data 
     * */
    #createFormField(field, fieldInputId) {
        var formField;
        switch (field.type) {
            case 'text':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['field-input-wrapper'], []);
                var textInput = GM.HF.createNewTextInput('', field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                //formField.setAttribute('remote', field.remote);
                if (field.value) {
                    textInput.value = field.value;
                }
                formField.appendChild(textInput);
                break;
            case 'date':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['field-input-wrapper'], []);
                var textInput = GM.HF.createNewTextInput('', field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                //formField.setAttribute('remote', field.remote);
                // set default value
                if (field.value) {
                    textInput.value = field.value;
                }
                else {
                    textInput.value = '2000-01-01';
                }
                textInput._datepicker = flatpickr(textInput, {
                    dateFormat: 'Y-m-d',
                    allowInput: true,
                });
                if (field.fieldName === 'begin' || field.fieldName === 'end') {
                    textInput.classList.add('date-range');
                    textInput.setAttribute('id', `date-range-${field.fieldName}-${field.index}`);
                }
                formField.appendChild(textInput);
                break;
            case 'dropdown':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['field-input-wrapper'], []);
                const options = field.options;
                var values = [];
                var displayNames = [];
                if (options) {
                    values = options.map((obj) => { return obj.Key });
                    displayNames = options.map((obj) => { return obj.Value });
                }
                var dropdown = GM.HF.createNewSelect('', field.fieldName, ['field-input'], [], values, displayNames);
                formField.appendChild(dropdown);
                break;
            case 'checkbox':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['checkbox-wrapper', 'field-input-wrapper'], []);
                const checkbox_options = field.options;
                // foreach option, create check box
                checkbox_options.forEach((option) => {
                    var checkbox = GM.HF.createNewCheckbox('checkbox-' + field.fieldName + '-'+ option.value,
                        field.fieldName + '-' + option.value, ['checkbox', 'field-input'], [], option.value, option.key, false);
                    formField.appendChild(checkbox.wrapper);
                });
                
                //formField.setAttribute('remote', field.remote);
                break;
            case 'radio':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['radio-wrapper', 'field-input-wrapper'], []);
                console.log(field);
                const radio_options = field.options;
                // foreach option, create radiobuttons
                radio_options.forEach((option) => {
                    const id = 'radiobutton-' + field.fieldName + '-' + option.value;
                    const radiolabel = document.createElement('Label');
                    radiolabel.setAttribute('for', id);
                    radiolabel.innerHTML = option.key;
                    var radioButton = GM.HF.createNewRadioButton(id, field.fieldName, ['radiobutton', 'field-input'], [], field.type, option.value, false);
                    formField.appendChild(radioButton);
                    formField.appendChild(radiolabel);
                });
                //formField.setAttribute('remote', field.remote);
                break;
            case 'range':
                // create range input


                /*var minMaxFilter = new MinMaxFilter(field.fieldName, field.min, field.max, field.dataType, field.dataFormat);
                formField = minMaxFilter.getHTML();*/
                break;
            case 'typeahead':
                formField = GM.HF.createNewDiv(fieldInputId, '', ['field-input-wrapper'], [{ style: "position", value: "relative" }]);

                var textInput = GM.HF.createNewTextInput('', field.fieldName, ['typeahead-input', 'field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                textInput.setAttribute('remote', field.remote);
                if (field.value) {
                    textInput.value = field.value;
                }
                // create empty container for result
                const resultContainer = GM.HF.createNewDiv('', '', ['typeahead-result-container'], [{ style: 'display', value: "none" }]);
                formField.appendChild(textInput);
                formField.appendChild(resultContainer);

                // add event listener
                /*textInput.addEventListener("input", async event => {
                    const inputValue = event.target.value.trim();
                    if (inputValue === '') {
                        // If the input is empty, hide the suggestions container
                        resultContainer.style.display = 'none';
                    } else {
                        // Fetch suggestions from the API and update the suggestions container
                        //const suggestions = await fetchSuggestions(inputValue);
                        //updateSuggestions(suggestions);
                    }
                    console.log(inputValue);
                });*/

                break;
            default:
                formField = GM.HF.createNewDiv(fieldInputId, '', ['field-input-wrapper'], []);
                var textInput = GM.HF.createNewTextInput('', field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                //formField.setAttribute('remote', field.remote);
                if (field.value) {
                    textInput.value = field.value;
                }
                formField.appendChild(textInput);
                break;
        }
        return formField;
    }

    /** --- PRIVATE ---
     * Creates the submit button of the existing form
     * @param {formName String} formName of the form to attach the submit button
     * */
    #createSubmitButton(formName) {
        const submitButtonWrapper = GM.HF.createNewDiv('', '', ['button-wrapper'], []);
        const submitButton = GM.HF.createNewButton(formName.name + '-btn', '', ['btn', 'form-submit-btn'], [], 'button', formName.submitButton, false);
        //submitButton.setAttribute('form', formName.name);
        submitButtonWrapper.appendChild(submitButton);
        this.#submitButton = submitButtonWrapper;
    }

    
    /** --- PUBLIC ---
     * addFormField adds the field to this form card.
     * @param {Object} field has the 'type' element as the html element type,
     *                      'labelName' as the display name for this html element type,
     *                      and the 'fieldName' as the value for this html element type.
     * */
    appendFormField(field) {
        var form = this.getCard().form;
        // create field elements for this field
        var fieldWrapper = GM.HF.createNewDiv('', '', ['field-wrapper'], []);
        var label = GM.HF.createNewLabel('', '', [field.labelName], [], [], field.labelName + ': ');
        var input = this.#createFormField(field);
        if (field.value) {
            input.value = field.value;
        }

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);

        form.appendChild(fieldWrapper);
        console.log(form);
        //return fieldWrapper;
    }

    /** updateFormFields updates the fields of this form card.
     * @param {fields Array} fields array of field objects containing the labelName and fieldName of the fields to be updated.
     * */
    updateFormFields(fields) {
        var form = this.getCard().form;

        // Clear the form fields
        while (form.firstChild) {
            form.removeChild(form.firstChild);
        }

        // Append the form fields passed
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            // create field elements
            var fieldWrapper = GM.HF.createNewDiv('', '', ['field-wrapper'], []);
            var label = GM.HF.createNewLabel('', '', [field.labelName], [], [], field.labelName + ': ');
            var input = this.#createFormField(field);
            if (field.value) {
                input.value = field.value;
            }

            fieldWrapper.appendChild(label);
            fieldWrapper.appendChild(input);

            form.appendChild(fieldWrapper);
        }
    }


    // In progress
    /** appendRemoveField appends the remove buttons to each of the form
     *                      with the remove event from the form
     * */
    appendRemoveField() {
        // find the current form
        var formWrapper = this.getCard().wrapper;
        var fieldWrappers = formWrapper.querySelectorAll('.field-wrapper');
        
        fieldWrappers.forEach((field) => {
            // Create remove btn
            var removeFieldIcon = GM.HF.createNewSpan('', '', ['remove-field-btn'], [], '', 'x', false);

            // append remove icon to the field wrapper
            field.appendChild(removeFieldIcon);
        }); 

        // Remove field event
          // add id for each form field
          // remove that field-wrapper div
    }


    /** --- PUBLIC ---
     * Creates the form field tooltip
     * @param {fieldinfo String} fieldinfo tooltip
     * */
    appendToolTip(fieldinfo, tooltipElement) {
        var tooltipDiv = GM.HF.createNewDiv('', '', ['tooltip-div'], []);
        //var tooltipIcon = GM.HF.createNewIMG('', '', '../../../images/icons/info.png', ['tooltip-img'], [{ style: 'width', value: '30px' }], 'form field format');
        var tooltipSpan = GM.HF.createNewSpan('', '', ['tooltip-text'], [], fieldinfo);

        if (!tooltipElement) {
            tooltipElement = GM.HF.createNewIMG('', '', '../../../images/icons/info.png', ['tooltip-img'], [{ style: 'width', value: '30px' }], 'form field format');
        }
        tooltipDiv.appendChild(tooltipElement);
        //tooltipDiv.appendChild(tooltipIcon);
        tooltipDiv.appendChild(tooltipSpan);

        tooltipDiv.addEventListener('mouseenter', (e) => {
            const tooltipElementRect = tooltipElement.getBoundingClientRect();
            console.log(tooltipElementRect);
            const top = tooltipElementRect.top - (tooltipElementRect.height/4);
            const right = window.innerWidth - tooltipElementRect.left;
            tooltipSpan.style.top = `${top}px`; // Adjust the vertical position
            tooltipSpan.style.right = `${right}px`; // Position it right next to the tooltip-div
        });
        

        return tooltipDiv;
    }

    appendMessage(wrapper, message) {
        var formMessage = GM.HF.createNewParagraph('', '', ['form-message'], [], message);
        wrapper.insertBefore(formMessage, wrapper.firstChild);
    }


    /** Add a Flatpickr Date Range Plugin to corresponding fields
     * @param {dateFields} array of objects consisting of date field information
     *                      (e.g. { index: 0, remote: false, labelName: "Begin", fieldName: "begin", type: "date" })
     * */
    createFlatpickrRangePlugin(dateFields) {
        // for all the date fields with the same index, find begin and end pairs
        var beginEndPairs = this.findBeginEndPairs(dateFields);

        // if both begin and end exists, add plugin for those
        if (beginEndPairs.length > 0) {
            beginEndPairs.forEach(pair => {
                var beginField = pair.begin;
                var endField = pair.end;

                var endFieldId = `#date-range-${endField.fieldName}-${endField.index}`;
                // Initialize flatpickr with the range plugin
                flatpickr(`#date-range-${beginField.fieldName}-${beginField.index}`, {
                    mode: 'range',
                    dateFormat: 'Y-m-d', // Set the desired date format (ISO format: YYYY-MM-DD)
                    plugins: [new rangePlugin({ input: endFieldId })],
                    //appendTo: targetDiv,
                });
            });
        }
    }

    findBeginEndPairs(dateFields) {
        var pairs = [];
        dateFields.forEach(beginField => {
            if (beginField.fieldName === 'begin') {
                var endField = dateFields.find(field => field.index === beginField.index && field.fieldName === 'end'); 
                if (endField) {
                    pairs.push({ begin: beginField, end: endField });
                }
            }
        });
        return pairs;
    }

/*
    // Create Layout
    #createLayout() {
        //const wrapper = GM.HF.createNewDiv('', '', ['sql-query-wrapper'], []);

        const dateRangeWrapper = GM.HF.createNewDiv('', '', ['query-date-range-wrapper'], []);
        const cometWrapper = GM.HF.createNewDiv('', '', ['query-comet-wrapper'], []);
        const buttonsWrapper = GM.HF.createNewDiv('', '', ['query-buttons-wrapper'], []);

        const dateRangeLabel = GM.HF.createNewLabel('', '', 'date-range-label', [], [], ['Dates Between: ']);
        const cometLabel = GM.HF.createNewLabel('', '', 'comet-label', [], [], ['Comet: ']);

        //const dateRange = GM.HF.createNewDiv('query-date-range', '', ['range-slider-wrapper'], [], []);
        // create minMaxFilter here 

        const cometDropdown = GM.HF.createNewSelect('cometDD', '', [], [], ['objects', 'objecttypelink', 'objectname', 'tnos', 'centaurs' ], ['objects', 'objecttypelink', 'objectnames', 'tnos', 'centaurs']);
        const queryButton = GM.HF.createNewButton('queryBtn', [], ['query-button'], ['border-radius: 3px'], 'submit', 'Query', '');

        *//*const rangeSliderBar = GM.HF.createNewDiv('', '', ['range-slider-background-bar'], [], []);
        const rangeSliderBall_left = GM.HF.createNewDiv('', '', ['range-slider-ball'], [], []);
        const rangeSliderBall_right = GM.HF.createNewDiv('', '', ['range-slider-ball-right'], [], []);*//*

        // Create Section Wrappers
        this.card.appendChild(dateRangeWrapper);
        this.card.appendChild(cometWrapper);
        this.card.appendChild(buttonsWrapper);

        // Create Labels for each section
        dateRangeWrapper.appendChild(dateRangeLabel);
        cometWrapper.appendChild(cometLabel);

        // Append Elements to each section
        //dateRangeWrapper.appendChild(dateRange);
        cometWrapper.appendChild(cometDropdown);
        buttonsWrapper.appendChild(queryButton);

        // Range Input Elements


        // Range Slider Elements
        *//*dateRange.appendChild(rangeSliderBar);
        dateRange.appendChild(rangeSliderBall_left);
        dateRange.appendChild(rangeSliderBall_right);*//*
    }*/


    getCard() {
        return { wrapper: this.#wrapper, formName: this.#formName, form: this.#form, submitButton: this.#submitButton };
    }

    getFormFields() {
        var form = this.#form;
        return form.children;
    }

}

