import { Module } from "../index.js";
import { GM } from '../../main.js';
import chartThemes from '../../dataComponents/charts/echarts/theme/echartsThemes.js';
import { ChartDataStorage } from "./components/chartDataStorage.js";
import { TABLE_OUTPUT, LOCAL_DATA_SOURCE } from "../../sharedVariables/constants.js";

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

export class Chart_2D extends Output {
    constructor(category, color, shape, command, name, image, outports, key) {
        super(category, color, shape, command, name, image, [{ name: 'IN', leftSide: true, type: TABLE_OUTPUT }], outports, key)
    };

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
        this.addData('inportType', LOCAL_DATA_SOURCE);
        this.addData('outportType', -1);
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    updateInspectorCardWithNewData(dataModule, data) {
        this.inspectorCardMaker.addInspectorCardLinkedNodeField(dataModule.getData('key'));
        const xAxis = this.inspectorCardMaker.addInspectorCardChartXAxisCard(data.data.getHeaders(), this.getData('key'));
        const yAxis = this.inspectorCardMaker.addInspectorCardChartYAxisCard(data.data.getHeaders(), this.getData('key'));
        yAxis.dropdown.id = `${this.chartData.getNumberOfTraces()}-x-axis-dropdown`;
        this.chartData.storeHeaders(data.data.getHeaders());
        this.chartData.listenToXAxisDataChanges(xAxis.dropdown);
        this.chartData.listenToYAxisDataChanges(yAxis.dropdown);
        this.chartData.listenToXAxisLabelChanges(xAxis.labelInput);
        this.chartData.listenToYAxisLabelChanges(yAxis.labelInput);
        this.chartData.listenToXAxisTickChanges(xAxis.tickCheckbox.checkbox);
        this.chartData.listenToYAxisTickChanges(yAxis.tickCheckbox.checkbox);
        this.chartData.listenToXAxisGridChanges(xAxis.gridCheckbox.checkbox);
        this.chartData.listenToYAxisGridChanges(yAxis.gridCheckbox.checkbox);
        this.chartData.setInitialValues(xAxis.dropdown.value,
            yAxis.dropdown.value,
            xAxis.labelInput.value,
            yAxis.labelInput.value,
            xAxis.gridCheckbox.checkbox.checked,
            yAxis.gridCheckbox.checkbox.checked,
            xAxis.tickCheckbox.checkbox.checked,
            yAxis.tickCheckbox.checkbox.checked);
        this.addNewTraceButtonListener(xAxis.addTraceButton);
        this.addNewTraceButtonListener(yAxis.addTraceButton);
        this.addBuildChartEventListener(this.inspectorCardMaker.addInspectorCardGenerateChartButton(this.getData('key')));
    }

    addNewTraceButtonListener(button) {
        button.addEventListener('click', this.addTrace.bind(this));
    }

    addBuildChartEventListener(button) { button.addEventListener('click', this.createNewChartFromButtonClick.bind(this)); }

    createNewChartFromButtonClick() {
        GM.MM.emitLocalChartEvent(
            this.getData('linkedDataKey'),
            this.getData('key'),
            this.chartData.getChartData(),
            this.getData('plotDiv'),
            this.getData('chartType'));
    }

    addTrace() {
        const title = 'test';
        const dropDown = GM.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], this.chartData.getHeaders(), this.chartData.getHeaders());
        this.inspectorCardMaker.addNewTraceToInspectorCard(dropDown);
        dropDown.id = `${this.chartData.getNumberOfTraces()}-x-axis-dropdown`;
        this.chartData.listenToYAxisDataChanges(dropDown);
        console.log(dropDown.id);
        this.chartData.addInitialValueForNewTrace(dropDown.value, dropDown.id.split('-')[0]);
    }
}

export class ScatterPlot extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Scatter Plot', 'images/icons/scatter-graph.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'scatter');
        this.chartData = new ChartDataStorage('scatter');
    }
}

export class BarChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart-white.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'bar');
        this.chartData = new ChartDataStorage('bar');
    }
}

export class LineChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart-white.png', [], key,);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'line');
        this.chartData = new ChartDataStorage('line');
    }
}

export class ImageOutput extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Image', 'images/icons/image.png', [], key);
        this.setPopupContent();
    }
}
export class Value extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Value', 'images/icons/equal.png', [], key);
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

export class ToCSV extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'To CSV', 'images/icons/csv-file-format-extension-white.png', [{ name: 'IN', leftSide: true, type: TABLE_OUTPUT }], [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.chartData = new ChartDataStorage('table');
        this.addData('inportType', LOCAL_DATA_SOURCE);
        this.addData('outportType', -1);
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    updateInspectorCardWithNewData(dataModule, data) {
        this.inspectorCardMaker.addInspectorCardLinkedNodeField(dataModule.getData('key'));
        const columnCheckboxes = this.inspectorCardMaker.addInspectorCardIncludeColumnCard(data.data.getHeaders(), this.getData('key'));
        this.chartData.listenToCheckboxChanges(columnCheckboxes);
        this.addGenerateTablePreviewEventListener(this.inspectorCardMaker.addInspectorCardGenerateTablePreviewButton(this.getData('key')));
        this.addCreateCSVFileEventListener(this.inspectorCardMaker.addInspectorCardGenerateCSVFileButton(this.getData('key')));
        console.log(data);
    }

    addGenerateTablePreviewEventListener(button) { button.addEventListener('click', this.createNewTableFromButtonClick.bind(this)); }
    addCreateCSVFileEventListener(button) { button.addEventListener('click', this.createCSVFile.bind(this)) };

    createCSVFile() {
        GM.MM.emitCreateCSVEvent(this.getData('linkedDataKey'), this.getData('key'), this.chartData.getTableData());
    }

    createNewTableFromButtonClick() {
        GM.MM.emitLocalTableEvent(
            this.getData('linkedDataKey'),
            this.getData('key'),
            this.chartData.getTableData(),
            this.getData('plotDiv'),
            'table');
    }

    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', [], []);
        const plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], ['chartDiv']);
        popupContent.appendChild(plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);
    };

    storeTableHeaders(headerRow) {
        console.log(headerRow);
        this.chartData.storeHeaders(headerRow);
    }
}
