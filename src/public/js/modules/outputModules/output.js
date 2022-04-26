import { Module } from "../index.js";
import { ChartDataStorage } from "./components/chartDataStorage.js";
import { TABLE_OUTPUT, LOCAL_DATA_SOURCE, MODULE, MODULE_MANAGER, OUTPUT_MANAGER } from "../../sharedVariables/constants.js";
import { Message } from "../../communication/message.js";

export class Output extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
    }
}

/** All 2D charts inherit from this except Tables */
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

    /** --- PUBLIC ---
     * Called by the Hub when an output module is connected to a flow with data.
     * Updates the inspector card and sets up the chartData object.
     * @param {Number} dataKey key to the dataset on the DataManager 
     * @param {string[]} headers data headers for loading dropdowns etc.
     */
    updateInspectorCardWithNewData(dataKey, headers) {
        const key = this.getData('key');
        this.inspectorCardMaker.addInspectorCardLinkedNodeField(dataKey);
        const xAxis = this.inspectorCardMaker.addInspectorCardChartXAxisCard(headers, key, this.addTrace.bind(this));
        const yAxis = this.inspectorCardMaker.addInspectorCardChartYAxisCard(headers, key, this.addTrace.bind(this));
        yAxis.dropdown.id = `${this.chartData.getNumberOfTraces()}-y-axis-dropdown`;
        yAxis.errorDropDown.id = `${this.chartData.getNumberOfTraces()}-y-axis-error-dropdown`;
        this.chartData.storeHeaders(headers);
        this.chartData.set_2D_XAxisListeners(xAxis);
        this.chartData.set_2D_YAxisListeners(yAxis);
        this.chartData.setInitialValues(xAxis.dropdown.value, yAxis.dropdown.value, xAxis.labelInput.value,
            yAxis.labelInput.value, xAxis.gridCheckbox.checkbox.checked, yAxis.gridCheckbox.checkbox.checked,
            xAxis.tickCheckbox.checkbox.checked, yAxis.tickCheckbox.checkbox.checked, yAxis.errorDropDown.value);
        this.inspectorCardMaker.addInspectorCardGenerateChartButton(key, this.createNewChartFromButtonClick.bind(this));
    }

    /** --- PUBLIC --- 
     * Emits a Create New Local Chart Event.
     * Attached to a button on the Inspector Card.
     */
    createNewChartFromButtonClick() {
        this.sendMessage(new Message(
            OUTPUT_MANAGER, MODULE, 'Create New Local Chart Event',
            {
                datasetKey: this.getData('dataKey'),
                moduleKey: this.getData('key'),
                fieldData: this.chartData.getChartData(),
                div: this.getData('plotDiv'),
                type: this.getData('chartType')
            }));
    }

    /** --- Public ---
     * This function is passed as a callback to the inspector card element and attached to a button.
     * Adds a new trace to the Axis inspector card and updates the ChartData table with the new data.
     * A Trace consists of a main data dropdown where the user can select fields and an error dropdown that starts with 'None'.
     */
    addTrace() {
        const title = 'test';
        const dropDown = this.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], this.chartData.getHeaders(), this.chartData.getHeaders());
        const errorHeaders = [...this.chartData.getHeaders()];
        errorHeaders.unshift('None');
        const errorDropDown = this.HF.createNewSelect(`${title}-${this.getData('key')}`, `${title}-${this.getData('key')}`, [], [], errorHeaders, errorHeaders);
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
        this.addData('chartType', 'table');
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    /** --- PUBLIC ---
     * Called by the HUB when a new link is drawn. Updates the inspector card to show the
     * available data for creating the CSV file.
     * @param {Number} dataKey key that identifies the dataset on the DataManager 
     * @param {string[]} headers the names of the fields in the table 
     */
    updateInspectorCardWithNewData(dataKey, headers) {
        const key = this.getData('key');
        this.chartData.storeHeaders(headers);
        this.inspectorCardMaker.addInspectorCardLinkedNodeField(dataKey);
        const columnCheckboxes = this.inspectorCardMaker.addInspectorCardIncludeColumnCard(
            headers,
            key);
        this.chartData.listenToCheckboxChanges(columnCheckboxes);
        this.inspectorCardMaker.addInspectorCardGenerateTablePreviewButton(key, this.createNewTableFromButtonClick.bind(this));
        this.inspectorCardMaker.addInspectorCardGenerateCSVFileButton(key, this.createCSVFile.bind(this));
    }

    /** --- PUBLIC ---
     * Emits a Create New CSV File Event when the createCSVFile button is clicked in the inspector
     */
    createCSVFile() {
        this.sendMessage(new Message(
            OUTPUT_MANAGER, MODULE, 'Create New CSV File Event',
            {
                datasetKey: this.getData('dataKey'),
                moduleKey: this.getData('key'),
                fieldData: this.chartData.getChartData(),
            }));
    }

    /** --- PUBLIC ---
     * Emits a Create New Local Table Event when the Preview CSV Table Data button is clicked in the inspector.
     */
    createNewTableFromButtonClick() {
        this.sendMessage(new Message(
            OUTPUT_MANAGER, MODULE, 'Create New Local Table Event',
            {
                datasetKey: this.getData('dataKey'),
                moduleKey: this.getData('key'),
                fieldData: this.chartData.getChartData(),
                div: this.getData('plotDiv'),
                type: this.getData('chartType')
            }));
    }

    setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('plotDiv', this.popupContentMaker.addPlotDiv(), false, '', false);
    };

    storeTableHeaders(headerRow) {
        this.chartData.storeHeaders(headerRow);
    }
}
