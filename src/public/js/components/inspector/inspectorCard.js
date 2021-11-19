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

    constructor(title, color) {
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

    getCard = () => this.#wrapperElement;
}