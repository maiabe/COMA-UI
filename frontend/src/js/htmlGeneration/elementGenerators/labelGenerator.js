import { HTMLFactory } from "../index.js";
export class LabelGenerator {
    constructor() {};
    generateNewLabel = (id, name, $for, classlist, customStyles, text) => {
        const e = document.createElement('label');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('for', $for);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        const t = document.createTextNode(text);
        e.appendChild(t);
        HTMLFactory.setCustomStyles(e, customStyles)
        return e;
    }
}