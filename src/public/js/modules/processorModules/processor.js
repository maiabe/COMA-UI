/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Module } from "../module.js";
import { LT_SOURCE, LT_PROCESSOR, LT_OUTPUT, MODULE, MODULE_MANAGER, DATA_MANAGER } from "../../sharedVariables/constants.js";
import { Message } from "../../communication/message.js";

export class Processor extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
    }
}
/* Module that can apply min and max filters or change data types on a dataset */
export class Filter extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'filter', 'Filter', 'images/icons/filter-white.png',
            [{ name: 'PS_IN', leftSide: true, type: LT_PROCESSOR }, { name: 'IN', leftSide: true, type: LT_SOURCE }],
            [{ name: 'PS_OUT', leftSide: false, type: LT_PROCESSOR }, { name: 'OUT', leftSide: false, type: LT_OUTPUT }], key);
        this.addData('inportType', [LT_PROCESSOR, LT_SOURCE]);
        this.addData('outportType', [LT_PROCESSOR, LT_OUTPUT]);
        this.addData('description', 'Use this module to filter table data.');
        this.addData('linkedToData', false);
        this.#setPopupContent();
        this.#createInspectorCardData();
    }

    /** --- PRIVATE ---
     * Creates Inspector Card Data */
    #createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    /** --- PRIVATE ---
     * Creates the HTML object to insert into the Popup */
    #setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
    }

    /** --- PUBLIC ---
     * When the module connects to another node in a chain including data, the metadata for that dataset must be processed here.
     * This function will create filter cards for each column in the data table so that the user can apply constraints to that dataset.
     * @param {metadata JSON object} metadata the metadata to process */
    processMetadata(metadata) {
        // Bind the changeDataType function to each element in the metadata. This function will be passed to the filter card in the inspector.
        metadata.columnHeaders.forEach(header => header.changeDataTypeFunction = this.changeDataType.bind(this));
        this.addData('metadata', metadata);
        this.addData('getFilterDetailsFunctionArray', this.inspectorCardMaker.addFilterCards(this.getData('metadata')));
    }

    /** --- PUBLIC ---
     * Each filter card has a function associated with it that when called will return all relevant information from that card. This includes
     * things like the new min, new max, current data type, etc. This function will return an array of functions that can collectively return 
     * all information about the entire data set.
     * @returns array of functions for retrieving data from the filter inspector card. */
    getFilterDataFunction() {
        const dataArray = [];
        this.getData('getFilterDetailsFunctionArray').forEach(fn => dataArray.push(fn()));
        return dataArray;
    }

    /** --- PUBLIC ---
     * This function was bound to the metadata and passed to the min/max filter card. It is called by the inspector card.
     * @param {string} fieldName the column to change type 
     * @param {string} oldDataType the current data type
     * @param {string} newDataType change to this data type
     * @param {function} callbackFN the Hub will notify the min max filter card that the type was changed. */
    changeDataType(fieldName, oldDataType, newDataType, callbackFN) {
        const message = new Message(
            DATA_MANAGER, MODULE, 'Data Type Change Event',
            {
                metadata: this.getData('metadata'),
                dataKey: this.getData('dataKey'),
                moduleKey: this.getData('key'),
                field: fieldName,
                oldType: oldDataType,
                newType: newDataType,
                callback: callbackFN,
                updateMetadataCallback: this.updateMetadata.bind(this)
            }
        );
        this.sendMessage(message);
    }
}

export class DataConversion extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'dataConversion', 'DataConversion', 'images/icons/convert-white.png',
            [{ name: 'PS_IN', leftSide: true, type: LT_PROCESSOR }, { name: 'IN', leftSide: true, type: LT_SOURCE }],
            [{ name: 'PS_OUT', leftSide: false, type: LT_PROCESSOR }, { name: 'OUT', leftSide: false, type: LT_OUTPUT }], key);
        this.addData('description', 'Use this module to convert table data.');
        this.addData('linkedToData', false);
        this.setPopupContent();
        this.createInspectorCardData();
    }

    /** --- PRIVATE ---
    * Creates Inspector Card Data */
    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    /** --- PRIVATE ---
     * Creates the HTML object to insert into the Popup */
    setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
    }

    /** --- PUBLIC --- 
     * When attached to a pipeline containing metadata, the headers must be processed for generating the 
     * Inspector Card for conversions.
     * @param {Metadata Object} metadata the metadata object */
    processMetadata(metadata) {
        this.addData('metadata', metadata);
        this.addData('conversionCard', this.inspectorCardMaker.addConversionCard(this.getData('metadata')));
        this.getData('conversionCard').getButton().addEventListener('click', this.convertDataEvent.bind(this));
    }

    /** --- PUBLIC ----
     * Emits a Data Conversion Event. This message will be forwarded to the Hub where the conversion will be
     * processed on the DataManager. This function is bound to a button on the Inspector Card. */
    convertDataEvent() {
        const conversionDetails = this.getData('conversionCard').getConversionInputAndFunction();
        this.sendMessage(new Message(DATA_MANAGER, MODULE, 'Data Conversion Event',
            {
                conversionFunction: conversionDetails.fn,
                outputFieldName: conversionDetails.outputFieldName,
                inputFieldName: conversionDetails.input,
                key: this.getData('dataKey'),
                moduleKey: this.getData('key')
            }));
    }
}
