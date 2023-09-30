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
        const elementDiv = this.HF.createNewDiv('', '', ['nav-content-wrapper'], []);
        const element = this.HF.createNewIMG('logo', 'logo', '../../../images/logo/COMA_LOGO_V1.png', ['logo'], [], 'COMA logo');
        //const element = this.HF.createNewIMG('logo', 'logo', '../../../images/logo/COMA_LOGO_T.png', ['logo'], [], 'COMA logo');

        elementDiv.appendChild(element);
        this.#domTable.get('navBarDiv').appendChild(elementDiv);

        return elementDiv;
    }

    #addToDomTable(key, value) {
        this.#domTable.set(key, value);
    }
}