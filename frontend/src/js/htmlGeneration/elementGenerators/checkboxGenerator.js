import { HTMLFactory } from "../index.js";
export class CheckboxGenerator {

    constructor() { }

    generateCheckbox = (id, name, classlist, customStyles, value, label, checked) => {
        const wrapper = this.#createWrapperElement();
        const checkbox = this.#createCheckboxElement(id, name, value, checked)
        this.#addStyles(checkbox, classlist, customStyles);
        const labelElement = this.#createlabelElement(id, label);
        this.#combineElements(wrapper, checkbox, labelElement);
        return { wrapper: wrapper, checkbox: checkbox, label: labelElement };
    }

    #createWrapperElement() {
        const wrapper = document.createElement('Div');
        wrapper.classList.add('checkbox-wrapper');
        return wrapper;
    }

    #createCheckboxElement(id, name, value, checked) {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', 'checkbox');
        e.setAttribute('value', value);
        if (checked) e.setAttribute('checked', true);
        return e;
    }

    #createlabelElement(id, labelText) {
        const label = document.createElement('Label');
        label.setAttribute('for', id);
        label.innerHTML = labelText;
        return label;
    }

    #combineElements(wrapper, checkbox, label) {
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
    }

    #addStyles(checkbox, classlist, customStyles) {
        classlist.forEach(c => checkbox.classList.add(c));
        HTMLFactory.setCustomStyles(checkbox, customStyles);
    }
}