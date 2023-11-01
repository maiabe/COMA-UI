/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Module } from "../module.js";
import { LT_SOURCE, LT_PROCESSOR, LT_OUTPUT } from "../../sharedVariables/constants.js";

export class Data extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;
    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'data', name, 'images/icons/flow-diagram-white.png', inports,
            [{ name: 'OUT', leftSide: false, type: LT_PROCESSOR }], key);
        this.isData = true;
        this.addData('link', -1, false, '', false);
        this.addData('isDataModule', isData, false, '', false);
        this.addData('inportType', [LT_SOURCE]);
        this.addData('outportType', [LT_OUTPUT]);
        this.addData('dataKey', key);
        this.setPopupContent();
        this.createInspectorCardData();
    }

    setPopupContent = () => {
        const popupContent = this.HF.createNewDiv('', '', [], []);
        this.addData('popupContent', popupContent, false, '', false);
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorDataCard();
    }

    /** --- PUBLIC ---
     * Stores the metadata and updates the linkedToData field.
     * @param {JSON Object} metadata */
    setMetadata = metadata => {
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
        this.addData('linkedToData', true);
    }

}