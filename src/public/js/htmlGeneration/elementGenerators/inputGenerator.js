import { HTMLFactory } from "../index.js";
export class InputGenerator {
    constructor(){};
    
    generateButton = (id, name, classlist, customStyles, type, value, disabled) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        e.setAttribute('value', value);
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
    
    generateTextInput = (id, name, classlist, customStyles, type, disabled) => {
        const e = document.createElement('input');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('type', type);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }
}