/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";

export class KeyValueCard {
    #data;
    constructor(key, values) {
        this.#data = new Map();
        this.#storeData('key', key);
        this.#storeData('values', values);
        this.#storeData('bodyElements', [])
        this.#createCardElements();
        this.#appendCardElements();
    }

    #createCardElements() {
        this.#createCardWrapper();
        this.#createCardHeader();
        this.#createCardBody();
    }

    #appendCardElements() {
        this.#data.get('wrapperElement').appendChild(this.#data.get('headerElement'));
        const bodyElements = this.#data.get('bodyElements');
        bodyElements.forEach(element => this.#data.get('wrapperElement').appendChild(element));
    }

    #createCardWrapper() {
        const wrapper = GM.HF.createNewDiv('', '', ['static-key-value-card-wrapper'], []);
        this.#storeData('wrapperElement', wrapper);
    }

    #createCardHeader() {
        const header = GM.HF.createNewDiv('', '', ['static-key-value-card-header'], []);
        header.innerHTML = this.#data.get('key');
        this.#storeData('headerElement', header);
    }

    #createCardBody() {
        const values = this.#data.get('values');
        values.forEach(value => {
            if (typeof (value) === 'object') this.#data.get('bodyElements').push(value);
            else this.#data.get('bodyElements').push(GM.HF.createNewParagraph('', '', ['static-key-value-card-body'], [], value));
        });
    }

    #storeData(key, value) { this.#data.set(key, value) };

    updateValue(newValue) {
        this.#storeData('values', [newValue]);
        this.#data.get('bodyElements')[0].innerHTML = newValue;
    }

    getCard = () => this.#data.get('wrapperElement');
}