import { HTMLFactory } from "../index.js";
export class InputGenerator {
    constructor(){};
    
    generateButton = (id, name, classlist, customStyles, type, value, disabled) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        e.setAttribute('value', value);
        if (disabled) {
            e.setAttribute('disabled', disabled);
        }
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }

    generateFileInput = (id, name, classlist, customStyles, type, disabled) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        e.disabled = disabled;
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }
    
    generateTextInput = (id, name, classlist, customStyles, type, value) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        e.value = value;
        return e;
    }

    // RangeInput
    generateRangeInput = (id, name, classlist, customStyles, min, max, step, value) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', 'range');
        e.setAttribute('min', min);
        e.setAttribute('max', max);
        e.setAttribute('value', value);
        e.setAttribute('step', step);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        e.value = value;
        return e;
    }


    // RadioInput
    generateRadioInput = (id, name, classlist, customStyles, type, value, checked) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        e.setAttribute('value', value);

        if (checked) {
            e.setAttribute("checked", "checked");
        }

        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }


}