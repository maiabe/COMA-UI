/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
export class ChartBuilder {

    #optionGenerationMap;
    #planetaryRadii;
    #dataTable;
    #HF;

    constructor() {
        this.#optionGenerationMap = new Map();
        this.#optionGenerationMap.set('polar', this.#generatePolarOptions.bind(this));
        this.#optionGenerationMap.set('cartesian2d', this.#generate2dCartesianOptions.bind(this));

        this.#planetaryRadii = new Map();
        this.#planetaryRadii.set('mercury', 0.38);
        this.#planetaryRadii.set('venus', 0.72);
        this.#planetaryRadii.set('earth', 1);
        this.#planetaryRadii.set('mars', 1.52);
        this.#planetaryRadii.set('jupiter', 5.33);
        this.#planetaryRadii.set('saturn', 9.54);
        this.#planetaryRadii.set('uranus', 19.22);
        this.#planetaryRadii.set('neptune', 30.06);

        this.#dataTable = new Map();

        this.#HF = new HTMLFactory();
    };

    /** --- PUBLIC ---
     * There are a lot of options passed to the function from the HUB.
     * @param {{e: any[], x: any[]}, y: any[]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
     * @param {Number} width width of the chart
     * @param {Number} height height of the chart
     * @param {string} framework echart makes all charts except table. plotly makes the table 
     * @param {string} theme echart color theme 
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns chart object  */
    plotData = (data, type, pdiv, width, height, framework, theme, coordinateSystem) => {
        switch (framework) {
            case 'tabulator':
                return this.#drawTabulatorTable(data, type, pdiv, width, height);
            case 'plotly':
                return this.#drawPlotlyChart(data, type, pdiv, width, height);
            case 'echart':
                return this.#drawEChartChart(data, type, pdiv, width, height, theme, coordinateSystem);
        }
    }

    /** --- PRIVATE ---
     * Plots data as an echart with options
     * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
     * @param {Number} width width of the chart
     * @param {Number} height height of the chart
     * @param {string} framework echart makes all charts
     * @param {string} theme echart color theme 
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns echart object
     */
    #drawEChartChart = (data, type, pdiv, width, height, theme, coordinateSystem) => {
        const myChart = echarts.init(pdiv, theme);
        const option = this.#optionGenerationMap.get(coordinateSystem)(data, type, coordinateSystem);
        option && myChart.setOption(option);
        //console.log(option);
        this.resizeEchart(myChart, width, height);
        return myChart;
    };

    /** --- PRIVATE ---
     * Create the option set for an echart polar chart
     * There are many more possible options that can and should be included in the final product
     * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns object wil all settings
     */
    #generatePolarOptions(data, type, coordinateSystem) {
        const options = {
            title: {
                text: 'Polar'
            },
            legend: {
                data: [type]
            },
            polar: {},
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            angleAxis: {
                type: 'value',
                startAngle: 0,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            radiusAxis: {
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            series: [
                {
                    coordinateSystem: coordinateSystem,
                    name: 'Name',
                    type: type,
                    data: this.#mergeXYDataForPolarPlot(data)
                }
            ]
        }

        // DRAW ORBITS OF THE PLANETS TAHT ARE INSIDE THIS OBJECTS ORBIT

        // Find the maximum radius value
        const maxR = Math.max(...data.data.x);

        // Draw planetary orbits that have orbit radii smaller than the max
        this.#planetaryRadii.forEach((value, key) => {
            if (Number(value) < Number(maxR)) options.series.push(this.#getPlanet(key));
        });
        return options;
    }

    /** --- PRIVATE ---
     * Polar charts are created using data that is in the form of [x, y]
     * @param {{e: any[], x: any[]}, y: any[]} data Arrays of the data for the x axis, y axis, and error trace
     * @returns the new array of merged data */
    #mergeXYDataForPolarPlot(data) {
        const mergedData = [];
        if (data.data.x.length === data.data.y[0].length) {
            for (let i = 0; i < data.data.x.length; i++) mergedData.push([data.data.x[i], data.data.y[0][i]]);
        } else alert('Invalid Data For Polar Plot');
        return mergedData;
    }

    /** --- PRIVATE ---
     * Create the option set for an echart cartesian 2d
     * There are many more possible options that can and should be included in the final product
     * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns object wil all settings
     */
    #generate2dCartesianOptions(data, type, coordinateSystem) {
        /*console.log(data);
        console.log(type);
        console.log(coordinateSystem);*/
        console.log(data);

        var echartData = {
            title: {
                text: data.chartTitle,
                left: 'center',
                top: '5%',
            },
            grid: {
                height: '65%',
                top: '15%',
                bottom: '18%',
                //bottom: '30%'
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {  },
                },
                top: '3%',
                right: '5%',
                z: 2,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            dataZoom: {
                type: 'slider',
                bottom: '3%',
                height: '4%', 
            },
            series: []
        };
        var chartAxis = Object.keys(data);
        chartAxis.forEach(axis => {
            var trace = data[axis];
            echartData[axis] = [];
            switch (axis) {
                case "xAxis":
                    trace.forEach(t => {
                        echartData[axis].push({
                            type: t.dataType,
                            name: t.labelName,
                            nameLocation: "middle",
                            nameTextStyle: {
                                fontWeight: "bold",
                                fontSize: 14,
                                lineHeight: 35,
                            },
                            position: t.position,
                            offset: t.offset,
                            data: t.data,
                            scale: 'true',
                            inverse: t.inverse,
                            minorTick: {
                                show: t.ticks
                            },
                            splitLine: {
                                show: (t.dataType === 'value') ? t.majorGridLines : false,
                                lineStyle: { type: 'solid' },
                            },
                            minorSplitLine: {
                                show: t.minorGridLines,
                                lineStyle: { type: 'dashed', opacity: 0.3, }
                            }
                        });
                    });
                    if (trace.length > 1) {
                        echartData['grid'].top = '20%';
                    }
                    break;
                case "yAxis":
                    trace.forEach(t => {
                        echartData[axis].push({
                            type: t.dataType,
                            name: t.labelName,
                            nameLocation: "middle",
                            nameTextStyle: {
                                fontWeight: "bold",
                                fontSize: 14,
                                verticalAlign: "bottom",
                                lineHeight: 60
                            },
                            position: t.position,
                            offset: t.offset,
                            scale: "true",
                            inverse: t.inverse,
                            minorTick: {
                                show: t.ticks
                            },
                            splitLine: {
                                show: (t.dataType === 'value') ? t.majorGridLines : false,
                                lineStyle: { type: 'solid' },
                            },
                            minorSplitLine: {
                                show: t.minorGridLines,
                                lineStyle: { type: 'dashed', opacity: 0.3, }
                            }
                        });
                    });
                    break;
                case "series":
                    trace.forEach(t => {
                        console.log(t);
                        echartData[axis].push({
                            type: type,
                            name: t.labelName,
                            data: t.data,
                            xAxisIndex: t.xAxisIndex,
                            yAxisIndex: t.yAxisIndex,
                            symbol: t.symbol,
                            symbolSize: t.symbolSize,
                            itemStyle: {
                                /*color: 'red',*/
                            }
                        });
                        // add error if any
                        if (t.errorData) {
                            var errorData =
                            {
                                type: 'custom',
                                name: 'error',
                                itemStyle: {
                                    borderWidth: 1.5
                                },
                                renderItem: function (params, api) {
                                    var xValue = api.value(0);
                                    var highPoint = api.coord([xValue, api.value(1)]);
                                    var lowPoint = api.coord([xValue, api.value(2)]);
                                    var halfWidth = api.size([1, 0])[0] * 0.3;
                                    var style = api.style({
                                        stroke: api.visual('color'),
                                        fill: undefined
                                    });
                                    return {
                                        type: 'group',
                                        children: [
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: highPoint[0] - halfWidth,
                                                    y1: highPoint[1],
                                                    x2: highPoint[0] + halfWidth,
                                                    y2: highPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            },
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: highPoint[0],
                                                    y1: highPoint[1],
                                                    x2: lowPoint[0],
                                                    y2: lowPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            },
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: lowPoint[0] - halfWidth,
                                                    y1: lowPoint[1],
                                                    x2: lowPoint[0] + halfWidth,
                                                    y2: lowPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            }
                                        ]
                                    };
                                },
                                encode: {
                                    x: 0,
                                    y: [1, 2]
                                },
                                data: t.errorData,
                                z: 100
                            };
                            echartData['series'].push(errorData);
                        }
                    });
                    break;
                        /*var seriesData = { type: type, name: t.labelName, data: t.data, xAxisIndex: 0 };
                        echartData['series'].push(seriesData);
                        // if there are any errorData, include error bars
                        if (t.errorData) {
                            var errorData =
                            {
                                type: 'custom',
                                name: 'error',
                                *//*itemStyle: {
                                    borderWidth: 1.5
                                },*//*
                                renderItem: function (params, api) {
                                    var xValue = api.value(0);
                                    var highPoint = api.coord([xValue, api.value(1)]);
                                    var lowPoint = api.coord([xValue, api.value(2)]);
                                    var halfWidth = api.size([1, 0])[0] * 0.3;
                                    *//*var style = api.style({
                                        stroke: api.visual('color'),
                                        fill: undefined
                                    });*//*
                                    return {
                                        type: 'group',
                                        children: [
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: highPoint[0] - halfWidth,
                                                    y1: highPoint[1],
                                                    x2: highPoint[0] + halfWidth,
                                                    y2: highPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            },
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: highPoint[0],
                                                    y1: highPoint[1],
                                                    x2: lowPoint[0],
                                                    y2: lowPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            },
                                            {
                                                type: 'line',
                                                transition: ['shape'],
                                                shape: {
                                                    x1: lowPoint[0] - halfWidth,
                                                    y1: lowPoint[1],
                                                    x2: lowPoint[0] + halfWidth,
                                                    y2: lowPoint[1]
                                                },
                                                style: {
                                                    stroke: '#5470c6',
                                                    lineWidth: 1,
                                                }
                                            }
                                        ]
                                    };
                                },
                                encode: {
                                    x: 0,
                                    y: [1, 2]
                                },
                                data: t.errorData,
                                z: 100
                            };
                            echartData['series'].push(errorData);
                        }
                    });
                    break;*/
                default:
                    return false;
            }
        });

        console.log(echartData);

        return echartData;

        /*return {
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                scale: 'true',
                data: data.data.x,
                name: xAxisLabel,
                nameLocation: 'middle',
                nameGap: 34,
                minorTick: {
                    show: xAxisTick
                },
                minorSplitLine: {
                    show: xAxisGrid
                }
            },
            yAxis: {
                type: 'value',
                scale: true,
                name: yAxisLabel,
                nameLocation: 'middle',
                nameGap: 34,
                minorTick: {
                    show: yAxisTick
                },
                minorSplitLine: {
                    show: yAxisGrid
                }
            },
            dataZoom: [
                {
                    type: 'slider',
                }
            ],
            series: this.#createSeries(data, type, coordinateSystem)
        }*/
    }

    /** --- PRIVATE ---
     * Creats an array of series to chart. These are the y axis values
     * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns array of chart series
     */
    #createSeries(data, type, coordinateSystem) {
        const seriesArray = [];
        // The Y axis data is an array of arrays of data
        data.yAxis.forEach(dataList => {
            seriesArray.push({
                data: dataList,
                type: type,
                coordinateSystem: coordinateSystem
            });
        });

        // Create the error series. This has error bars that are created manually
        // This code came from the Echarts site with slight modifications
        /*data.error.forEach((dataList, index) => {
            const errorData = [];
            for (let i = 0; i < dataList.length; i++) {
                errorData.push([i,
                    Number(data.data.y[index][i]) - Number(dataList[i]),
                    Number(data.data.y[index][i]) + Number(dataList[i])
                ]);
            }
            if (errorData.length > 0) {
                seriesArray.push({
                    type: 'custom',
                    name: 'error',
                    itemStyle: {
                        borderWidth: 1.5
                    },
                    renderItem: function (params, api) {
                        var xValue = api.value(0);
                        var highPoint = api.coord([xValue, api.value(1)]);
                        var lowPoint = api.coord([xValue, api.value(2)]);
                        var halfWidth = api.size([1, 0])[0] * 0.3;
                        var style = api.style({
                            stroke: api.visual('color'),
                            fill: undefined
                        });
                        return {
                            type: 'group',
                            children: [
                                {
                                    type: 'line',
                                    transition: ['shape'],
                                    shape: {
                                        x1: highPoint[0] - halfWidth,
                                        y1: highPoint[1],
                                        x2: highPoint[0] + halfWidth,
                                        y2: highPoint[1]
                                    },
                                    style: style
                                },
                                {
                                    type: 'line',
                                    transition: ['shape'],
                                    shape: {
                                        x1: highPoint[0],
                                        y1: highPoint[1],
                                        x2: lowPoint[0],
                                        y2: lowPoint[1]
                                    },
                                    style: style
                                },
                                {
                                    type: 'line',
                                    transition: ['shape'],
                                    shape: {
                                        x1: lowPoint[0] - halfWidth,
                                        y1: lowPoint[1],
                                        x2: lowPoint[0] + halfWidth,
                                        y2: lowPoint[1]
                                    },
                                    style: style
                                }
                            ]
                        };
                    },
                    encode: {
                        x: 0,
                        y: [1, 2]
                    },
                    data: errorData,
                    z: 100
                })
            }
        });*/
        return seriesArray;
    }

    /** --- PRIVATE ---
     * Gets the details for the planet that will be charted in the polar graph
     * @param {string} planet the name of the planet is a key to the radius 
     * @returns polar chart series 
     * */
    #getPlanet(planet) {
        const r = this.#planetaryRadii.get(planet);
        const data = [];
        for (let i = 0; i < 360; i += 0.1) data.push([r, i]);
        return {
            data: data,
            type: 'line',
            symbol: 'none',
            coordinateSystem: 'polar'
        }
    }

    /**
     * Resizes an Echart
     * @param {Echart Object} chartObject 
     * @param {number} width 
     * @param {height} height 
     */
    resizeEchart = (chartObject, width, height) => {
        chartObject.resize({ width: width, height: height });
    }

    /** --- PRIVATE ---
    * Creates a plotly chart. Currently this is only used to create tables.
    * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
    * @param {string} type chart type, ie 'bar'
    * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
    * @param {Number} width width of the chart
    * @param {Number} height height of the chart
    * @returns Plotly chart object
    */
    #drawPlotlyChart = (data, type, pdiv, width, height) => {
        data = this.#getPlotlyType(data, type);
        let result = undefined;
        switch (type) {
            case 'line':
                result = Plotly.newPlot(pdiv, [data], {
                    margin: {
                        t: 40,
                    },
                    width: width,
                    height: height,
                    xaxis: {
                        title: {
                            text: 'x Axis',
                            font: {
                                family: 'Arial, monospace',
                                size: 18,
                                color: '#7f7f7f'
                            }
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'y Axis',
                            font: {
                                family: 'Arial, monospace',
                                size: 18,
                                color: '#7f7f7f'
                            }
                        }
                    }
                });
                break;
            case 'table':
                // Calculate the total width of the table
                var columnWidths = [];
                for (var i = 0; i < data[0].cells.values.length; i++) {
                    var maxWidth = 0;
                    for (var j = 0; j < data[0].cells.values[i].length; j++) {
                        var cellWidth = data[0].cells.values[i][j].length * 10; // set width based on number of characters
                        if (cellWidth > maxWidth) {
                            console.log(data[0].cells.values[i][j].length);
                            maxWidth = cellWidth;
                        }
                    }
                    columnWidths.push(maxWidth);
                }
                var totalWidth = columnWidths.reduce(function (a, b) { return a + b; }, 0);

                var layout = {
                    title: 'Query Result',
                    margin: {
                        t: 30,
                        l: 30,
                        r: 30,
                        b: 30
                    },
                    autosize: true,
                    height: 500,
                };
                var config = {
                    modeBarButtonsToAdd: [
                        {
                            name: 'zoom-in',
                            icon: Plotly.Icons.zoom_plus,
                            click: function (gd) {
                                var update = {
                                    'width': layout.width * 1.1,
                                    'height': layout.height * 1.1
                                };
                                Plotly.update(gd, {}, update);
                            }
                        },
                        {
                            name: 'zoom-out',
                            icon: Plotly.Icons.zoom_minus,
                            click: function (gd) {
                                var update = {
                                    'width': layout.width * 0.9, 
                                    'height': layout.height * 0.9, 
                                };
                                Plotly.update(gd, {}, update);
                            }
                        },
                        {
                            name: 'Auto Scale',
                            icon: Plotly.Icons.zoombox,
                            click: function (gd) {
                                Plotly.relayout(gd, {'xaxis.autorange': true, 'yaxis.autorange': true });
                            }
                        }
                    ],
                    displaylogo: false,
                    autosize: true,
                    columnwidth: "auto"
                };

                result = Plotly.newPlot(pdiv, data, layout, config);
                console.log(result);
                break;
        }
        return result;
    }

    /** --- PRIVATE ---
     * This returns a converted version of the type to the correct string.
     * This is currently useless because the types are correctly store in the object but may be usesul in the 
     * future when new charts arise.
     * @param {string} type 
     * @returns the chart type 
     */
    #getEchartType = type => {
        return type;
        // switch (type) {
        //     case 'line':
        //         return 'line';
        //     case 'bar':
        //         return 'bar';
        //     case 'scatter':
        //         return 'scatter';
        // }
    }

    /** --- PRIVATE ---
     * Plotly charts have more complex names than echarts and this function attaches correct options for the chart type
     * @param {Data Object} data 
     * @param {string} type 
     * @returns plotly chart data
     */
    #getPlotlyType = (data, type) => {
        switch (type) {
            case 'bar':
                data.type = 'bar';
                break;
            case 'scatter':
                data.type = 'scatter';
                data.mode = 'markers';
                break;
            case 'line':
                data.type = 'scatter';
                data.mode = 'lines';
                break;
            case 'table':
                data[0].type = 'table';
                data[0].header = this.#getPlotlyTableHeaderObject(data[0]);
                data[0].cells = this.#getPlotlyTableCellsObject(data[0]);
                data[0].columnwidth = new Array(data[0].cells.values.length + 1).fill(150);
                break;
        }
        return data;
    }

    /** --- PRIVATE ---
     * Creates the settings for the table header. Add the names for the columns
     * @param {Data Object} data 
     * @returns the settings for the table header */
    #getPlotlyTableHeaderObject = data => {
        //console.log(data);
        const header = {
            values: data.headers,
            align: 'center',
            line: { width: 0.5, color: 'white' },
            fill: { color: "#383838" },
            font: { family: "Arial", size: 18, color: "white" },
            height: 50
        };
        return header;
    };

    /** --- PRIVATE ---
     * creates the settings for the cells
     * @param {Data Object} data 
     * @returns settings for the cells */
    #getPlotlyTableCellsObject = data => {
        const cellObject = {
            values: data.cellvalues,
            align: 'left',
            line: { color: "#737373", width: 0.5 },
            font: { family: "Arial", size: 16, color: ["#171717"] },
            height: 35,
        };
        return cellObject;
    };


    /** --- PRIVATE ---
    * Creates a tabulator table.
    * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the data columns
    * @param {string} type chart type, ie 'bar'
    * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
    * @param {Number} width width of the chart
    * @param {Number} height height of the chart
    * @returns Tabulator Object
    */
    #drawTabulatorTable = (data, type, tablediv, width, height) => {
        var result = undefined;
        //console.log(data.tabledata);
        switch (type) {
            case 'table':
                var tabulatorId = tablediv.getAttribute('id');
                
                result = new Tabulator(`#${tabulatorId}`,
                    {
                        columns: data.columns,
                        data: data.tabledata,
                        pagination: "local",
                        paginationSize: 100,
                        paginationSizeSelector: [10, 50, 100, 250],
                        movableColumns: true,
                        width: width,
                        height: height,
                        ajaxLoader: true,
                    }
                );
                
                this.#dataTable.set(tabulatorId, result);
                break;
        }
        return result;
    }



    /** --- PUBLIC ---
     * There are a lot of options passed to the function from the HUB.
     * @param {{e: any[], x: any[]}, y: any[]} data Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
     * @param {Number} width width of the chart
     * @param {Number} height height of the chart
     * @param {string} framework echart makes all charts except table. plotly makes the table 
     * @param {string} theme echart color theme 
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns chart object  */
    //updateData = (data, type, pdiv, width, height, framework, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
    updatePlotData = (data, type, pdiv, width, height, framework, coordinateSystem) => {
        switch (framework) {
            case 'tabulator':
                return this.#updateTabulatorTable(data, type, pdiv, width, height);
            /*case 'plotly':
                return this.#updatePlotlyChart(data, type, pdiv, width, height);*/
            case 'echart':
                return this.#updateEChartChart(data, type, pdiv, width, height, coordinateSystem);
        }
    }

    #updateTabulatorTable(data, type, pdiv, width, height) {
        let result = undefined;
        // get the target table to update
        var tableId = pdiv.getAttribute('id');
        var tabulator = this.#dataTable.get(tableId);
        if (tabulator) {
            tabulator.setData(data.tabledata);
            tabulator.setColumns(data.columns);
        } else console.log('tabulator table not found', 'chartBuilder -> updateTabulatorTable');
        
        return result;
    }

    #updateEChartChart(data, type, pdiv, width, height, coordinateSystem) {
        // get the active chart
        const myChart = echarts.getInstanceByDom(pdiv);
        myChart.clear();

        const option = this.#optionGenerationMap.get(coordinateSystem)(data, type, coordinateSystem);
        option && myChart.setOption(option);

        this.resizeEchart(myChart, width, height);
        return myChart;
    }

}