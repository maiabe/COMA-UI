import {Publisher, Message} from '../classes/communication/communication.js';
import { ChartBuilder } from '../classes/dataComponents/dataProcessors.js';
import { invalidVariables, varTest, printErrorMessage } from '../scripts/errorHandlers.js';
export class OutputManager {
    publisher;
    #outputMap;
    #chartBuilder;
    constructor() {
        this.publisher = new Publisher();
        this.#outputMap = new Map();
        this.#chartBuilder = new ChartBuilder();
    };

    /**
     * Stores the chart information and data into the outputmap hash table.
     * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this chart.
     * @param {object} data the data that is used for the chart
     * @param {string} type the type of chart. ie. 'bar', 'scatter'
     * @returns true if successful, false if failure
     */
    storeChartData = (key, data, type) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object'), varTest(type, 'type', 'string')], 'OutputManager', 'storeChartData')) return false;
        if (!this.#outputMap.has(key)) {
            this.#outputMap.set(key, { data: data, type: type, outputType: 'plotly' });
            return true;
        } else console.log(`ERROR: chart data already exists for key ${key}. -- Output Manager -> storeChartData`);
        return false;
    }

    /**
     * Generates data for a chart and calls the chart builder.
     * @param {number} key the key to the chart data.
     * @param {HTML element} div the html element that we will place the chart
     * @param {number} width width of the div in pixels. (number only)
     * @param {number} height height of the div in pixels. (number only)
     */
    drawChart = (key, div, width, height) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(div, 'div', 'object'), varTest(width, 'width', 'number'), varTest(height, 'height', 'number')], 'OutputManager', 'drawChart')) return;
        if (this.#outputMap.has(key)) this.#chartBuilder.plotData(this.#outputMap.get(key).data, this.#outputMap.get(key).type, div, width, height);
        else console.log(`ERROR: Cannot drawChart, missing data for key: ${key}. -- OutputManager -> drawChart`);
    }

    /**
     * Checks to see if chart data exists for a specific module.
     * @param {number} key key into the hash table/
     * @returns true if there is a chart for this module, false if not.
     */
    popupHasAChart = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', 'popupHasAChart')) return false;
        if (this.#outputMap.has(key)) {
            if (this.#outputMap.get(key).outputType === 'plotly') return true;
        }
        return false;
    }

}