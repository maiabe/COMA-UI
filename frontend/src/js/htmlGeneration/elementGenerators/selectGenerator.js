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

    /**
     * Updates the options for existing dropdown.
     * @param {HTMLElement} dropdown the HTML Element of the target dropdown
     * @param {Array} options the array of objects with option display names and values
     * */
    updateOptions = (dropdown, options) => {
        while (dropdown.firstChild) {
            dropdown.removeChild(dropdown.firstChild);
        }

        for (let i = 0; i < options.length; i++) {
            const option = document.createElement('option');
            option.setAttribute('value', options[i].value);
            option.innerHTML = options[i].name;
            dropdown.appendChild(option);
        }
    }

    addOption(dropdown, option) {
        const newOption = document.createElement('option');
        newOption.setAttribute('value', option.value);
        newOption.innerHTML = option.name;
        dropdown.appendChild(newOption);
    }
    removeOption(dropdown, option) {
        var optionIndex = Array.from(dropdown.options).indexOf(option);
        if (optionIndex !== -1) {
            dropdown.options[optionIndex].remove();
        }
    }
}