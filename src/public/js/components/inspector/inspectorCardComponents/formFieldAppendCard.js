import { GM } from "../../../main.js";

export class FormFieldAppendCard {

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
        this.#createDropdown(options);
        this.#createAddButton();
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#label);
        this.#wrapper.appendChild(this.#dropdown);
        this.#wrapper.appendChild(this.#addButton);
    }

    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['form-field-append-wrapper'], [{ style: 'width', value: '100%' }]);
    }

    #createLabel(label) {
        this.#label = GM.HF.createNewLabel('', '', label.key, ['label'], [], label.value);
    }

    #createDropdown(options) {
        console.log(options);
        this.#dropdown = GM.HF.createNewSelect('', '', ['dropdown'], [], Object.keys(options), Object.values(options));
    }

    #createAddButton() {
        this.#addButton = GM.HF.createNewButton('', '', ['button'], [{ style: 'border', value: 'outset' }], 'button', 'Add', false);
    }

    getHTML = () => this.dataTable.get('wrapper');

    getCard() {
        return { wrapper: this.#wrapper, label: this.#label, dropdown: this.#dropdown, addButton: this.#addButton };
    }

}