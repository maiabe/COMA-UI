import { Module } from "../module.js";
import { LOCAL_DATA_SOURCE, REMOTE_DATA_TABLE, TABLE_OUTPUT, MODULE, MODULE_MANAGER, DATA_MANAGER } from "../../sharedVariables/constants.js";
import { Message } from "../../communication/message.js";

export class Processor extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
    }
}

export class Filter extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'filter', 'Filter', 'images/icons/filter-white.png', [{ name: 'IN', leftSide: true, type: REMOTE_DATA_TABLE }, { name: 'IN', leftSide: true, type: TABLE_OUTPUT }], [{ name: 'OUT', leftSide: false, type: REMOTE_DATA_TABLE }, { name: 'OUT', leftSide: false, type: TABLE_OUTPUT }], key);
        this.addData('inportType', REMOTE_DATA_TABLE);
        this.addData('outportType', REMOTE_DATA_TABLE);
        this.addData('description', 'Use this module to filter table data.');
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

    processMetadata(metadata) {
        // Bind the changeDataType function to each element in the metadata. This function will be passed to the filter card in the inspector.
        metadata.columnHeaders.forEach(header => header.changeDataTypeFunction = this.changeDataType.bind(this));
        this.addData('metadata', metadata);
        this.addData('getFilterDetailsFunctionArray', this.inspectorCardMaker.addFilterCards(this.getData('metadata')));
    }

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
     * @param {function} callbackFN the Hub will notify the min max filter card that the type was changed.
     */
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

    updateInspectorCardForModifiedMetadata(numColumns) {
        this.getData('metadata').columnHeaders.slice(-numColumns).forEach(header => {
            header.changeDataTypeFunction = this.changeDataType.bind(this);
        });
        this.getInspectorCardMaker().addCardsToExistingFilter(this.getData('metadata').columnHeaders.slice(-numColumns), this.getData('getFilterDetailsFunctionArray'));
    }

}

export class DataConversion extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'dataConversion', 'DataConversion', 'images/icons/convert-white.png', [{ name: 'IN', leftSide: true, type: REMOTE_DATA_TABLE }, { name: 'IN', leftSide: true, type: TABLE_OUTPUT }], [{ name: 'OUT', leftSide: false, type: LOCAL_DATA_SOURCE }], key);
        this.addData('inportType', REMOTE_DATA_TABLE);
        this.addData('outportType', REMOTE_DATA_TABLE);
        this.addData('description', 'Use this module to convert table data.');
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

    processMetadata(metadata) {
        this.addData('metadata', metadata);
        this.addData('conversionCard', this.inspectorCardMaker.addConversionCard(this.getData('metadata')));
        this.getData('conversionCard').getButton().addEventListener('click', this.convertDataEvent.bind(this));
    }

    getFilterDataFunction() {
        const dataArray = [];
        this.getData('getFilterDetailsFunctionArray').forEach(fn => dataArray.push(fn()));
        return dataArray;
    }

    /**
     * Emits a Data Conversion Event. This message will be forwarded to the Hub where the conversion will be
     * processed on the DataManager.
     */
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
