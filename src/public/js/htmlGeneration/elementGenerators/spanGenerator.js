import { HTMLFactory } from "../index.js";
export class SpanGenerator {
    constructor() {};
    generateNewSpan = (id, name, classlist, customStyles, text) => {
        const e = document.createElement('span');
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

    updateTextContent(element, text) {
        console.log(element);
        console.log(text);
        const textContent = document.createTextNode(text);
        element.appendChild(textContent);
        console.log(textContent);

    }
}