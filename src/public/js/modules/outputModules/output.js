import { Module } from "../index.js";
import { GM } from '../../main.js';
import chartThemes from '../../dataComponents/charts/echarts/theme/echartsThemes.js';
import { ChartDataStorage } from "./components/chartDataStorage.js";

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
        super(category, color, shape, 'output', 'Scatter Plot', 'images/icons/scatter-graph-black.png', [{ name: 'IN', leftSide: true }], [], key);
        this.setPopupContent();
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        const plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        const themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(this.themeDD);
        popupContent.appendChild(this.themeDD);
        popupContent.appendChild(this.plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('themeDD', themeDD, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    }
}

export class BarChart extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart.png', [{ name: 'IN', leftSide: true }], [], key);
        this.setPopupContent();
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        const plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        const themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(this.themeDD);
        popupContent.appendChild(themeDD);
        popupContent.appendChild(plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('themeDD', themeDD, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    }
}

export class LineChart extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart.png', [{ name: 'IN', leftSide: true }], [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.chartData = new ChartDataStorage('line');
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        const themeDD = this.buildEchartThemeDropdown();
        this.setEchartThemeDropdownEventListener(themeDD);
        const plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], ['chartDiv']);
        popupContent.appendChild(themeDD);
        popupContent.appendChild(plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('themeDD', themeDD, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    }

    createInspectorCardData() {
        this.setInspectorCardDescriptionText('This module will generate a line chart when connected to data.');
        this.addInspectorCardIDField();
        this.addInspectorCardDataConnectedField();
    }

    updateInspectorCardWithNewData(dataModule, data) {
        this.addInspectorCardLinkedNodeField(dataModule.getData('key'));
        const xAxis = this.addInspectorCardXAxisDropDown(data.data.getHeaders());
        const yAxis = this.addInspectorCardYAxisDropDown(data.data.getHeaders());
        this.chartData.listenToXAxisDataChanges(xAxis);
        this.chartData.listenToYAxisDataChanges(yAxis);
        this.chartData.setInitialValues(xAxis.value, yAxis.value);
        this.addBuildChartEventListener(this.addInspectorCardGenerateChartButton());
    }


    addBuildChartEventListener(button) { button.addEventListener('click', this.createNewChartFromButtonClick.bind(this)); }

    createNewChartFromButtonClick() {
        GM.MM.emitLocalChartEvent(
            this.getData('linkedDataKey'),
            this.getData('key'),
            this.chartData.getChartData(),
            this.getData('plotDiv'),
            'line');
    }
}

export class ImageOutput extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Image', 'images/icons/image.png', [{ name: 'IN', leftSide: true }], [], key);
        this.setPopupContent();
    }
}
export class Value extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Value', 'images/icons/equal.png', [{ name: 'IN', leftSide: true }], [], key);

        this.setPopupContent();
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        const setValueWrapper = GM.HF.createNewDiv('', '', ['setValueWrapper'], []);
        popupContent.appendChild(setValueWrapper);
        const dataArea = GM.HF.createNewDiv('', '', ['numberDataArea'], []);
        this.textArea = GM.HF.createNewParagraph('', '', ['popup-text-large'], [], this.data);
        dataArea.appendChild(this.textArea);
        popupContent.appendChild(dataArea);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('themeDD', themeDD, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    };

    updatePopupText = val => {
        this.textArea.innerHTML = val;
    };


}
