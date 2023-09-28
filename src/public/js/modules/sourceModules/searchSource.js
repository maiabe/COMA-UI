import { Source } from "../index.js";
import { LT_SOURCE } from "../../sharedVariables/constants.js";

/** This represents a source module and extends the module class. */
/*export class Source extends Module {
    constructor(category, color, shape, location, command, name, image, inports, outports, key, description) {
        super(category, color, shape, command, name, image, inports, outports, key, description);
    }
}*/


// add comment for module data content.. queryType, queryEntries, resultData


/** This Class pulls data off the server that I used for testing. 
 */
export class Search extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'local', 'getQueryResult', 'Search', 'images/icons/db-image.png', [],
            [{ name: 'OUT', leftSide: false, type: LT_SOURCE }], key);
        //this.addData('onCreationFunction', this.onCreation.bind(this));
        this.addData('callOnCreationFunction', true);
        this.addData('remoteData', true);
        this.addData('popupWidth', 300);
        this.addData('popupHeight', 300);
    }

    setInspectorCardContent = () => {
        this.inspectorCardMaker.addSearchFormFields(this.getData('key'));
    }

/*
    setPopupContent = () => {
        //this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
    }*/

    /** --- PUBLIC ---
     * Gets the content to populate a popup associated with this module.
     * @returns the content to populate the popup associated with this module*/
    getPopupContent = () => {
        return { width: 300, height: 300, color: this.getData('color'), content: this.getData('popupContent'), headerText: this.getData('name') };
    }
    
    onCreation = () => {
        this.inspectorCardMaker.addSearchFormFields(this.getData('key'));
        this.inspectorCardMaker.addFormFieldFunctions(this.getData('key'));

        //this.inspectorCardMaker.addSearchFormFields(metadata)
        // --> Add Date Range Field Min Max = date picker? (too many dates can be chosen from, slider may not be very useful)
        // --> Add Object (Comet) text input

    }


}