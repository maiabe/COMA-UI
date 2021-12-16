import { printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { XAxisCard, YAxisCard } from './inspectorCardComponents/axisCard.js';
import { ObjectSearchCard } from '../../../css/inspector/objectSearchCard.js';
import { KeyValueCard } from './inspectorCardComponents/keyValueCard.js';
import { GM } from '../../main.js';
import { IncludeColumnCard } from './index.js';

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
    #dragElement;
    maxExpansion;


    constructor(title, color) {
        this.resizing = false;
        this.maxExpansion = 200;
        this.#dynamicFields = new Map();
        this.#axisCardMap = new Map();
        this.#color = color;
        this.#expanded = false;
        this.#title = title;
        this.mousePositions = [];

        this.#createDomNode();
    };

    #createDomNode() {
        this.#wrapperElement = this.#createWrapperNode();
        this.#headerElement = this.#createHeaderNode();
        this.bodyElement = this.#createBodyNode();
        this.#titleElement = this.#createTitleNode();
        this.#dragElement = this.#createDragElement();
        this.#wrapperElement.appendChild(this.#headerElement).append(this.#titleElement);
        this.#wrapperElement.appendChild(this.bodyElement);
        this.#wrapperElement.appendChild(this.#dragElement);
        this.#addResizeEventListeners();
        this.#addExpansionEventListener();
    }

    #createWrapperNode() {
        return GM.HF.createNewDiv(`Inspector-card-${this.#cardId}`, `Inspector-card-${this.#cardId}`, ['inspector-card'], []);
    }

    #createHeaderNode() {
        return GM.HF.createNewDiv(`Inspector-card-header-${this.#cardId}`, `Inspector-card-header-${this.#cardId}`, ['inspector-card-header'], [{ style: 'backgroundColor', value: this.#color }]);
    }

    #createBodyNode() {
        return GM.HF.createNewDiv(`Inspector-card-body-${this.#cardId}`, `Inspector-card-body-${this.#cardId}`, ['inspector-card-body'], []);
    }

    #createTitleNode() {
        return GM.HF.createNewH3(`Inspector-card-header-h3-${this.cardId}`, `Inspector-card-header-h3-${this.cardId}`, [], [], this.#title);
    }

    #createDragElement() {
        return GM.HF.createNewDiv('', '', ['inspector-card-drag-element'], []);
    }

    #addResizeEventListeners() {
        this.#dragElement.addEventListener('mousedown', this.startResize.bind(this));
        document.addEventListener('mouseup', this.endResize);
        document.addEventListener('mousemove', e => {
            this.resize(e);
            e.preventDefault();
        });
    }

    // RESIZE FUNCTIONS

    startResize = () => {
        this.resizing = true;
        this.mousePositions = [];
    };

    endResize = () => {
        if (this.resizing) this.resizing = false;
    };

    resize = e => {
        if (this.resizing) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const distance = this.#calculateDistanceTraveled(this.mousePositions[0], this.mousePositions[this.mousePositions.length - 1]);
                this.#resetMousePositionsArray(this.mousePositions[this.mousePositions.length - 1]);
                this.#updateHeight(distance.y);
                this.setHeight();
            }
            GM.PM.resizeEventHandler(this.key);
        }
    }

    #updateHeight = yDistanceTraveled => {
        const value = this.maxExpansion + parseInt(yDistanceTraveled);
        if (value > 50) this.maxExpansion = value;
    }

    setHeight = () => {
        this.bodyElement.style.height = `${this.maxExpansion}px`;
    }

    /**
     * Calculates the distance the mouse has traveled in pixels
     * @param {object} firstPosition index [0] in the mousePositions array - contains x and y
     * @param {object} lastPosition  index [array.length-1] in the mousePositions array - contains x and y
     * @returns {x: xdistance (number), y: ydistance (number)}
     */
    #calculateDistanceTraveled = (firstPosition, lastPosition) => {
        return { x: lastPosition.x - firstPosition.x, y: lastPosition.y - firstPosition.y };
    };

    /**
     * When a drag is completed, this function is called to reset the positions array. The last measured position is places in the first index.
     * @param {number} lastPosition the last captured mouse position
     */
    #resetMousePositionsArray = lastPosition => this.mousePositions = [lastPosition];

    #addExpansionEventListener() {
        this.#headerElement.addEventListener('click', event => {
            this.expanded = !this.expanded;
            this.bodyElement.style.height = this.expanded ? `${this.maxExpansion}px` : '10px';
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

    addIncludeColumnCard(checkboxes) {
        const card = new IncludeColumnCard(checkboxes);
        this.appendToBody(card.getCard());
        return card;
    }

    addXAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        const card = new XAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton);
        this.appendToBody(card.getCard());
        return card;
    }

    addYAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        const card = new YAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton);
        this.appendToBody(card.getCard());
        return card;
    }

    addKeyValueCard(key, value) {
        const card = new KeyValueCard(key, value);
        this.appendToBody(card.getCard());
        return card;
    }

    addObjectsSearchCard(objects) {
        const card = new ObjectSearchCard(objects);
        this.appendToBody(card.getCard().wrapper);
        return card;
    }

    addDynamicKeyValueCard(key, value) {
        this.#dynamicFields.set(key, this.addKeyValueCard(key, value));
    }
    getCard = () => this.#wrapperElement;
}