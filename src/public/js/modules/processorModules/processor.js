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
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addFilterCards(this.getData('metadata'));
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