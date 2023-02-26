/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
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
export class Cholera extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'getCholeraData', 'Cholera', 'images/icons/skull-white.png', [], [{ name: 'OUT', leftSide: false, type: REMOTE_DATA_TABLE }], key);
        this.addData('inportType', -1);
        this.addData('outportType', REMOTE_DATA_TABLE);
        this.addData('description', 'This module returns all data on the London Cholera Outbreak.')
        this.addData('onCreationFunction', this.onCreation.bind(this));
        this.addData('requestMetadataOnCreation', true);
        this.addData('linkedToData', false);
        this.setPopupContent();
        this.createInspectorCardData();
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
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
        this.addData('linkedToData', true);
    }
}

/*export class Sql extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'SQL Query', 'images/icons/sql-open-file-format.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }
}*/













