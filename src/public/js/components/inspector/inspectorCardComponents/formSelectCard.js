import { GM } from "../../../main.js";


export class FormSelectCard {

    #wrapper;
    #label;
    #dropdown;
    #addButton;

    constructor(label, options) {
        this.#createElements(label, options);
        this.#buildCard();
    }


    #createElements(label, options) {
        this.#createWrapper();
        this.#createLabel(label);
        this.#createDropdown(label, options);
        //this.#createAddButton(label);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#label);
        this.#wrapper.appendChild(this.#dropdown);
        //this.#wrapper.appendChild(this.#addButton);
    }

    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['select-field-wrapper'], []);
    }

    #createLabel(label) {
        this.#label = GM.HF.createNewLabel('', '', label.key, ['select-field-label'], [], label.value);
    }

    #createDropdown(label, options) {
        this.#dropdown = GM.HF.createNewSelect(label.key + '-dropdown', '', ['select-field-dropdown'], [], Object.keys(options), Object.values(options));
    }


    /** createAddButton adds the field to this form card. Optional function if adding new fields to the form is preferred.
     * @param { Object } label of the select element. key is the class name and value is the label text
     * */
    createAddButton(label) {
        this.#addButton = GM.HF.createNewButton(label.key + '-btn', '', ['select-field-add-button'], [{ style: 'border', value: 'outset' }], 'button', 'Add', false);
        this.#wrapper.appendChild(this.#addButton);
    }

    /** updateDropdown updates the options of the dropdown.
     * @param {Object} field has the 'type' element as the html element type,
     *                      'labelName' as the display name for this html element type,
     *                      and the 'fieldName' as the value for this html element type.
     * */
    updateDropdown(options) {        
        var dropdown = this.getCard().dropdown;
        GM.HF.updateSelectOptions(dropdown, options);
    }

    getHTML = () => this.dataTable.get('wrapper');

    getCard() {
        return { wrapper: this.#wrapper, label: this.#label, dropdown: this.#dropdown, addButton: this.#addButton };
    }

}