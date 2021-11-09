import { Module } from "../module.js";
import {GM} from '../../../scripts/main.js';
import chartThemes from '../../../scripts/echarts/theme/echartsThemes.js';

export class Output extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
    }

    buildEchartThemeDropdown = () => {
        return GM.HF.createNewSelect(`plot_${this.key}`, `plot_${this.key}`, ['plot-dd'], [], chartThemes, chartThemes);
    };

    setEchartThemeDropdownEventListener = dropDownElement => {
        dropDownElement.addEventListener('change', event => {
            GM.MM.handleEchartThemeChange(this.getData('key'), event.target.value);
        });
    }
}

export class ScatterPlot extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Scatter Plot', 'images/icons/scatter-graph.png', [{ name: 'IN', leftSide: true }], [], key);
        this.popupContent;
        this.plotDiv;
        this.themeDD;
        this.setPopupContent();

    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(this.themeDD);
        this.popupContent.appendChild(this.themeDD);
        this.popupContent.appendChild(this.plotDiv);
    }
}

export class BarChart extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart.png', [{ name: 'IN', leftSide: true }], [], key);
        this.popupContent;
        this.plotDiv;
        this.themeDD;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(this.themeDD);
        this.popupContent.appendChild(this.themeDD);
        this.popupContent.appendChild(this.plotDiv);
    }
}

export class LineChart extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart.png', [{ name: 'IN', leftSide: true }], [], key);
        this.popupContent;
        this.plotDiv;
        this.themeDD;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(this.themeDD);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], ['chartDiv']);
        this.popupContent.appendChild(this.themeDD);
        this.popupContent.appendChild(this.plotDiv);
    }
}

export class ImageOutput extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Image', 'images/icons/image.png', [{ name: 'IN', leftSide: true }], [], key);
        this.popupContent;
        this.setPopupContent();
    }
}
export class Value extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Value', 'images/icons/equal.png', [{ name: 'IN', leftSide: true }], [], key);
        this.popupContent;
        this.dataArea;
        this.textArea;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        const setValueWrapper = GM.HF.createNewDiv('', '', ['setValueWrapper'], []);
        this.popupContent.appendChild(setValueWrapper);
        const dataArea = GM.HF.createNewDiv('', '', ['numberDataArea'], []);
        this.textArea = GM.HF.createNewParagraph('', '', ['popup-text-large'], [], this.data);
        dataArea.appendChild(this.textArea);
        this.popupContent.appendChild(dataArea);
    };

    updatePopupText = val => {
        this.textArea.innerHTML = val;
    };


}
