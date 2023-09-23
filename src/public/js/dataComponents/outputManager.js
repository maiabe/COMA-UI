/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { Publisher, Message } from '../communication/index.js';
import { ChartBuilder, CsvWriter, OrbitBuilder } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
//import { getNumDigits } from '../sharedVariables/formatValues.js';
import { getNumDigits, orbitColors } from '../sharedVariables/index.js';

export class OutputManager {
    publisher;
    #outputMap;         // When a chart is created, parameters are stored here. If popup is closed, it can be recreatd from this data.
    #chartBuilder;
    #activeChartMap;
    #orbitBuilder;
    #activeOrbitMap;
    #csvWriter;
    #dataTable;

    constructor() {
        this.publisher = new Publisher();
        this.#outputMap = new Map();
        this.#chartBuilder = new ChartBuilder();
        this.#activeChartMap = new Map();
        this.#activeOrbitMap = new Map();
        this.#orbitBuilder = new OrbitBuilder();
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
    // stores source data of the field and source data type of the field to traceData
    prepChartData(moduleKey, datasetType, chartTitle, traceData, sourceData) {
        if (invalidVariables([varTest(moduleKey, 'moduleKey', 'number'), varTest(sourceData, 'sourceData', 'object')], 'OutputManager', 'prepEchartData')) return;
        var chartData = traceData;
        console.log(traceData);

        // Build axis echartData
        var axisNames = ['xAxis', 'yAxis'];
        axisNames.forEach(axis => {
            chartData[axis].forEach(trace => {
                // Store sourceData type of the field to determine whether the field is categorical or value type
                trace['dataType'] = trace.dataType;

                var result = this.#buildEChartsAxisSourceData(trace, trace.fieldName, sourceData);
                trace['data'] = result;
            });
        });

        // Build series echartData
        chartData['series'].forEach(trace => {
            trace['dataType'] = trace.dataType;

            var xi = trace.xAxisIndex;
            var yi = trace.yAxisIndex;
            var result = this.#buildEChartsSeriesSourceData(chartData['xAxis'][xi].data, chartData['yAxis'][yi].data);
            trace['data'] = result;

            if (trace.error && trace.error !== 'none') {
                var errorData = this.#buildEChartsErrorSourceData(trace, trace.error, sourceData, chartData['xAxis'][xi].data, chartData['yAxis'][yi].data);
                trace['errorData'] = errorData;
            }
        });

        chartData['chartTitle'] = chartTitle;
        console.log(chartData);

        return chartData;
    }

    #buildEChartsAxisSourceData(trace, fieldName, sourceData) {
        console.log(fieldName);
        console.log(trace);

        var result = sourceData.map((sd, i) => {
            var value = sd[fieldName];
            if (trace.fieldGroup !== 'undefined') {
                var obj = sd[trace.fieldGroup];
                value = obj[fieldName]; // value = value[trace.fieldGroup]
            }
            /*console.log(value);*/
            if (trace.dataType === 'value') {
                var digits = getNumDigits(fieldName);
                value = Number(Number(value).toFixed(digits));
            }

            return value;
        });

        return result;
    }

    #buildEChartsSeriesSourceData(xData, yData) {
        var result = undefined;
        if (xData && yData) {
            result = xData.map((xd, i) => {
                return [xd, yData[i]];
            });
        }
        return result;
    }

    #buildEChartsErrorSourceData(trace, errorName, sourceData, xData, yData) {
        var result = sourceData.map((sd, i) => {
            var value = sd[errorName];
            if (trace.fieldGroup !== 'undefined') {
                value = sd[trace.fieldGroup];
            }
            var xvalue = xData[i];
            var yvalue = yData[i];

            var errorDigits = getNumDigits(trace.error);
            // round to the default number of digits if no default set it to 3 digits
            var lowerVal = yvalue - Number(value[trace.error]);
            lowerVal = lowerVal.toFixed(errorDigits);
            var higherVal = yvalue + Number(value[trace.error]);
            higherVal = higherVal.toFixed(errorDigits);

            return [Number(xvalue), Number(lowerVal), Number(higherVal)];
            
        });
        return result;
    }


    // ----------------------------------------- Orbit Data Preparation -----------------------------------------
    /** --- PUBLIC ---
    * Stores the orbit information and data into the outputmap hash table.
    * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this orbit chart.
    * @param {object} data the data that is used for the chart (traceData)
    * @param {object} div the html div to inject the chart
    * @returns true if successful, false if failure  */
    storeOrbitData = (key, data, div) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object'), varTest(div, 'div', 'object')], 'OutputManager', 'storeOrbitData')) return false;
        this.#outputMap.set(key, { data: data, div: div, outputType: 'orbit' });
        console.log(this.#outputMap);
        return true;
    }

    // drawOrbit
    drawOrbit = (key, div, width, height) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(div, 'div', 'object'), varTest(width, 'width', 'number'), varTest(height, 'height', 'number')], 'OutputManager', 'drawOrbit')) return;
        if (this.#outputMap.has(key)) {
            const od = this.#outputMap.get(key);
            // if activeChartMap contains the key, updateChart
            var activeOrbit = this.#activeOrbitMap.get(key);
            if (activeOrbit) {
                // get the div of orbitObject
                this.#activeOrbitMap.set(key, { orbitObject: this.#orbitBuilder.updatePlotData(activeOrbit.orbitObject, od.data, od.div) });

            }
            // otherwise set the key to activeChartMap
            else {
                // orbitObject is a three renderer
                this.#activeOrbitMap.set(key, { orbitObject: this.#orbitBuilder.plotData(od.data, div, width, height) });
            }
        }
        else printErrorMessage(`Missing Data.`, `key: ${key} - OutputManager -> drawChart`);
    }

    /** Get objects vectors and ephemerides vectors
     * 
     * 
     * */
    prepOrbitData(objectsToRender, objectsData, orbitsToRender) {
        var orbitData = {};
        console.log(objectsData);
        // Get object data
        var objectVectors = this.#getObjectsData(objectsToRender, objectsData);
        orbitData['objects'] = objectVectors;

        // Get orbit data
        console.log(orbitsToRender);
        var orbitVectors = this.#getOrbitsData(orbitsToRender);
        orbitData['orbits'] = orbitVectors;

        return orbitData;
        //console.log(orbitData);
    }

    #getObjectsData(objectsToRender, objectsData) {
        var result = [];
        console.log(objectsData);
        objectsToRender.forEach(object => {
            var objectVectors = { name: object, color: '#5df941' };
            var xKey = Object.keys(objectsData[0]).filter(k => k.toLowerCase().includes('x[au]'));
            var yKey = Object.keys(objectsData[0]).filter(k => k.toLowerCase().includes('y[au]'));
            var zKey = Object.keys(objectsData[0]).filter(k => k.toLowerCase().includes('z[au]'));
            xKey = xKey.length > 0 ? xKey[0] : 'sunvect_x';
            yKey = yKey.length > 0 ? yKey[0] : 'sunvect_y';
            zKey = zKey.length > 0 ? zKey[0] : 'sunvect_z';

            var vectors = objectsData.map(obj => {
                let xVal = obj[`${xKey}`] ? Number(obj[`${xKey}`]) : obj['Photometry'][`${xKey}`];
                let yVal = obj[`${yKey}`] ? Number(obj[`${yKey}`]) : obj['Photometry'][`${yKey}`];
                let zVal = obj[`${zKey}`] ? Number(obj[`${zKey}`]) : obj['Photometry'][`${zKey}`];
                //return { x: Number(obj[`${xKey}`]), y: Number(obj[`${yKey}`]), z: Number(obj[`${zKey}`]) };
                return { x: xVal, y: yVal, z: zVal };
            });
            objectVectors.vectors = vectors;
            result.push(objectVectors);
        });

        return result;
    }

    #getOrbitsData(orbitsToRender) {
        const planetOrbits = JSON.parse(localStorage.getItem('Planet Orbits'));
        console.log(planetOrbits);
        var result = [];
        orbitsToRender.forEach(orbit => {
            var color = orbitColors[orbit] ? orbitColors[orbit] : "#20A4F3";
            var orbitVectors = { name: orbit, color: color };
            var xKey = Object.keys(planetOrbits[0]).filter(k => k.toLowerCase().includes('_x') && k.includes(orbit));
            var yKey = Object.keys(planetOrbits[0]).filter(k => k.toLowerCase().includes('_y') && k.includes(orbit));
            var zKey = Object.keys(planetOrbits[0]).filter(k => k.toLowerCase().includes('_z') && k.includes(orbit));

            var vectors = planetOrbits.map(ed => {
                return { x: Number(ed[`${xKey[0]}`]), y: Number(ed[`${yKey[0]}`]), z: Number(ed[`${zKey[0]}`]) }
            });
            orbitVectors['vectors'] = vectors;
            result.push(orbitVectors);
        });
        return result;
    }

    popupHasOrbit = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'OutputManager', 'popupHasOrbit')) return false;
        if (this.#outputMap.has(key)) {
            if (this.#outputMap.get(key).outputType === 'orbit') return true;
        }
        return false;
    }

    resizeOrbit(key, width, height) {
        var activeOrbit = this.#activeOrbitMap.get(key);
        if (activeOrbit) {
            this.#orbitBuilder.resizeOrbitChart(activeOrbit, width, height);
        }
    }

}