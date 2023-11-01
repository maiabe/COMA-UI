import { HTMLFactory } from "../index.js";
export class AnchorGenerator {
    constructor() { };
    generateNewAnchor = (href, id, name, classlist, customStyles, text) => {
        const e = document.createElement('a');
        e.setAttribute('href', href);
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