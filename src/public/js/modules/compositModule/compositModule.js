/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Module } from "../module.js";
export class Composite extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;
    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'composite', name, 'images/icons/flow-diagram-white.png', inports, [{ name: 'OUT', leftSide: false }], key, 'Composite Module');
        this.isData = isData;
        this.createInspectorCardData();
    }
    
    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
    }

    /** --- PUBLIC ---
     * Saves the module using teh save module function.*/
    saveModule() {
        const saveFunction = this.getData('Save Module Function');
        saveFunction(this.getData('Composite Group Info'));
    }

    /** --- PUBLIC ---
     * Stores the function that saves the composite module for future use.
     * @param {function} saveModuleFunction */
    setSaveModuleFunction(saveModuleFunction) {
        this.addData('Save Module Function', saveModuleFunction);
    }

    /** --- PUBLIC ---
     * Stires the JSON representation of the group
     * @param {JSON Object} info representation of links and nodes with keys. */
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

}