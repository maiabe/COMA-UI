/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { Publisher, Message } from '../communication/index.js';
import { ChartBuilder, CsvWriter } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { getNumDigits } from '../sharedVariables/formatValues.js';
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
        this.#activeChartMap = new Map(); // ... not needed?
        this.#csvWriter = new CsvWriter();
        this.#dataTable = new Map();
    };

    /** --- PUBLIC ---
     * Stores the chart information and data into the outputmap hash table.
     * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this chart.
     * @param {object} data the data that is used for the chart (traceData)
     * @param {object} div the html div to inject the chart
     * @param {string} type the type of chart. ie. 'bar', 'scatter'
     * @param {string} xAxisLabel (Optional)
     * @param {string} yAxisLabel (Optional)
     * @returns true if successful, false if failure  */
     storeChartData = (key, data, div, type, coordinateSystem) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object'), varTest(div, 'div', 'object'), varTest(type, 'type', 'string')], 'OutputManager', 'storeChartData')) return false;
         this.#outputMap.set(key, { data: data, type: type, div: div, outputType: 'chart', framework: this.#getFramework(type), theme: 'dark', coordinateSystem: coordinateSystem });
         console.log(this.#outputMap);
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
            // if activeChartMap contains the key, updateChart
            var activeChart = this.#activeChartMap.get(key);
            if (this.popupHasActiveChart(key)) {
                // get the div of chartObject
                var activeChartDiv = activeChart.chartObject.getDom();
                
                // set activeChartMap with updated chartObject
                this.#activeChartMap.set(key, { chartObject: this.#chartBuilder.updatePlotData(cd.data, cd.type, activeChartDiv, width, height, cd.framework, cd.coordinateSystem) });
            }
            // otherwise set the key to activeChartMap
            else {
                console.log(cd.data);
                this.#activeChartMap.set(key, { chartObject: this.#chartBuilder.plotData(cd.data, cd.type, div, width, height, cd.framework, cd.theme, cd.coordinateSystem) });
            }
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
                return 'tabulator';
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


    // ----------------------------------------- Table Data Preparation -----------------------------------------

    /** Prepares the tableData needed to create Tabulator data for columns and data organization.
     * @param {sourceData object} sourceData of the sourceModule linked to the current table module
     * @returns {tableData object} tableData is array of objects that contains information about each field of the sourceData and the values for each field 
     *                              (e.g. tableData = [{ columns: [{ title: 'Date', field: 'date', hozAlign: 'center' }, ...],
     *                                                   tableData: [{ mjd: '5986.480892', dec_obj: '27.803', ... }, ...] }],
     * */
    getTabulatorData(datasetType, columnsToRender, sourceData) {
        console.log(columnsToRender);
        console.log(sourceData);

        var resultColumns = [];
        var tableColumns = this.#buildTabulatorColumns(columnsToRender, resultColumns);
        var resultData = [];
        //var tableSourceData = this.#buildTabulatorSourceData(sourceData, columnsToRender, resultData);
        var tableSourceData = [];
        sourceData.forEach(dataRow => {
            var newDataRow = this.#buildTabulatorSourceData(columnsToRender, dataRow, {});
            tableSourceData.push(newDataRow);
        });

        var tabulatorData = { columns: tableColumns, tabledata: tableSourceData };
        console.log(tabulatorData);
        return tabulatorData;
    }

    #buildTabulatorColumns(columnsToRender, tableColumns) {
        columnsToRender.forEach(column => {
            if (column.hasOwnProperty('data')) {
                var nestedColumnsToRender = column.data;
                var nestedTableColumns = [];
                tableColumns.push({ title: column.fieldName, columns: nestedTableColumns, headerHozAlign: 'left' });
                this.#buildTabulatorColumns(nestedColumnsToRender, nestedTableColumns);
            } else {
                tableColumns.push({ title: column.fieldName, field: column.fieldName, hozAlign: 'right' });
            }
        });
        return tableColumns;
    }

    #buildTabulatorSourceData(columnsToRender, dataRow, newDataRow) {
        columnsToRender.forEach(column => {
            var value = dataRow[column.fieldName];
            if (column.hasOwnProperty('data')) {
                // get the value (obj)
                var nestedColumnsToRender = column.data;
                var nestedDataRow = dataRow[column.fieldName];
                var nestedNewDataRow = newDataRow;
                // get the rest of columns to render
                this.#buildTabulatorSourceData(nestedColumnsToRender, nestedDataRow, nestedNewDataRow);
            }
            else {
                if (column.dataType === 'value') {
                    if (value === null) {
                        newDataRow[column.fieldName] = 'Null';
                    }
                    else {
                        var numDigits = getNumDigits(column.fieldName);
                        newDataRow[column.fieldName] = Number(value).toFixed(numDigits);
                    }
                }
                else {
                    newDataRow[column.fieldName] = value;
                }
            }
        });
        return newDataRow;
    }


    // ----------------------------------------- Chart Data Preparation -----------------------------------------
    /*********************************************** Mai 7/13/23 *******************************************************/
    /** --- PUBLIC ---
     * Prepares the data for echarts and stores it in the traceData to be passed to chartBuilder
     * @param {number} moduleKey key of the module is also a key to the outputMap table. 
     * @param {object} traceData data from the chart's inspector card. (e.g { fieldName: "date", labelName: "Date", gridLines: true, ticks: false  })
     * @param {object} sourceData unfiltered source data from the previous module (list of key-value objects)
     * */
    //// * NOTE: for now refer all yaxis to the first xaxis element
    // stores source data of the field and source data type of the field to traceData
    prepChartData(moduleKey, datasetType, chartTitle, traceData, sourceData) {
        if (invalidVariables([varTest(moduleKey, 'moduleKey', 'number'), varTest(sourceData, 'sourceData', 'object')], 'OutputManager', 'prepEchartData')) return;
        var chartData = traceData;
        console.log(traceData);

        var axisNames = Object.keys(traceData);
        axisNames.forEach(axis => {
            chartData[axis].forEach(trace => {
                // Store sourceData type of the field to determine whether the field is categorical or value type
                trace['dataType'] = trace.dataType;

                // Prepare sourceData of the field
                /*var digits = getNumDigits(trace.fieldName);
                var result = sourceData.map(sd => {
                    var value = Number(sd[trace.fieldName]);
                    if (Number.isNaN(value)) {
                        value = sd[trace.fieldName];
                    }
                    else {
                        value = value.toFixed(digits);
                    }
                    return value;
                });*/
                var result = this.#buildEChartsSourceData(datasetType, axis, trace, sourceData);
                console.log(result);
                trace['data'] = result;

                // Prepare errorData if selected
                /*if (trace.error && trace.error !== 'none') {
                    var digits = getNumDigits(trace.error);
                    trace['errorData'] = sourceData.map((sd, i) => {
                        // round to the default number of digits if no default set it to 3 digits
                        var lowerVal = Number(sd[trace.fieldName]) - Number(sd[trace.error]);
                        var higherVal = Number(sd[trace.fieldName]) + Number(sd[trace.error]);
                        return [i, lowerVal.toFixed(digits), higherVal.toFixed(digits)]
                    });
                }*/

                // Store y-axis inverse value to be set to true if fieldName is any kind of a magnitude field
                if (trace.fieldName.includes('mag') && trace.dataType === "value") {
                    trace['inverse'] = true;
                } else {
                    trace['inverse'] = false;
                }
            });
        });
        chartData['chartTitle'] = chartTitle;
        console.log(chartData);

        return chartData;
        // error check
        /*var echartData = { 'series': [] };
        var chartAxis = Object.keys(traceData);
        chartAxis.forEach(axis => {
            var trace = traceData[axis];
            echartData[axis] = [];
            switch (axis) {
                case "xAxis":
                    trace.forEach(t => {
                        var result = sourceData.map(data => {
                            return data[t.fieldName];
                        });

                        var td = { type: "category", data: result };
                        echartData[axis].push(td);
                    }); 
                    break;
                case "yAxis":
                    trace.forEach(t => {
                        echartData[axis].push({ type: "value" });

                        var result = sourceData.map(data => {
                            return data[t.fieldName];
                        });
                        var seriesData = { type: chartType, data: result, xAxisIndex: 0 };
                        echartData['series'].push(seriesData);
                    });
                    break;
                case "error":
                    // TODO: add error field
                    break;
                default:
                    return false;
            }
        });
        console.log(echartData);*/
         
        //var chartData = { x: [], y: [], e: []};

        // save to outputMap hash table
    }

    #buildEChartsSourceData(datasetType, axis, trace, sourceData) {
        console.log(trace);

        var result = sourceData.map((sd, i) => {
            var value = sd[trace.fieldName];
            if (trace.fieldGroup !== 'undefined') {
                var obj = sd[trace.fieldGroup];
                value = obj[trace.fieldName];
            }
            if (trace.dataType === 'value') {
                var digits = getNumDigits(trace.fieldName);
                value = Number(value.toFixed(digits));
            }
            if (axis === 'yAxis') {
                let digits = getNumDigits(trace.xFieldName.name);

                // corresponding xFieldName
                var xvalue = sd[trace.xFieldName.name].toFixed(digits);
                xvalue = Number(xvalue);
                value = [xvalue, value];

                /*if (trace.error && trace.error !== 'none') {
                    let errorDigits = getNumDigits(trace.error);
                    trace['errorData'] = sourceData.map((sd, i) => {
                        // round to the default number of digits if no default set it to 3 digits
                        var lowerVal = value[1] - Number(sd[trace.fieldGroup][trace.error]);
                        var higherVal = value[1] + Number(sd[trace.fieldGroup][trace.error]);
                        console.log(sd[trace.fieldGroup][trace.error]);
                        console.log(value);
                        return [i, lowerVal.toFixed(errorDigits), higherVal.toFixed(errorDigits)]
                    });
                }*/
            }
            return value;
        });
        console.log(result);
        return result;
    }

}