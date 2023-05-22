import { GM } from "../../../main.js";

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
        this.#buildCard(formName);
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
     * @param {name string} formName of the form
     * @param {fields Array} fields array of objects containing labelName, type and fieldName data
     * @returns {form Object} form html element
     */
    #createForm(formName, fields) {
        this.#form = GM.HF.createNewForm(formName.name, '', [formName.className], []);
        fields.forEach((field) => {
            const fieldWrapper = GM.HF.createNewDiv('', '', ['field-wrapper'], []);

            // create field label
            const fieldLabel = GM.HF.createNewLabel('', '', [field.type + '-' + field.fieldName], [], [], field.labelName + ': ');

            // create fields
            var formField = this.#createFormField(field);
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
    #createFormField(field) {
        var fieldNameUnique = field.type + '-' + field.fieldName;
        var formField;
        switch (field.type) {
            case 'text':
                formField = GM.HF.createNewTextInput(fieldNameUnique, field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                if (field.value) {
                    formField.value = field.value;
                }
                break;
            case 'date':
                formField = GM.HF.createNewTextInput(fieldNameUnique, field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                // set default value
                if (field.value) {
                    formField.value = field.value;
                }
                else {
                    formField.value = '2000-01-01';
                }
                formField._datepicker = flatpickr(formField, {
                    dateFormat: 'Y-m-d',
                    allowInput: true,
                });
                if (field.fieldName === 'begin' || field.fieldName === 'end') {
                    formField.classList.add('date-range');
                }
                break;
            case 'dropdown':
                const options = field.options;
                formField = GM.HF.createNewSelect('dropdown-' + field.fieldName, field.fieldName, ['field-input'], [], Object.keys(options), Object.values(options));
                break;
            default:
                formField = GM.HF.createNewTextInput(fieldNameUnique, field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], 'text', false);
                if (field.value) {
                    formField.value = field.value;
                    console.log(formField);
                }
        }
        return formField;
    }

    /** --- PRIVATE ---
     * Creates the submit button of the existing form
     * @param {formName String} formName of the form to attach the submit button
     * */
    #createSubmitButton(formName) {
        const submitButtonWrapper = GM.HF.createNewDiv('', '', ['button-wrapper'], []);
        const submitButton = GM.HF.createNewButton(formName.name + '-btn', '', ['btn', 'form-submit-btn'], [], 'button', 'Search', false);
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
    appendFormFieldToolTip(fieldinfo) {
        var tooltipDiv = GM.HF.createNewDiv('', '', ['tooltip-div'], []);
        var tooltipIcon = GM.HF.createNewIMG('', '', '../../../images/icons/info.png', ['tooltip-img'], [{ style: 'width', value: '30px' }], 'form field format');
        var tooltipText = GM.HF.createNewSpan('', '', ['tooltip-text'], [], fieldinfo);
        tooltipDiv.appendChild(tooltipIcon);
        tooltipDiv.appendChild(tooltipText);

        tooltipDiv.addEventListener('mouseenter', () => {
            const tooltipDivRect = tooltipDiv.getBoundingClientRect();
            const right = window.innerWidth - tooltipDivRect.x;
            tooltipText.style.top = `${tooltipDivRect.top}px`; // Adjust the vertical position
            tooltipText.style.right = `${right}px`; // Position it right next to the tooltip-div
        });

        return tooltipDiv;
    }

    appendMessage(wrapper, message) {
        var formMessage = GM.HF.createNewParagraph('', '', ['form-message'], [], message);
        wrapper.insertBefore(formMessage, wrapper.firstChild);
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


    getHTML = () => this.dataTable.get('wrapper');

    getCard() {
        return { wrapper: this.#wrapper, formName: this.#formName, form: this.#form, submitButton: this.#submitButton };
    }

    getFormFields() {
        var form = this.#form;
        return form.children;
    }

}

