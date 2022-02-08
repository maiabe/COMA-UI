import { printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { XAxisCard, YAxisCard } from './inspectorCardComponents/axisCard.js';
import { ObjectSearchCard } from '../../../css/inspector/objectSearchCard.js';
import { KeyValueCard } from './inspectorCardComponents/keyValueCard.js';
import { GM } from '../../main.js';
import { IncludeColumnCard } from './index.js';
import { CompositeDetailsCard } from './inspectorCardComponents/compositeDetailsCard.js';

export class InspectorCard {
    #cardId;
    #wrapperElement;
    #headerElement;
    bodyElement;
    #titleElement;
    #maxButton;
    #collapseButton;
    #expandButton;
    #title;
    #expanded;
    #maximized;
    #color;
    #dynamicFields;
    #axisCardMap;
    #dragElement;
    maxExpansion;


    constructor(title, color, key) {
        this.#cardId = key;
        this.resizing = false;
        this.maxExpansion = 200;
        this.expandSize = 200;
        this.minHeight = 10;
        this.#dynamicFields = new Map();
        this.#axisCardMap = new Map();
        this.#color = color;
        this.#expanded = false;
        this.#maximized = false;
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
        this.#maxButton = this.#createMaxButton();
        this.#expandButton = this.#createExpandButton();
        this.#collapseButton = this.#createCollapseButton();
        this.#wrapperElement.appendChild(this.#headerElement).append(this.#titleElement);
        this.#headerElement.appendChild(this.#maxButton);
        this.#headerElement.appendChild(this.#expandButton);
        this.#headerElement.append(this.#collapseButton);
        this.#wrapperElement.appendChild(this.bodyElement);
        this.#wrapperElement.appendChild(this.#dragElement);
        this.#addResizeEventListeners();
        this.#addExpansionEventListener();
        this.#addMaximizeEventListener();
        this.#addCollapseEventListener();
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


    #createMaxButton() {
        const buttonDiv = GM.HF.createNewDiv('', '', ['inspector-card-max-button'], []);
        const img = GM.HF.createNewIMG('', '', '../../../images/icons/maximize.png', [], [], 'Minimize or Maximize Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
    }

    #createCollapseButton() {
        const buttonDiv = GM.HF.createNewDiv('', '', ['inspector-card-collapse-button'], []);
        const img = GM.HF.createNewIMG('', '', '../../../images/icons/minus.png', [], [], 'Collapse Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
    }

    #createExpandButton() {
        const buttonDiv = GM.HF.createNewDiv('', '', ['inspector-card-expand-button'], []);
        const img = GM.HF.createNewIMG('', '', '../../../images/icons/squares.png', [], [], 'Expand Inspector Card Button');
        buttonDiv.appendChild(img);
        return buttonDiv;
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
                this.setHeight(this.maxExpansion);
            }
            GM.PM.resizeEventHandler(this.key);
        }
    }

    #updateHeight = yDistanceTraveled => {
        const value = this.maxExpansion + parseInt(yDistanceTraveled);
        if (value > 50) this.maxExpansion = value;
    }

    setHeight = (height) => {
        this.bodyElement.style.height = `${height}px`;
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
        this.#expandButton.addEventListener('click', this.expandCard.bind(this));
    }

    #addMaximizeEventListener() {
        this.#maxButton.addEventListener('click', this.maximizeCard.bind(this));
    }
    #addCollapseEventListener() {
        this.#collapseButton.addEventListener('click', this.minimizeCard.bind(this));
    }

    maximizeCard() {
        if (this.#maximized) {
            GM.INS.minimizeCard();
            this.minimizeCard();
        }
        else {
            GM.INS.maximizeCard(this.#cardId);
            this.bodyElement.style.height = `${this.getParentHeight() - 40}px`;
            this.#maximized = true;
        }
        this.showAllElements();
    }

    minimizeCard() {
        if (this.#maximized) GM.INS.minimizeCard();
        this.#maximized = false;
        this.#expanded = false;
        this.setHeight(this.minHeight);
        this.hideAllBodyChildren();
    }

    expandCard() {
        if (!this.#expanded) {
            if (this.#maximized) GM.INS.minimizeCard();
            this.#expanded = true;
            this.#maximized = false;
            this.setHeight(this.expandSize);
            this.showAllElements();
        } else {
            this.minimizeCard();
        }

    }

    hideAllBodyChildren() {
        this.bodyElement.childNodes.forEach(child => child.style.display = 'none');
    }

    showAllElements() {
        this.bodyElement.childNodes.forEach(child => child.style.display = 'flex');
    }

    getParentHeight() {
        return document.querySelector('#mainWrapper').getBoundingClientRect().height;
    }

    appendToBody(element) {
        this.bodyElement.appendChild(element);
        if (!this.#maximized && !this.#expanded) element.style.display = 'none';
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
        this.#axisCardMap.set('x', card);
        return card;
    }

    addYAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton) {
        const card = new YAxisCard(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton);
        this.appendToBody(card.getCard());
        this.#axisCardMap.set('y', card);
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

    addChartTrace(dropdown) {
        this.#axisCardMap.get('y').addTraceDropdown(dropdown);
    }

    addCompositeDetailsCard(groupData, saveModuleCallback) {
        const card = new CompositeDetailsCard(groupData, saveModuleCallback);
        this.appendToBody(card.getCard());
    }

    getCard = () => this.#wrapperElement;
}