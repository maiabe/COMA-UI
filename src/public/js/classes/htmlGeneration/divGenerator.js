import { HTMLFactory } from "./htmlFactory.js";
export class DivGenerator {
    constructor () {
    };

    generateSimpleDiv = (id, name, classlist, customStyles) => {
        const e = document.createElement('div');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    };
}