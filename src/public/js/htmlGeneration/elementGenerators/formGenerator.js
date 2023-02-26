import { HTMLFactory } from "../index.js";
export class FormGenerator {
    constructor() {
    };

    generateForm = (id, name, classlist, customStyles) => {
        const e = document.createElement('form');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    };
}