/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { Publisher, Message } from '../communication/index.js';
import { ChartBuilder, CsvWriter } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
export class OutputManager {
    publisher;
    #outputMap;         // When a chart is created, parameters are stored here. If popup is closed, it can be recreatd from this data.
    #chartBuilder;
    #activeChartMap;
    #csvWriter;
    #dataTable;

    constructor() {
        this.publisher = new Publisher();
        this.#outputMap = new Map();
        this.#chartBuilder = new ChartBuilder();
        this.#activeChartMap = new Map();
        this.#csvWriter = new CsvWriter();
        this.#dataTable = new Map();
    };

    /** --- PUBLIC ---
     * Stores the chart information and data into the outputmap hash table.
     * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this chart.
     * @param {object} data the data that is used for the chart
     * @param {object} div the html div to inject the chart
     * @param {string} type the type of chart. ie. 'bar', 'scatter'
     * @param {string} xAxisLabel (Optional)
     * @param {string} yAxisLabel (Optional)
     * @returns true if successful, false if failure  */
     storeChartData = (key, data, div, type, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object'), varTest(div, 'div', 'object'), varTest(type, 'type', 'string')], 'OutputManager', 'storeChartData')) return false;
        this.#outputMap.set(key, { data: data, type: type, div: div, outputType: 'chart', framework: this.#getFramework(type), theme: 'dark', xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel, xAxisGrid: xAxisGrid, yAxisGrid: yAxisGrid, xAxisTick: xAxisTick, yAxisTick: yAxisTick, coordinateSystem: coordinateSystem });
        return true;
    }

    /** --- PUBLIC ---
     * Generates data for a chart and calls the chart builder.
     * @param {number} key the key to the chart data.
     * @param {HTML element} div the html element that we will place the chart
     * @param {number} width width of the div in pixels. (number only)
     * @param {number} height height of the div in pixels. (number only)
     * @param {string} framework 'echart' or 'plotly' */
    drawChart = (key, div, width, height) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(div, 'div', 'object'), varTest(width, 'width', 'number'), varTest(height, 'height', 'number')], 'OutputManager', 'drawChart')) return;
        if (this.#outputMap.has(key)) {
            const cd = this.#outputMap.get(key);
            this.#activeChartMap.set(key, { chartObject: this.#chartBuilder.plotData(cd.data, cd.type, div, width, height, cd.framework, cd.theme, cd.xAxisLabel, cd.yAxisLabel, cd.xAxisGrid, cd.yAxisGrid, cd.xAxisTick, cd.yAxisTick, cd.coordinateSystem) });
        }
        else printErrorMessage(`Missing Data.`, `key: ${key} - OutputManager -> drawChart`);
    }

    /** --- PUBLIC ---
     * Removes a chart from the data table.
     * @param {number} key module key
     * @returns true if successful false if not */
    removeChart = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', 'removeChart')) return false;
        if (this.#activeChartMap.has(key)) {
            try { this.#activeChartMap.get(key).chartObject.dispose(); }
            catch (error) { console.log(error); }
            finally { this.#activeChartMap.delete(key); }
            return true;
        } else return false;
    }

    /** --- PUBLIC ---
     * Checks to see if chart data exists for a specific module.
     * @param {number} key key into the hash table/
     * @returns true if there is a chart for this module, false if not. */
    popupHasAChart = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', 'popupHasAChart')) return false;
        if (this.#outputMap.has(key)) {
            if (this.#outputMap.get(key).outputType === 'chart') return true;
        }
        return false;
    }

    /** --- PUBLIC ---
     * Checks to see if a popup has an active chart to resize.
     * @param {number} key module key
     * @returns true or false */
    popupHasActiveChart = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', 'popupHasActiveChart')) return false;
        if (this.#activeChartMap.has(key)) return true;
        else return false;
    }

    /** --- PUBLIC ---
     * @param {number} key 
     * @param {number} width 
     * @param {number} height 
     * @returns true if successful, false if not */
    resizeChart = (key, width, height) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(width, 'width', 'number'), varTest(height, 'height', 'number')], 'Output Mangaer', 'resizeChart')) return false;
        if (this.popupHasActiveChart(key)) {
            if (this.#thisIsAnEchart(key)) this.#chartBuilder.resizeEchart(this.#activeChartMap.get(key).chartObject, width, height);
            else if (this.#thisIsAPlotlyChart(key)) {
                const chart = this.#outputMap.get(key);
                this.#chartBuilder.plotData(chart.data, chart.type, chart.div, width, height, chart.framework);
            }
        } else if (this.#outputMap.has(key)) {
            const outputObject = this.#outputMap.get(key);
            if (this.#thisIsAChart(outputObject)) {
                this.drawChart(key, outputObject.div, width, height, outputObject.framework);
            }
        } else return false;
        return true;
    }

    #thisIsAnEchart = key => this.#getActiveChartFramework(key) === 'echart';
    #thisIsAPlotlyChart = key => this.#getActiveChartFramework(key) === 'plotly';
    #thisIsAChart = outputObject => outputObject.outputType === 'chart';

    /**
     * Gets the correct framework string for the type of chart requested.
     * @param {string} type chart type 
     * @returns the chart type
     */
    #getFramework = type => {
        if (invalidVariables([varTest(type, 'type', 'string')], 'Output Manager', 'getFramework')) return undefined;
        switch (type) {
            case 'line':
            case 'bar':
            case 'scatter':
                return 'echart';
            case 'table':
                return 'plotly';
        }
    }

    /** --- PRIVATE ---
     * Retrieves the framework of the chart (ie. 'echarts')
     * @param {number} key id of the module that created the chart.
     * @returns (string) the framework */
    #getActiveChartFramework = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', '#getActiveChartFramework')) return undefined;
        if (this.#activeChartMap.has(key)) return this.#outputMap.get(key).framework;
        return undefined;
    }

    /** --- PUBLIC ---
     * Changes the theme of an echarts instance.
     * @param {number} key chart identifier
     * @param {string} theme the name of the theme  */
    changeEchartTheme = (key, theme) => {
        if (invalidVariables([varTest(theme, 'theme', 'string'), varTest(key, 'key', 'number')], 'OutputManager', '#changeChartTheme')) return false;
        if (this.#outputMap.has(key)) {
            if (this.#getActiveChartFramework(key) === 'echart') {
                this.#outputMap.get(key).theme = theme;
                return true;
            }
        } else return false;
    };

    /** --- PUBLIC ---
     * @param {number} key module key associated with chart
     * @param {number} width width of the chart div
     * @param {number} height height of the chart div */
    redrawEChart = (key, width, height) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(width, 'width', 'number'), varTest(height, 'height', 'number')], 'Output Manager', 'redrawEchart')) return;
        if (this.#activeChartMap.has(key)) {
            if (this.removeChart(key)) this.drawChart(key, this.#outputMap.get(key).div, width, height);
        }
    }

    /** --- PUBLIC --
     * Creates a new CSV file by calling the csvWriter instance.
     * @param {Object} data the datatable to create a chart from */
    generateCsvFile = data => {
        this.#csvWriter.createCsvFileFromData('comaCSVFile', data);
    };

    /** --- PUBLIC ---
     * Removes data from the outputMap
     * @param {Number} key key to the data table. */
    removeOutputData(key) {
        if (this.#outputMap.has(key)) this.#outputMap.delete(key);
    }



    /** --- PUBLIC ---
     * Adds to the data table. If the specified key is in the table, it will be overwritten.
     * @param {number} key key into the data table. It is also the key to the module associated with this data.
     * @param {object} val the value linked to the key. This is the "data".
     * @param {boolean} local true if the data was generated locally (creates metadata)
     */
    addData = (key, val, local) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(val, 'val', 'object'), varTest(local, 'local', 'boolean')], 'OutputManager', 'addData')) return false;
        if (this.#dataTable.has(key)) console.log(`Data Table already has key: ${key} in it. Will Overwrite. -- DataManager -> addData.`);
        this.#dataTable.set(key, { data: val });
        let metadata = undefined;
        if (local) metadata = val.data.setMetadata();
        return true;
    }

}