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
        // this.#addToDomTable('title', this.#initializeTitle('COMA'));
        this.#addToDomTable('logo', this.#initializeLogo());
        this.#addToDomTable('objectsDiv', this.#initializeObjectsDiv());
        this.#addToDomTable('routesDiv', this.#initializeRoutesDiv());

    }

    #initializeObjectsDiv() {
        const element = this.HF.createNewDiv('objectsDiv', 'objectsDiv', ['nav-two-column'], []);
        this.#domTable.get('navBarDiv').appendChild(element);
        return element;
    }

    #initializeRoutesDiv() {
        const element = this.HF.createNewDiv('routesDiv', 'routesDiv', ['nav-two-column'], []);
        this.#domTable.get('navBarDiv').appendChild(element);
        return element;
    }

    #initializeTitle(title) {
         const element = this.HF.createNewH1('title', 'title', [], [], title);
         this.#domTable.get('navBarDiv').appendChild(element);
         return element;
    }

    #initializeLogo() {
        const element = this.HF.createNewIMG('logo','logo', '../../../images/logo/COMA-LOGO.png', ['logo'], [], 'COMA logo');
        this.#domTable.get('navBarDiv').appendChild(element);
        return element;
    }

    #addToDomTable(key, value) {
        this.#domTable.set(key, value);
    }

    populateObjectsDiv(data) {
        const wrapper = this.#domTable.get('objectsDiv');
        const paragraph = this.HF.createNewParagraph('objects-text', 'objects-text', [],[], 'Available Objects: ');
        const dropDown = this.HF.createNewSelect('objects-dd', 'objects-dd', [], [], Object.keys(data), Object.values(data));
        wrapper.appendChild(paragraph);
        wrapper.appendChild(dropDown);
    }

    populateRoutesDiv(data) {
        const wrapper = this.#domTable.get('routesDiv');
        const paragraph = this.HF.createNewParagraph('routes-text', 'routes-text', [],[], 'Available Routes: ');
        const dropDown = this.HF.createNewSelect('routes-dd', 'routes-dd', [], [], Object.keys(data), Object.keys(data));
        wrapper.appendChild(paragraph);
        wrapper.appendChild(dropDown);
    }
}