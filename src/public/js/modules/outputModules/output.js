import { Module } from "../index.js";
import { GM } from '../../main.js';
import { ChartDataStorage } from "./components/chartDataStorage.js";
import { TABLE_OUTPUT, LOCAL_DATA_SOURCE } from "../../sharedVariables/constants.js";

export class Output extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
    }
}

export class Chart_2D extends Output {
    constructor(category, color, shape, command, name, image, outports, key) {
        super(category, color, shape, command, name, image, [{ name: 'IN', leftSide: true, type: TABLE_OUTPUT }], outports, key)
    };

    setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('themeDD', this.popupContentMaker.addEChartThemeDropdown(this.getData('key')), false, '', false);
        this.addData('plotDiv', this.popupContentMaker.addPlotDiv(this.getData('key')), false, '', false);
        this.addData('inportType', LOCAL_DATA_SOURCE);
        this.addData('outportType', -1);
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    updateInspectorCardWithNewData(dataModule, data) {
        const dataKey = dataModule.getData('dataKey');
        this.inspectorCardMaker.addInspectorCardLinkedNodeField(dataKey);
        const xAxis = this.inspectorCardMaker.addInspectorCardChartXAxisCard(data.data.getHeaders(), this.getData('key'));
        const yAxis = this.inspectorCardMaker.addInspectorCardChartYAxisCard(data.data.getHeaders(), this.getData('key'));
        yAxis.dropdown.id = `${this.chartData.getNumberOfTraces()}-y-axis-dropdown`;
        yAxis.errorDropDown.id = `${this.chartData.getNumberOfTraces()}-y-axis-error-dropdown`;
        this.chartData.storeHeaders(data.data.getHeaders());
        this.chartData.set_2D_XAxisListeners(xAxis);
        this.chartData.set_2D_YAxisListeners(yAxis);
        this.chartData.setInitialValues(xAxis.dropdown.value, yAxis.dropdown.value, xAxis.labelInput.value,
            yAxis.labelInput.value, xAxis.gridCheckbox.checkbox.checked, yAxis.gridCheckbox.checkbox.checked,
            xAxis.tickCheckbox.checkbox.checked, yAxis.tickCheckbox.checkbox.checked, yAxis.errorDropDown.value);
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
            this.getData('dataKey'),
            this.getData('key'),
            this.chartData.getChartData(),
            this.getData('plotDiv'),
            this.getData('chartType'),
            this.getData('coordinateSystem'));
    }

    addTrace() {
        const title = 'test';
        const dropDown = GM.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], this.chartData.getHeaders(), this.chartData.getHeaders());
        const errorHeaders = [...this.chartData.getHeaders()];
        errorHeaders.unshift('None');
        const errorDropDown = GM.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], errorHeaders, errorHeaders);
        this.inspectorCardMaker.addNewTraceToInspectorCard(dropDown, errorDropDown);
        dropDown.id = `${this.chartData.getNumberOfTraces()}-x-axis-dropdown`;
        errorDropDown.id = `${this.chartData.getNumberOfTraces()}-x-axis-error-dropdown`;
        this.chartData.listenToYAxisDataChanges(dropDown);
        this.chartData.listenToYAxisErrorChanges(errorDropDown);
        this.chartData.addInitialValueForNewTrace(dropDown.value, errorDropDown.value, dropDown.id.split('-')[0]);
    }
}

export class ScatterPlot extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Scatter Plot', 'images/icons/scatter-graph.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'scatter');
        this.addData('coordinateSystem', 'cartesian2d');
        this.chartData = new ChartDataStorage('scatter', 'cartesian2d');
    }
}

export class BarChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart-white.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'bar');
        this.addData('coordinateSystem', 'cartesian2d');
        this.chartData = new ChartDataStorage('bar', 'cartesian2d');
    }
}

export class LineChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart-white.png', [], key,);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'line');
        this.addData('coordinateSystem', 'cartesian2d');
        this.chartData = new ChartDataStorage('line', 'cartesian2d');
    }
}

export class OrbitalPlot extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Orbital Plot', 'images/icons/orbital-plot-white.png', [], key,);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'line');
        this.addData('coordinateSystem', 'polar');
        this.chartData = new ChartDataStorage('line', 'polar');
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
        // const popupContent = GM.HF.createNewDiv('', '', [], []);
        // const setValueWrapper = GM.HF.createNewDiv('', '', ['setValueWrapper'], []);
        // popupContent.appendChild(setValueWrapper);
        // const dataArea = GM.HF.createNewDiv('', '', ['numberDataArea'], []);
        // this.textArea = GM.HF.createNewParagraph('', '', ['popup-text-large'], [], this.data);
        // dataArea.appendChild(this.textArea);
        // popupContent.appendChild(dataArea);
        // this.addData('popupContent', popupContent, false, '', false);
        // this.addData('themeDD', themeDD, false, '', false);
        // this.addData('plotDiv', plotDiv, false, '', false);
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
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('plotDiv', this.popupContentMaker.addPlotDiv(), false, '', false);
    };

    storeTableHeaders(headerRow) {
        this.chartData.storeHeaders(headerRow);
    }
}
