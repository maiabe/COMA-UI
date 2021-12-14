import { GM } from "../../../main.js";

export class IncludeColumnCard {
    #wrapper;
    constructor(checkboxArray) {
        this.#wrapper = GM.HF.createNewDiv('', '', ['include-column-card'], []);
        const header = GM.HF.createNewH3('','',['include-column-card-header'], [], 'Include Checked Columns');
        this.#appendChildren(this.#wrapper, header, checkboxArray);
    }

    #appendChildren(wrapper, header, checkboxArray) {
        wrapper.appendChild(header);
        checkboxArray.forEach(box => wrapper.appendChild(box.wrapper));
    }

    getCard = () => this.#wrapper;
}