import { GM } from "../../../main.js";

// experimental class
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
        this.#wrapper = GM.HF.createNewDiv('', '', ['form-wrapper'], [{ style: 'width', value: '100%' }]);
    }

    /** --- PRIVATE ---
     * Creates the fields of the form
     * @param {name string} formName of the form
     * @param {fields Object} fields object contains labelName, type and fieldName data
     * @returns {form Object} form html element
     */
    #createForm(formName, fields) {
        console.log(formName.className);
        this.#form = GM.HF.createNewForm(formName.name, '', [formName.className], []);
        fields.forEach((field) => {
            const fieldWrapper = GM.HF.createNewDiv('', '', ['field-wrapper'], []);

            // create field label
            const fieldLabel = GM.HF.createNewLabel('', '', [field.labelName], [], [], field.labelName + ': ');

            // create fields
            var formField;
            switch (field.type) {
                case 'input':
                    formField = GM.HF.createNewTextInput('', field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], '', false);
                    break;
                default:
                    formField = GM.HF.createNewTextInput('', field.fieldName, ['field-input'], [{ style: 'border', value: 'inset' }], '', false);
            }
            // append to fieldWrapper
            fieldWrapper.appendChild(fieldLabel);
            fieldWrapper.appendChild(formField);

            // append fields to the form
            this.#form.appendChild(fieldWrapper);
        });
    }

    #createSubmitButton(formName) {
        const submitButtonWrapper = GM.HF.createNewDiv('', '', ['button-wrapper'], []);
        const submitButton = GM.HF.createNewButton(formName.name, '', ['form-submit-btn'], [], 'submit', 'Search', false);
        submitButtonWrapper.appendChild(submitButton);
        this.#submitButton = submitButtonWrapper;
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

}

