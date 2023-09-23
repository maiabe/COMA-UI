/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Module } from "../index.js";
import { ChartDataStorage } from "./components/chartDataStorage.js";
import { LT_OUTPUT, LT_PROCESSOR, LT_SOURCE, MODULE, MODULE_MANAGER, OUTPUT_MANAGER, INPUT_MANAGER, WORKER_MANAGER } from "../../sharedVariables/constants.js";
import { Message } from "../../communication/message.js";

export class Output extends Module {
    constructor(category, color, shape, command, name, image, inports, outports, key) {
        super(category, color, shape, command, name, image, inports, outports, key);
        this.addData('inportType', [-1]);
        this.addData('outportType', [LT_PROCESSOR, LT_SOURCE]);
    }
}

/** All 2D charts inherit from this except Tables */
export class Chart_2D extends Output {
    constructor(category, color, shape, command, name, image, outports, key) {
        super(category, color, shape, command, name, image,
            [{ name: 'IN', leftSide: true, type: LT_SOURCE }, { name: 'OUT', leftSide: true, type: LT_OUTPUT }], outports, key)
    };

    /** --- PUBLIC ---
     * Creates the HTML content to be inserted into the Popup in the DOM. */
    setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('themeDD', this.popupContentMaker.addEChartThemeDropdown(this.getData('key')), false, '', false);

        this.addData('plotDiv', this.popupContentMaker.addPlotDiv(this.getData('key')), false, '', false);
        this.addData('inportType', [LT_SOURCE, LT_PROCESSOR]);
        this.addData('outportType', [-1]);

        var popupContent = this.getData('popupContent');
        popupContent.classList.add('plot-popup');
    }

    /** --- PUBLIC ---
     * Creates the Inspector Card data */
    createInspectorCardData() {
        //this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        //this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    prepInspectorCardData(toModuleKey, fromModuleData) {
        console.log(fromModuleData);
        this.sendMessage(new Message(INPUT_MANAGER, MODULE, 'Prep Chart Data Event', { moduleKey: toModuleKey, sourceModuleData: fromModuleData }));
    }

    /** --- PUBLIC ---
     * Called by the Hub when an output module is connected to a flow with data.
     * Updates the inspector card and sets up the chartData object.
     * @param {Number} moduleKey key of the module
     * @param {object} moduleData module data for data headers, data, etc
     * */
    updateInspectorCard() {
        var moduleKey = this.getData('key');
        var moduleData = this.getData('moduleData');
        this.inspectorCardMaker.updateChartModuleInspectorCard(moduleKey, moduleData);


        /*const xAxis = this.inspectorCardMaker.addInspectorCardChartXAxisCard(headers, moduleKey, this.addTrace.bind(this));
        const yAxis = this.inspectorCardMaker.addInspectorCardChartYAxisCard(headers, moduleKey, this.addTrace.bind(this));
        yAxis.dropdown.id = `${this.chartData.getNumberOfTraces()}-y-axis-dropdown`;
        yAxis.errorDropDown.id = `${this.chartData.getNumberOfTraces()}-y-axis-error-dropdown`;
        this.chartData.storeHeaders(headers);
        this.chartData.set_2D_XAxisListeners(xAxis);
        this.chartData.set_2D_YAxisListeners(yAxis);
        this.chartData.setInitialValues(xAxis.dropdown.value, yAxis.dropdown.value, xAxis.labelInput.value,
            yAxis.labelInput.value, xAxis.gridCheckbox.checkbox.checked, yAxis.gridCheckbox.checkbox.checked,
            xAxis.tickCheckbox.checkbox.checked, yAxis.tickCheckbox.checkbox.checked, yAxis.errorDropDown.value);
        this.inspectorCardMaker.addInspectorCardGenerateChartButton(moduleKey, this.createNewChartFromButtonClick.bind(this));*/
    }

    /** --- PUBLIC ---
     * Called by the Hub when an output module is connected to a flow with data.
     * Updates the inspector card and sets up the chartData object.
     * @param {Number} dataKey key to the dataset on the DataManager 
     * @param {string[]} headers data headers for loading dropdowns etc.*/
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
     * Attached to a button on the Inspector Card. */
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
     * A Trace consists of a main data dropdown where the user can select fields and an error dropdown that starts with 'None'. */
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
        //this.chartData = new ChartDataStorage('scatter', 'cartesian2d');
    }
}

export class BarChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart-white.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'bar');
        this.addData('coordinateSystem', 'cartesian2d');
        //this.chartData = new ChartDataStorage('bar', 'cartesian2d');
    }
}

export class LineChart extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart-white.png', [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'line');
        this.addData('coordinateSystem', 'cartesian2d');
        //this.chartData = new ChartDataStorage('line', 'cartesian2d');
    }
}
/*
export class OrbitalPlot extends Chart_2D {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Orbital Plot', 'images/icons/orbital-plot-white.png', [], key,);
        this.setPopupContent();
        this.createInspectorCardData();
        this.addData('chartType', 'line');
        this.addData('coordinateSystem', 'polar');
        //this.chartData = new ChartDataStorage('line', 'polar');
    }
}*/


export class OrbitalPlot extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Orbital Plot', 'images/icons/orbital-plot-white.png', 
            [{ name: 'IN', leftSide: true, type: LT_SOURCE }, { name: 'OUT', leftSide: true, type: LT_OUTPUT }], [], key);
        this.addData('callOnCreationFunction', true);
        this.#setPopupContent();
    }

    /** --- PUBLIC ---
     * Creates the HTML content to be inserted into the Popup in the DOM. */
    #setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('orbitDiv', this.popupContentMaker.addPlotDiv(this.getData('key')), false, '', false);
        this.addData('inportType', [LT_SOURCE, LT_PROCESSOR]);
        this.addData('outportType', [-1]);

        var popupContent = this.getData('popupContent');
        popupContent.classList.add('plot-popup');
    }

    // on creation, set the elliptical moduleData in browser's localStorage
    getPlanetOrbits = () => {
        // check if localStorage already has the Planet Orbits data
        if (!localStorage.getItem('Planet Orbits')) {
            let moduleKey = this.getData('key');
            //console.log(moduleKey);
            this.sendMessage(new Message(INPUT_MANAGER, MODULE, 'Get Planet Orbits Event', { moduleKey: moduleKey }));
            console.log(moduleKey);
        }
    }

    prepInspectorCardData(toModuleKey, fromModuleData) {
        this.sendMessage(new Message(INPUT_MANAGER, MODULE, 'Prep Orbit Data Event', { moduleKey: toModuleKey, sourceModuleData: fromModuleData }));
    }

    /** --- PUBLIC ---  rename to createInspectorCardContent() ?
     * Called by the Hub when an output module is connected to a flow with data.
     * Updates the inspector card and sets up the chartData object.
     * @param {Number} moduleKey key of the module
     * @param {object} moduleData module data for data headers, data, etc
     * */
    updateInspectorCard() {
        var moduleKey = this.getData('key');
        var moduleData = this.getData('moduleData');
        console.log(moduleData);
        if (moduleData) {
            this.inspectorCardMaker.updateOrbitModuleInspectorCard(moduleKey, moduleData);
        }
    }

    onCreation() {
        //localStorage.clear();
        if (!localStorage.getItem('Planet Orbits')) {
            this.sendMessage(new Message(WORKER_MANAGER, MODULE, 'Get Planet Orbits Event'));
        }
    }
}

export class ToCSV extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'To CSV', 'images/icons/csv-file-format-extension-white.png', [{ name: 'IN', leftSide: true, type: LT_OUTPUT }], [], key);
        this.setPopupContent();
        this.createInspectorCardData();
        this.chartData = new ChartDataStorage('table');
        this.addData('inportType', LT_PROCESSOR);
        this.addData('outportType', -1);
        this.addData('chartType', 'table');
    }

    /** --- PUBLIC ---
    * Creates the Inspector Card data */
    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardIDField(this.getData('key'));
        this.inspectorCardMaker.addInspectorCardDataConnectedField();
    }

    /** --- PUBLIC ---
     * Called by the HUB when a new link is drawn. Updates the inspector card to show the
     * available data for creating the CSV file.
     * @param {Number} dataKey key that identifies the dataset on the DataManager 
     * @param {string[]} headers the names of the fields in the table */
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
     * Emits a Create New CSV File Event when the createCSVFile button is clicked in the inspector */
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
     * Emits a Create New Local Table Event when the Preview CSV Table Data button is clicked in the inspector. */
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

    /** --- PUBLIC ---
     * Creates the HTML content to be inserted into the Popup in the DOM. */
    setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
        this.addData('plotDiv', this.popupContentMaker.addPlotDiv(), false, '', false);
    };

    /** --- PUBLIC ---
     * stores an array of strings, 1 for each column name, on the chartData table.
     * @param {string[]} headerRow */
    storeTableHeaders(headerRow) {
        this.chartData.storeHeaders(headerRow);
    }
}



