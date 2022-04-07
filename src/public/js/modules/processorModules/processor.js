import { Module } from "../module.js";
import { LOCAL_DATA_SOURCE, REMOTE_DATA_TABLE, TABLE_OUTPUT } from "../../sharedVariables/constants.js";

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

    processNewMetadata(metadata) {
        metadata.columnHeaders.forEach(header => header.changeDataTypeFunction = this.changeDataType.bind(this));
        this.addData('metadata', metadata);
        this.addData('getFilterDetailsFunctionArray', this.inspectorCardMaker.addFilterCards(this.getData('metadata')));
    }

    getFilterDataFunction() {
        const dataArray = [];
        this.getData('getFilterDetailsFunctionArray').forEach(fn => dataArray.push(fn()));
        return dataArray;
    }

    changeDataType(fieldName, oldDataType, newDataType, callbackFN) {
        const msg = {
            type: 'Emit Data Type Change Request',
            args: {
                metadata: this.getData('metadata'),
                dataKey: this.getData('dataKey'),
                moduleKey: this.getData('key'),
                field: fieldName,
                oldType: oldDataType,
                newType: newDataType,
                callback: callbackFN,
                updateMetadataCallback: this.updateMetadata.bind(this)
            }
        }
        this.sendMessage(msg);
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

    processNewMetadata(metadata) {
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
     * Notifies the Module Manager that an data conversion event has taken place. Module Manager will
     * forward the message to the hub.
     */
    convertDataEvent() {
        const msg = {
            type: 'Emit Data Conversion Event',
            args: {
                conversionDetails: this.getData('conversionCard').getConversionInputAndFunction(),
                dataKey: this.getData('dataKey'),
                moduleKey: this.getData('key')
            }
        }
        this.sendMessage(msg);
    }
}
