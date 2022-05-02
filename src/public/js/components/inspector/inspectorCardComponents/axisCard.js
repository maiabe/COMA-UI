import { GM } from "../../../main.js";

export class AxisCard {
    constructor(dropdown, labelInput, title, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        this.elementTable = new Map();
        this.#createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
    }

    /** --- PRIVATE ---
     * Creates the HTML element for the axis card.
     * All of these arguments are HTML elements that are appended to the card.
     * @param {HTML p} title 
     * @param {HTML select} dropdown 
     * @param {HTML p} labelInput 
     * @param {HTML checkbox} gridCheckbox 
     * @param {HTML checkbox} tickCheckbox 
     * @param {HTML button} addTraceButton 
     * @param {function} addTraceFunction 
     * @param {HTML select} errorDropDown 
     */
    #createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        this.#createWrapper();
        this.#createTitleBarElement(title);
        this.#createDataField(dropdown, errorDropDown, addTraceButton);
        this.#createLabelField(labelInput);
        this.#createCheckboxField(gridCheckbox, tickCheckbox);
        this.#createAddTraceListener(addTraceFunction);
    }

    /** --- PRIVATE ---
     * Creates and stores the wrapper element
     */
    #createWrapper() {
        const wrapperElement = GM.HF.createNewDiv('', '', ['axis-card-wrapper'], []);
        this.storeElement('wrapperElement', wrapperElement);
    }

    /** --- PRIVATE ---
     * Creates the title bar elements, stores that element, and adds the title text to the html object
     * @param {string} title 
     */
    #createTitleBarElement(title) {
        const titleBarElement = GM.HF.createNewDiv('', '', ['axis-card-title-bar'], []);
        titleBarElement.innerHTML = title;
        this.storeElement('titleBar', titleBarElement);
        this.elementTable.get('wrapperElement').appendChild(titleBarElement);
    }

    /** --- PRIVATE ---
     * The data field is the area of the card where the user can chose which fields they wish to visualize with the chart
     * This function will create a wrapper, and add the buttons and dropdowns.
     * @param {HTML Select} dropdown 
     * @param {HTML Select} errorDropDown 
     * @param {HTML button} addTraceButton 
     */
    #createDataField(dropdown, errorDropDown, addTraceButton) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], []);
        const dataCard = this.#createDropDownCard('Data', dropdown);
        dropdownsWrapper.appendChild(dataCard);
        if (errorDropDown) {
            const errorCard = this.#createDropDownCard('Error', errorDropDown);
            errorCard.classList.add('axis-card-dropdown-card-errordd');
            dropdownsWrapper.appendChild(errorCard);
        }
        wrapper.appendChild(dropdownsWrapper);
        wrapper.appendChild(addTraceButton);
        this.storeElement('dataFieldWrapper', wrapper);
        this.storeElement('addTraceButton', addTraceButton);
        this.storeElement('lastDropdown', dropdownsWrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** -- PRIVATE ---
     * Each dropdown consists of a label, the header text. The text and the dropdown are created together.
     * @param {string} header 
     * @param {HTML Select} dropdown 
     * @returns the html container of this mini card
     */
    #createDropDownCard(header, dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        const headerText = GM.HF.createNewParagraph('', '', [], [], header);
        dropDownWrapper.appendChild(headerText);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }

    /** --- PRIVATE ---
     * Used when there is no label for the dropdown (ie. When an additional trace is added)
     * @param {HTML Select} dropdown 
     * @returns the container of the mini card
     */
    #createDropDownCardNoText(dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }


    /** --- PRIVATE ---
     * Attaches the input field for user created label names
     * @param {HTML Input} labelInput 
     */
    #createLabelField(labelInput) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const header = GM.HF.createNewParagraph('', '', [], [], 'Label');
        wrapper.appendChild(header);
        wrapper.appendChild(labelInput);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** --- PRIVATE ---
     * Adds the checkboxes for selecting grid lines and ticks
     * @param {HTML checkbox} gridCheckbox 
     * @param {HTML checkbox} tickCheckbox 
     */
    #createCheckboxField(gridCheckbox, tickCheckbox) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper', 'justify-left'], []);
        wrapper.appendChild(gridCheckbox);
        wrapper.appendChild(tickCheckbox);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** --- PUBLIC ---
     * Adds a new trace dropdown and error dropdown when user clicks add trace button
     * @param {*} dropdown 
     * @param {*} errorDropdown 
     */
    addTraceDropdown(dropdown, errorDropdown) {
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], []);
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(dropdown));
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(errorDropdown));
        this.elementTable.get('lastDropdown').after(dropdownsWrapper);
        this.elementTable.set('lastDropdown', dropdownsWrapper);
    }

    /** --- PRIVATE ---
     * Link the trace button to the Output Module
     * @param {function} fn This function fires when add trace is selected. It links the dropdowns to the 
     *                      card so that the chart data storage will be updated. 
     */
    #createAddTraceListener(fn) {
        this.elementTable.get('addTraceButton').addEventListener('click', fn);
    }

    getCard = () => this.elementTable.get('wrapperElement');

    storeElement(key, value) {
        this.elementTable.set(key, value);
    }
}

export class XAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        super(dropdown, labelInput, 'X Axis', gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
    }
}

export class YAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        super(dropdown, labelInput, 'Y Axis', gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
    }
}

export class ZAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        super(dropdown, labelInput, 'Z Axis', gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }
}