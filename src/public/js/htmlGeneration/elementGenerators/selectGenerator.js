import { HTMLFactory } from "../index.js";
export class SelectGenerator {
    constructor() {};
    generateNewSelect = (id, name, classlist, customStyles, options, optionsText) => {
        const e = document.createElement('select');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement('option');
            option.setAttribute('value', options[i]);
            option.innerHTML = optionsText[i];
            e.appendChild(option);
        }
        HTMLFactory.setCustomStyles(e, customStyles)
        return e;
    }

    updateOptions = (dropdown, options) => {
        while (dropdown.firstChild) {
            dropdown.removeChild(dropdown.firstChild);
        }
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement('option');
            option.setAttribute('value', options[i]);
            option.innerHTML = options[i];
            dropdown.appendChild(option);
        }
    }
}