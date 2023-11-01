import { HTMLFactory } from "../index.js";
export class TextAreaGenerator {
    constructor(){};
    
    generateTextArea = (id, name, classlist, customStyles) => {
        const e = document.createElement('textArea');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }
}