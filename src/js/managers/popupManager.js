/* This class Manages the popup elements in the application. */
class PopupManager {
    publisher;                  // Publishes Messages
    #popupList;                 // List of All Popup Objects
    #popupIndex;                // Strictly increasing value that identifies a popup.

    constructor() {
        this.publisher = new Publisher();
        this.#popupList = [];
        this.#popupIndex = 0;
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
        // Only allow one popup for each module at any given time.
        if (!this.#doesModulePopupExist(moduleKey)) {
            const i = this.#getNextIndex();
            const p = new Popup('25vw', '60vh', 0,0, i, content.color, content.content);
            this.#popupList.push({type: 'module', key: moduleKey, element: p, index: i});
        } else {
            console.log('Popup is already open for this module');
        }

    };

    /** Destroys a popup (removes it from the list.)  The actual html element is removed by the 
     * popup class itself.
     * @param key -> this is the index of the popup in the list. (int)
     */
    destroyPopup = key => {
        this.#popupList.forEach((p, index) => {
            if (p.index === key) {
                this.#popupList.splice(index,1);
            }
        });
    };

    /** Gets a unique identification key for the next popup to create. */
    #getNextIndex = () => {
        this.#popupIndex++;
        return this.#popupIndex;
    }

    /** Checks to tee if this module already has an open pupup
     * @return true if it exists, false if it does not exist.
     */
    #doesModulePopupExist = key => {
        let found = false;
        this.#popupList.forEach(p => {
            if (p.key === key) {
                found = true;
            }
        });
        return found;
    };

    
}