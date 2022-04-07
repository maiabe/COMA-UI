import { Output } from "../index.js";
import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";

export class Table extends Output {

    #dataArea;    // Popup section that can display data.

    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Table', 'images/icons/table.png', [{ name: 'IN', leftSide: true }], [], key);
        this.HF = new HTMLFactory();
        this.setPopupContent();

    }

    setPopupContent = () => {
        const popupContent = this.HF.createNewDiv('', '', [], []);
        const plotDiv = this.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        popupContent.appendChild(this.plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    }
}