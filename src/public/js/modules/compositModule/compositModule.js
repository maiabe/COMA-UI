import { Module } from "../module.js";
export class Composite extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;
    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'composite', name, 'images/icons/flow-diagram-white.png', inports, [{ name: 'OUT', leftSide: false }], key, 'Composite Module');
        this.isData = isData;
        this.setPopupContent();
        this.createInspectorCardData();
    }
    
    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
    }

    saveModule() {
        const saveFunction = this.getData('Save Module Function');
        saveFunction(this.getData('Composite Group Info'));
    }

    setSaveModuleFunction(saveModuleFunction) {
        this.addData('Save Module Function', saveModuleFunction);
    }

    setCompositeGroupInfo(info) {
        this.addData('Composite Group Info', info);
    }

}
export class CompositePrefab extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;

    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'composite', name, 'images/icons/flow-diagram-white.png', inports, [{ name: 'OUT', leftSide: false }], key, 'Composite Module');
        this.isData = isData;
        this.setPopupContent();
    }
    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    saveModule() {
        const saveFunction = this.getData('Save Module Function');
        saveFunction(this.getData('Composite Group Info'));
    }

    setSaveModuleFunction(saveModuleFunction) {
        this.addData('Save Module Function', saveModuleFunction);
    }

    setCompositeGroupInfo(info) {
        this.addData('Composite Group Info', info);
    }

}