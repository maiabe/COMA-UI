import { HTMLFactory } from "../index.js";
export class ImgGenerator {
    constructor(){};
    generateNewIMG = (id, name, src, classlist, customStyles, alt) => {
        const e = document.createElement('img');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('src', src);
        if (alt) {
            e.setAttribute('alt', alt);
        }
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);
        return e;
    }
}