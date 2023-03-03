/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

export class ChartBuilder {

    #optionGenerationMap;
    #planetaryRadii;

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
    plotData = (data, type, pdiv, width, height, framework, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        switch (framework) {
            case 'plotly':
                return this.#drawPlotlyChart(data, type, pdiv, width, height);
            case 'echart':
                return this.#drawEChartChart(data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem);
        }
    }

    /** --- PRIVATE ---
     * Plots data as an echart with options
     * @param {{e: any[], x: any[]}, y: any[][]} data Arrays of the data for the x axis, y axis, and error trace
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
     * @returns echart object
     */
    #drawEChartChart = (data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        const myChart = echarts.init(pdiv, theme);
        const option = this.#optionGenerationMap.get(coordinateSystem)(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick);
        option && myChart.setOption(option);
        console.log(option);
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
    #generatePolarOptions(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick) {
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
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns object wil all settings
     */
    #generate2dCartesianOptions(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick) {
        return {
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
            }, dataZoom: [
                {
                    type: 'slider',
                }
            ],
            series: this.#createSeries(data, type, coordinateSystem)
        }
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
        data.data.y.forEach(dataList => {
            seriesArray.push({
                data: dataList,
                type: this.#getEchartType(type),
                coordinateSystem: coordinateSystem
            });
        });

        // Create the error series. This has error bars that are created manually
        // This code came from the Echarts site with slight modifications
        data.data.e.forEach((dataList, index) => {
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
        });
        return seriesArray;
    }

    /** --- PRIVATE ---
     * Gets the details for the planet that will be charted in the polar graph
     * @param {string} planet the name of the planet is a key to the radius 
     * @returns polar chart series */
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
        console.log(data);

        //data = data.data;
        data = this.#getPlotlyType(data, type);
        const chart = Plotly.newPlot(pdiv, [data], {
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
        return chart;
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
                data.type = 'table';
                data.header = this.#getPlotlyTableHeaderObject(data);
                data.cells = this.#getPlotlyTableCellsObject(data);
                break;
        }
        return data;
    }

    /** --- PRIVATE ---
     * Creates the settings for the table header. Add the names for the columns
     * @param {Data Object} data 
     * @returns the settings for the table header */
    #getPlotlyTableHeaderObject = data => {

        const header = {
            values: [],
            align: "center",
            line: { width: 0.5, color: "#383838" },
            fill: { color: "#383838" },
            font: { family: "Arial", size: 18, color: "white" },
            height: 50
        };

        data.headerNames = [];
        Object.keys(data).forEach(key => {
            if (key !== 'type' && key !== 'headerNames' && key !== 'header' && key !== 'cells') {
                header.values.push([`<br>${key}<br>`]);
                data.headerNames.push(key);
            }

        });
        return header;
    };

    /** --- PRIVATE ---
     * creates the settings for the cells
     * @param {Data Object} data 
     * @returns settings for the cells */
    #getPlotlyTableCellsObject = data => {
        const cellObject = {
            values: [],
            align: "right",
            line: { color: "#001c30", width: 0.5 },
            font: { family: "Arial", size: 18, color: ["#171717"] },
            height: 45
        };
        data.headerNames.forEach(header => {
            cellObject.values.push(data[header]);
        });
        return cellObject;
    };
}