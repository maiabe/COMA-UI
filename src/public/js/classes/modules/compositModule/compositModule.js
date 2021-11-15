import { Module } from "../module.js";
export class Composit extends Module {
    #nodeArray;
    #linkArray;
    constructor (category, color, shape, key) {
        super(category, color, shape, 'composit', 'Composit', 'images/icons/flow-diagram-black.png', [], [], key);
        
    }
}