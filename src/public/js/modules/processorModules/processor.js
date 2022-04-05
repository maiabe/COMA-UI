import { Module } from "../module.js";
import { LOCAL_DATA_SOURCE, REMOTE_DATA_TABLE, TABLE_OUTPUT } from "../../sharedVariables/constants.js";
import { GM } from "../../main.js";

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
        GM.MM.emitDataTypeChangeRequest({metadata: this.getData('metadata'), field: fieldName, oldType: oldDataType, dataKey: this.getData('dataKey'), newType: newDataType, callbackFN: callbackFN, updateMetadataFN: this.updateMetadata.bind(this)});
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

    convertDataEvent() { 
        GM.MM.emitDataConversionEvent(this.getData('conversionCard').getConversionInputAndFunction(), this.getData('dataKey'), this.getData('key'));
    }
}

export class FunctionProcessor extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'function', 'Function', 'images/icons/function.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}

export class Gaussian extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'gaussianFilter', 'Gaussian Filter', 'images/icons/gaussian-function.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}

export class Laplacian extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'laplacianFilter', 'Laplacian Filter', 'images/icons/filter.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}
export class Sum extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'sum', 'Sum', 'images/icons/sum-sign.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}
export class Subtract extends Processor {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'subtract', 'Subtract', 'images/icons/subtraction-symbol.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}