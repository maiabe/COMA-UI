import { GM } from "../../../main.js";


export class FormSelectCard {

    dataTable;
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
        this.#wrapper = GM.HF.createNewDiv('', '', ['select-field-wrapper'], [], [], '');
    }

    #createLabel(label) {
        this.#label = GM.HF.createNewLabel('', '', label.key, ['select-field-label'], [], label.value);
    }

    #createDropdown(label, options) {
        this.#dropdown = GM.HF.createNewSelect(label.key, '', ['select-field-dropdown'], [], Object.keys(options), Object.values(options));
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


    /** --- PUBLIC ---
     * Creates the field tooltip
     * @param {fieldinfo String} fieldinfo tooltip
     * */
    appendToolTip(fieldinfo, tooltipElement) {
        var tooltipDiv = GM.HF.createNewDiv('', '', ['tooltip-div'], [], [], '');
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
            const top = tooltipElementRect.top;
            const right = window.innerWidth - tooltipElementRect.left;
            tooltipSpan.style.top = `${top}px`; // Adjust the vertical position
            tooltipSpan.style.right = `${right}px`; // Position it right next to the tooltip-div
        });

        return tooltipDiv;
    }


    getCard() {
        return { wrapper: this.#wrapper, label: this.#label, dropdown: this.#dropdown, addButton: this.#addButton };
    }

}