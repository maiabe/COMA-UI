import { HTMLFactory } from "../index.js";

export class ListGenerator {
    constructor() { };

    /** Generates HTML list element
     * @param {id} string id of the ul element
     * @param {name} string name of the ul element
     * @param {classList} list list of class name strings of the ul element
     * @param {customStyles} object object for setting styles of the ul element
     *                              e.g. { style: 'width', value: '100%' }
     * @param {list} list list of strings for the list element
     **/
    generateNewList = (id, name, classlist, customStyles, list) => {
        const e = document.createElement('ul');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        HTMLFactory.setCustomStyles(e, customStyles);

        if (list) {
            list.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                e.appendChild(listItem);
            });   
        }

        return e;
    }


}