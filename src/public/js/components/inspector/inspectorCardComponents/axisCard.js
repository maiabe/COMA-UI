import { GM } from "../../../main.js";
export class AxisCard {
    constructor() {
        this.elementTable = new Map();
    }

    createWrapper() {
        const wrapperElement = GM.HF.createNewDiv('', '', ['axis-card-wrapper'], []);
        this.storeElement('wrapperElement', wrapperElement);
    }

    createTitleBarElement() {
        const titleBarElement = GM.HF.createNewDiv('', '', ['axis-card-title-bar'], []);
        this.storeElement('titleBar', titleBarElement);
    }

    createDataField() {
        
    }

    storeElement(key, value) {
        this.elementTable.set(key, value);
    }
}