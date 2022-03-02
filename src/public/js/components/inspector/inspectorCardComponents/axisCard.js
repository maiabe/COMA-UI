import { GM } from "../../../main.js";

export class AxisCard {
    constructor(dropdown, labelInput, title, gridCheckbox, tickCheckbox, addTraceButton) {
        this.elementTable = new Map();
        this.#createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton);
    }

    #createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        this.#createWrapper();
        this.#createTitleBarElement(title);
        this.#createDataField(dropdown, addTraceButton);
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

    #createDataField(dropdown, addTraceButton) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const header = GM.HF.createNewParagraph('', '', [], [], 'Data');
        wrapper.appendChild(header);
        wrapper.appendChild(dropdown);
        wrapper.appendChild(addTraceButton);
        this.storeElement('dataFieldWrapper', wrapper);
        this.storeElement('addTraceButton', addTraceButton);
        this.storeElement('lastDropdown', dropdown);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
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

    addTraceDropdown(dropdown) {
        this.elementTable.get('lastDropdown').after(dropdown);
        this.elementTable.set('lastDropdown', dropdown);
    }

    getCard = () => this.elementTable.get('wrapperElement');

    storeElement(key, value) {
        this.elementTable.set(key, value);
    }
}

export class XAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        super(dropdown, labelInput, 'X Axis', gridCheckbox, tickCheckbox, addTraceButton);
    }
}

export class YAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        super(dropdown, labelInput, 'Y Axis', gridCheckbox, tickCheckbox, addTraceButton);
    }
}

export class ZAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        super(dropdown, labelInput, 'Z Axis', gridCheckbox, tickCheckbox, addTraceButton);
    }
}