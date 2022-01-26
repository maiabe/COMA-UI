import { Module } from "../module.js";
import {GM} from "../../main.js";
export class Data extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;
    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'data', name, 'images/icons/flow-diagram-white.png', inports, [{ name: 'OUT', leftSide: false }], key);
        this.isData = true;
        this.addData('link', -1, false, '', false);
        this.addData('isDataModule', isData, false, '', false);
        console.log(key);
        this.setPopupContent();
        this.createInspectorCardData();
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        this.addData('popupContent', popupContent, false, '', false);
    }

    createInspectorCardData() {
        this.addInspectorCardIDField();
        this.addInspectorDataCard();
    }

}