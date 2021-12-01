import { Module } from "../module.js";
export class Composit extends Module {
    #nodeArray;
    #linkArray;
    #isDataModule;
    constructor (category, color, shape, key, name, inports, isData) {
        super(category, color, shape, 'composit', name, 'images/icons/flow-diagram-white.png', inports, [{ name: 'OUT', leftSide: false }], key);
        this.isData = isData;
        this.addData('link', -1, false, '', false);
        this.addData('isDataModule', isData, false, '', false);
    }

}