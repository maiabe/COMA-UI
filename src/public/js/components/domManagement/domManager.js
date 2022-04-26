import { Publisher } from "../../communication/publisher.js";
import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";

export class DomManager {
    publisher;
    #domTable;
    constructor() {
        this.#domTable = new Map();
        this.publisher = new Publisher();
        this.HF = new HTMLFactory();
    }

    initializeDomManager() {
        this.#addToDomTable('navBarDiv', document.querySelector('#navWrapper'));
        this.#addToDomTable('logo', this.#initializeLogo());

    }

    #initializeLogo() {
        const element = this.HF.createNewIMG('logo','logo', '../../../images/logo/COMA-LOGO.png', ['logo'], [], 'COMA logo');
        this.#domTable.get('navBarDiv').appendChild(element);
        return element;
    }

    #addToDomTable(key, value) {
        this.#domTable.set(key, value);
    }
}