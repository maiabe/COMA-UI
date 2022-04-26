import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import { Publisher, Message } from '../../communication/index.js';
import { POPUP_MANAGER, POPUP, OUTPUT_MANAGER } from '../../sharedVariables/constants.js';

export class Popup {
    constructor(width, height, initialTop, initialLeft, key, color, content, headerText) {

        this.HF = new HTMLFactory();
        this.publisher = new Publisher();
        this.content = content;

        // HTML elements
        this.element;
        this.header;
        this.headerTitle;
        this.body;
        this.resizeDiv;

        // ID
        this.key = key;

        // Initial CSS Values
        this.top = initialTop;
        this.left = initialLeft;
        this.width = width;
        this.height = height;
        this.headerColor = color;

        // State Variables
        this.state;
        this.idle = 0;
        this.dragging = 1;
        this.resizing = 2;

        this.setState(this.idle);
        this.createHTMLElement(headerText);
        this.setInitialValues();
        this.setEventListeners();

        // Drag Position Array
        this.mousePositions = [];
    }

    createHTMLElement = headerText => {
        this.element = this.HF.createNewDiv(`popup-${this.key}`, `popup-${this.key}`, ['popup'], []);
        this.createHeader(headerText);
        this.body = this.HF.createNewDiv(`popup-body-${this.key}`, `popup-body-${this.key}`, ['popupBody'], []);
        this.element.appendChild(this.header);
        this.element.appendChild(this.body);
        this.setBodyContent(this.content);
        document.body.appendChild(this.element);
        this.createResizeDiv();
    }

    createHeader = headerText => {
        this.header = this.HF.createNewDiv(`popup-header-${this.id}`, `popup-header-${this.id}`, ['popupHeader'], [{ style: 'backgroundColor', value: this.headerColor }]);
        this.headerTitle = this.HF.createNewParagraph('', '', ['popupHeaderTitle'], [], headerText);
        this.header.appendChild(this.headerTitle);
        const closeIcon = this.HF.createNewDiv('', '', ['closePopupIcon'], []);
        const img = this.HF.createNewIMG('', '', 'images/icons/cancel.png', [], [], 'Close Popup Button');
        closeIcon.appendChild(img);
        closeIcon.addEventListener('click', this.close);
        this.header.appendChild(closeIcon);
    }

    createResizeDiv = () => {
        this.resizeDiv = this.HF.createNewDiv(`popup-resize-${this.id}`, `popup-resize-${this.id}`, ['popupResize'], []);
        this.element.appendChild(this.resizeDiv);
    }

    setBodyContent = content => {
        this.#clearBodyContent();
        this.body.appendChild(content);
    };

    #clearBodyContent = () => {
        this.body.innerHTML = '';
    }

    setInitialValues = () => {
        this.setWidth();
        this.setHeight();
        this.setTop();
        this.setLeft();
    };

    setWidth = () => {
        this.element.style.width = `${this.width}px`;
    }

    setHeight = () => {
        this.element.style.height = `${this.height}px`;
    }
    setTop = () => {
        this.element.style.top = `${this.top}px`;
    }

    setLeft = () => {
        this.element.style.left = `${this.left}px`;
    };

    setEventListeners = () => {
        // Drag And Drop Listeners
        this.header.addEventListener('mousedown', () => {
            this.startDrag();
            this.moveToFront()
        });

        document.addEventListener('mouseup', this.endDrag);
        document.addEventListener('mousemove', e => {
            this.drag(e);
            e.preventDefault();
        });
        // Expand and Shrink Listeners
        this.resizeDiv.addEventListener('mousedown', this.startResize);
        document.addEventListener('mouseup', this.endResize);
        document.addEventListener('mousemove', e => {
            this.resize(e);
            e.preventDefault();
        });

        // Move To Front Event Listeners
        this.body.addEventListener('mousedown', this.moveToFront);
        this.element.addEventListener('mousedown', this.moveToFront);
    };

    setState = state => {
        this.state = state;
    }

    getState = () => { return this.state };

    //  DRAG AND DROP FUNCTIONS
    startDrag = () => {
        this.setState(this.dragging);
        this.mousePositions = [];
    };
    endDrag = () => {
        if (this.getState() === this.dragging) {
            this.setState(this.idle);
            this.mousePositions = [];
        }
    };

    drag = e => {
        if (this.getState() === this.dragging) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const distance = this.#calculateDistanceTraveled(this.mousePositions[0], this.mousePositions[this.mousePositions.length - 1]);
                this.#resetMousePositionsArray(this.mousePositions[this.mousePositions.length - 1]);
                this.#updateTop(distance.y);
                this.#updateLeft(distance.x);
                this.setLeft();
                this.setTop();
            }
        }
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

    #updateTop = yDistanceTraveled => this.top += parseInt(yDistanceTraveled);

    #updateLeft = xDistanceTraveled => this.left += parseInt(xDistanceTraveled);

    // RESIZE FUNCTIONS
    startResize = () => {
        this.setState(this.resizing);
        this.mousePositions = [];
        const message = new Message(OUTPUT_MANAGER, POPUP, 'Start Resize Popup Event', {moduleKey: this.key});
        this.sendMessage(message);
    };

    endResize = () => {
        if (this.getState() === this.resizing) {
            this.setState(this.idle);
            this.mousePositions = [];
        }
    };

    resize = e => {
        if (this.getState() === this.resizing) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const distance = this.#calculateDistanceTraveled(this.mousePositions[0], this.mousePositions[this.mousePositions.length - 1]);
                this.#resetMousePositionsArray(this.mousePositions[this.mousePositions.length - 1]);
                this.#updateHeight(distance.y);
                this.#updateWidth(distance.x);
                this.setWidth();
                this.setHeight();
            }
            const message = new Message(OUTPUT_MANAGER, POPUP, 'Resize Popup Event', {moduleKey: this.key});
        this.sendMessage(message);
        }
    }

    #updateWidth = yDistanceTraveled => this.width += parseInt(yDistanceTraveled);

    #updateHeight = xDistanceTraveled => this.height += parseInt(xDistanceTraveled);

    moveToFront = () => this.sendMessage(new Message(POPUP_MANAGER, POPUP, 'Request Z Index', {callback: this.moveToFrontHelper.bind(this)}));
   
    moveToFrontHelper = index => this.element.style.zIndex = index;
    close = () => {
        document.body.removeChild(this.element);
        this.sendMessage(new Message(POPUP_MANAGER, POPUP, 'Popup Closed Event', { moduleKey: this.key }));
    }

    sendMessage = message => this.publisher.publishMessage(message);
}