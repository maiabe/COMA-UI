import { Module } from "../index.js";
import { LOCAL_DATA_SOURCE, REMOTE_DATA_TABLE } from "../../sharedVariables/constants.js";

/** This represents a source module and extends the module class. */
export class Source extends Module {
    constructor(category, color, shape, location, command, name, image, inports, outports, key, description) {
        super(category, color, shape, command, name, image, inports, outports, key, description);
    }
}

/** This Class pulls data off the server that I used for testing. 
 */
export class Search extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'local', 'getSearchData', 'Search', 'images/icons/sql-open-file-format.png', [], [{ name: 'OUT', leftSide: false, type: LOCAL_DATA_SOURCE }], key);
        this.addData('inportType', -1);
        this.addData('outportType', LOCAL_DATA_SOURCE);
        this.addData('description', '- Search COMA Database -')
        this.addData('onCreationFunction', this.onCreation.bind(this));
        this.addData('requestMetadataOnCreation', true);
        //this.addData('linkedToData', false);
        this.createInspectorCardData();
        this.setPopupContent();
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
    }

    onCreation = metadata => {
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addSearchFormFields(this.getData('key'));

        //this.inspectorCardMaker.addSearchFormFields(metadata)
        // --> Add Date Range Field Min Max = date picker? (too many dates can be chosen from, slider may not be very useful)
        // --> Add Object (Comet) text input

    }


}