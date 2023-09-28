/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Module } from "../index.js";
import { LT_SOURCE } from "../../sharedVariables/constants.js";

/*******************************************************************************
 * dataTable fields specific to source
 * --------------------------------------------------------------------------------------------
 * remoteData (boolean)                     | true if data associated with the module is remotely obtained
 * sourceData (Object)                      | data to be passed to the next module
 * ----------------------------------------------------------------------------------------------
*/

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
        super(category, color, shape, 'remote', 'getCholeraData', 'Cholera', 'images/icons/skull-white.png', [],
            [{ name: 'OUT', leftSide: false, type: LT_SOURCE }], key);
        this.addData('description', 'This module returns all data on the London Cholera Outbreak.')
        this.addData('onCreationFunction', this.onCreation.bind(this));
        this.addData('requestMetadataOnCreation', true);
        this.addData('linkedToData', false);
        this.addData('remoteData', false);
        this.createInspectorCardData();
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }
/*
    setPopupContent = (width, height) => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper());
    }*/

    onCreation = metadata => {
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
        this.addData('linkedToData', true);
    }
}














