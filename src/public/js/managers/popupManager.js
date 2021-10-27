/* This class Manages the popup elements in the application. */
class PopupManager {
    publisher;                  // Publishes Messages
    #popupList;                 // Map of popups
    #popupIndex;                // Strictly increasing value that identifies a popup.

    constructor() {
        this.publisher = new Publisher();
        this.#popupList = new Map();       // Popups are indexed with a module Key.
    };

    /** Publishes a message to all subscribers 
     * @param msg -> the message to send. This is a Message object.
    */
    sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }

    /** Creates a Module Popup. This means that the popup is populated with the module's specific content
     * as defined by its class.
     * @param moduleKey -> the key of the module object. (int)
     * @param content -> The content to append to the popup body (html element)
     * @param x -> the x position of the click that generated the popup;
     * @param y -> The y position of the mouse click that generated the popup.
     */
    createModulePopup = (moduleKey, content, x, y) => {
        if (moduleKey && content) {
            // Only allow one popup for each module at any given time.
            if (!this.#popupList.has(moduleKey)) {
                // Check window size before building.
                let width = 400;
                let height = 500;
                if (window.innerWidth > 2048) {
                    width = 600;
                    height = 800;
                }
                const p = new Popup(width, height, 0, 0, moduleKey, content.color, content.content);
                this.#popupList.set(moduleKey, { type: 'module', element: p });
                const data = { moduleKey: moduleKey };
                const msg = new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Resize Popup Event', data);
                this.sendMessage(msg);
            } else {
                console.log('Popup is already open for this module');
            }
        } else {
            console.log('Cannot Create Popup due to missing module Key or content');
        }


    };

    isPopupOpen = key => {
        if (this.#popupList.has(key)) {
            return true;
        }
        return false;
    }

    getPopupWidth = key => {
        if (this.#popupList.has(key)) {
            return this.#popupList.get(key).element.width;
        }
        return -1;
    }
    getPopupHeight = key => {
        if (this.#popupList.has(key)) {
            return this.#popupList.get(key).element.height - 50;
        }
        return -1;
    }

    getPopupBodyDiv = key => {
        if (this.#popupList.has(key)) {
            return this.#popupList.get(key).element.body;
        }
        return undefined;
    }

    resizeEventHandler = key => {
        const data = { moduleKey: key };
        const msg = new Message(OUTPUT_MANAGER, POPUP_MANAGER, 'Resize Popup Event', data);
        this.sendMessage(msg);
    }

    /** Destroys a popup (removes it from the list.)  The actual html element is removed by the 
     * popup class itself.
     * @param key -> this is the index of the popup in the list. (int)
     */
    destroyPopup = key => {
        this.#popupList.delete(key);
    };
}