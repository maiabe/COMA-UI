import { HTMLFactory } from "../index.js";
export class H3Generator {
    constructor() {};
    generateNewH3 = (id, name, classlist, customStyles, text) => {
        const e = document.createElement('h3');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        const t = document.createTextNode(text);
        e.appendChild(t);
        HTMLFactory.setCustomStyles(e, customStyles)
        return e;
    }
}