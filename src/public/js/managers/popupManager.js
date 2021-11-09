import { Message, Publisher } from '../classes/communication/communication.js';
import { invalidVariables, varTest, printErrorMessage } from '../scripts/errorHandlers.js';
import Popup from '../classes/components/popup.js';
import { OUTPUT_MANAGER, POPUP, POPUP_MANAGER } from '../scripts/constants.js';

/* This class Manages the popup elements in the application. */
export class PopupManager {
    publisher;                  // Publishes Messages
    #popupList;                 // Map of popups
    #popupIndex;                // Strictly increasing value that identifies a popup.
    #zIndex;

    constructor() {
        this.publisher = new Publisher();
        this.#popupList = new Map();       // Popups are indexed with a module Key.
        this.#zIndex = 10001;
    };

    /** Publishes a message to all subscribers 
     * @param msg -> the message to send. This is a Message object.
    */
    sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }

    /** Creates a Module Popup. This means that the popup is populated with the module's specific content
     * as defined by its class.
     * @param {number} moduleKey -> the key of the module object. (int)
     * @param {HTML element} content -> The content to append to the popup body (html element)
     * @param {number} x -> the x position of the click that generated the popup;
     * @param {number} y -> The y position of the mouse click that generated the popup.
     */
    createModulePopup = (moduleKey, content, x, y) => {
        if (invalidVariables([varTest(moduleKey, 'moduleKey', 'number'), varTest(content, 'content', 'object')], 'Popup Manager', 'createModulePopup')) return;
        // Only allow one popup for each module at any given time.
        if (!this.#popupList.has(moduleKey)) {
            // Check window size before building.
            let width = 400;
            let height = 500;
            if (window.innerWidth > 2048) {
                width = 600;
                height = 800;
            }
            const p = new Popup(width, height, 0, 0, moduleKey, content.color, content.content, content.headerText);
            this.#popupList.set(moduleKey, { type: 'module', element: p });
            this.sendMessage(new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Resize Popup Event', { moduleKey: moduleKey }));
        } else console.log(`ERROR: Popup already exists for moduleKey: ${moduleKey}. -- PopupManager -> createModulePopup.`);
    };

    /**
     * Checks to see if a popup is already open for a module.
     * @param {number} key unique identifier of the module.
     * @returns true if is open, false if not.
     */
    isPopupOpen = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'isPopupOpen')) return false;
        if (this.#popupList.has(key)) return true;
        return false;
    }

    /** Gets the width of a specific popup.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     * @return the width in pixels (number only) or -1 if no popup found.
     */
    getPopupWidth = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'getPopupWidth')) return -1;
        if (this.#popupList.has(key)) return this.#popupList.get(key).element.width;
        else return -1;
    }

    /** Gets the height of a specific popup.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     * @return the height in pixels (number only) or -1 if no popup found.
     */
    getPopupHeight = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'getPopupHeight')) return -1;
        if (this.#popupList.has(key)) return this.#popupList.get(key).element.height - 50;
        else return -1;
    }

    /**
     * Gets the div representing the body of the popup.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     * @returns the div or undefined if no div is found.
     */
    getPopupBodyDiv = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'getPopupBodyDiv')) return undefined;
        if (this.#popupList.has(key)) return this.#popupList.get(key).element.body;
        else return undefined;
    }

    /**
     * Clears the body of all html.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     */
    clearChart = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'clearChart')) return;
        const body = this.getPopupBodyDiv(key);
        if (body.classList.contains('chartDiv')) body.querySelector('.plotly').innerHTML = '';
    }

    /**
     * Called When resize is finished. (startResizeEventHandler is called when the resize begins.) Resize refers to the user stretching the
     * popup div.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     */
    resizeEventHandler = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'resizeEventHandler')) return;
        this.sendMessage(new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Resize Popup Event', { moduleKey: key }));
    }

    /**
     * Called When resize begins. (resizeEventHandler is called when the resize ends.) Resize refers to the user stretching the
     * popup div.
     * @param {number} key the key identifying the popup. Is also the unique identifier for the module associated with the popup.
     */
    startResizeEventHandler = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'startResizeEventHandler')) return;
        this.sendMessage(new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Start Resize Popup Event', { moduleKey: key }));
    }

    /** Destroys a popup (removes it from the list.)  The actual html element is removed by the 
     * popup class itself.
     * @param {number} key -> this is the index of the popup in the list. (int)
     */
    destroyPopup = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'PopupManager', 'destroyPopup')) return;
        this.#popupList.delete(key);
        this.sendMessage(new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Popup Closed Event', { moduleKey: key }));
    };

    getNextZIndex = () => this.incrementZIndex();
    incrementZIndex = () => this.#zIndex++;
}