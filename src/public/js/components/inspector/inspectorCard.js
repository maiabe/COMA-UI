import { printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { AxisCard } from './inspectorCardComponents/axisCard.js';
import { KeyValueCard } from './inspectorCardComponents/keyValueCard.js';
import {GM} from '../../main.js';

export class InspectorCard {
    #cardId;
    #wrapperElement;
    #headerElement;
    bodyElement;
    #titleElement;
    #title;
    #expanded;
    #color;
    #dynamicFields;
    #axisCardMap;

    constructor(title, color) {
        this.#dynamicFields = new Map();
        this.#axisCardMap = new Map();
        this.#color = color;
        this.#expanded = false;
        this.#title = title;
        this.#createDomNode();
    };

    #createDomNode() {
        this.#wrapperElement = this.#createWrapperNode();
        this.#headerElement = this.#createHeaderNode();
        this.bodyElement = this.#createBodyNode();
        this.#titleElement = this.#createTitleNode();
        this.#wrapperElement.appendChild(this.#headerElement).append(this.#titleElement);
        this.#wrapperElement.appendChild(this.bodyElement);
        this.#addExpansionEventListener();
    }

    #createWrapperNode() {
        return GM.HF.createNewDiv(`Inspector-card-${this.#cardId}`, `Inspector-card-${this.#cardId}`, ['inspector-card'], []);
    }

    #createHeaderNode() {
        return GM.HF.createNewDiv(`Inspector-card-header-${this.#cardId}`, `Inspector-card-header-${this.#cardId}`, ['inspector-card-header'], [{style: 'backgroundColor', value: this.#color}]);
    }

    #createBodyNode() {
        return GM.HF.createNewDiv(`Inspector-card-body-${this.#cardId}`, `Inspector-card-body-${this.#cardId}`, ['inspector-card-body'], []);
    }
    
    #createTitleNode() {
        return GM.HF.createNewH3(`Inspector-card-header-h3-${this.cardId}`, `Inspector-card-header-h3-${this.cardId}`, [], [], this.#title);
    }

    #addExpansionEventListener() {
        this.#headerElement.addEventListener('click', event => {
            this.expanded = !this.expanded;
            this.bodyElement.style.height = this.expanded ? '200px' : '10px';
        });
    }

    appendToBody(element) {
        this.bodyElement.appendChild(element);
    }

    updateDynamicField(key, text) {
        console.log(key);
        console.log(this.#dynamicFields);
        const keyValueCard = this.#dynamicFields.get(key);
        if (keyValueCard) {
            keyValueCard.updateValue(text);
        } else printErrorMessage(`Undefined or Null Variable`, `data: ${data}. -- Inspector Card -> updateDynamicField`);
    }

    addAxisCard(axis, dropdownData) {

    }

    addKeyValueCard(key, value) {
        const card = new KeyValueCard(key, value);
        this.appendToBody(card.getCard());
        return card;
    }

    addDynamicKeyValueCard(key, value) {
        this.#dynamicFields.set(key, this.addKeyValueCard(key, value));
    }
    getCard = () => this.#wrapperElement;
}