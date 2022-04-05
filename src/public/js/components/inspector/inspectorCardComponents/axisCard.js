import { GM } from "../../../main.js";

export class AxisCard {
    constructor(dropdown, labelInput, title, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        this.elementTable = new Map();
        this.#createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }

    #createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        this.#createWrapper();
        this.#createTitleBarElement(title);
        this.#createDataField(dropdown, errorDropDown, addTraceButton);
        this.#createLabelField(labelInput);
        this.#createCheckboxField(gridCheckbox, tickCheckbox);
    }

    #createWrapper() {
        const wrapperElement = GM.HF.createNewDiv('', '', ['axis-card-wrapper'], []);
        this.storeElement('wrapperElement', wrapperElement);
    }

    #createTitleBarElement(title) {
        const titleBarElement = GM.HF.createNewDiv('', '', ['axis-card-title-bar'], []);
        titleBarElement.innerHTML = title;
        this.storeElement('titleBar', titleBarElement);
        this.elementTable.get('wrapperElement').appendChild(titleBarElement);
    }

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

    #createDropDownCard(header, dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        const headerText = GM.HF.createNewParagraph('', '', [], [], header);
        dropDownWrapper.appendChild(headerText);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }

    #createDropDownCardNoText(dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }

    addTrace(dropdown) {
        this.elementTable.get('dataFieldWrapper').insertBefore(dropdown, this.elementTable.get('addTraceButton'));
    }

    #createLabelField(labelInput) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const header = GM.HF.createNewParagraph('', '', [], [], 'Label');
        wrapper.appendChild(header);
        wrapper.appendChild(labelInput);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    #createCheckboxField(gridCheckbox, tickCheckbox) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper', 'justify-left'], []);
        wrapper.appendChild(gridCheckbox);
        wrapper.appendChild(tickCheckbox);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    addTraceDropdown(dropdown, errorDropdown) {
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], []);
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(dropdown));
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(errorDropdown));
        this.elementTable.get('lastDropdown').after(dropdownsWrapper);
        this.elementTable.set('lastDropdown', dropdownsWrapper);
    }

    getCard = () => this.elementTable.get('wrapperElement');

    storeElement(key, value) {
        this.elementTable.set(key, value);
    }
}

export class XAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        super(dropdown, labelInput, 'X Axis', gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }
}

export class YAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        super(dropdown, labelInput, 'Y Axis', gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }
}

export class ZAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        super(dropdown, labelInput, 'Z Axis', gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }
}