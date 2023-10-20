import { HTMLFactory } from "../index.js";
export class DivGenerator {
    constructor () {
    };

    generateSimpleDiv = (id, name, classlist, customStyles, customAttributes, text) => {
        const e = document.createElement('div');
        e.setAttribute('id', id);
        e.setAttribute('name', name);

        // Set class names
        classlist.forEach(c => {
            e.classList.add(c);
        });

        // Set custom styles
        HTMLFactory.setCustomStyles(e, customStyles);

        // Set custom attributes (e.g. [{ attribute: 'data-tab', value: 'tab1' }, ..])
        if (customAttributes) {
            customAttributes.forEach(a => {
                e.setAttribute(a.attribute, a.value);
            });
        }

        // Set inner text
        if (text) {
            e.innerHTML = text;
        }

        return e;
    };
}