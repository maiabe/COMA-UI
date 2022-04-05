export class ChartBuilder {

    #optionGenerationMap;
    #planetaryRadii;

    constructor() {
        this.#optionGenerationMap = new Map();
        this.#optionGenerationMap.set('polar', this.generatePolarOptions.bind(this));
        this.#optionGenerationMap.set('cartesian2d', this.generat2dCartesianOptions.bind(this));

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

    plotData = (data, type, pdiv, width, height, framework, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        switch (framework) {
            case 'plotly':
                return this.drawPlotlyChart(data, type, pdiv, width, height);
            case 'echart':
                return this.drawEChartChart(data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem);
        }
    }

    drawEChartChart = (data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        const myChart = echarts.init(pdiv, theme);
        const option = this.#optionGenerationMap.get(coordinateSystem)(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick);
        option && myChart.setOption(option);
        console.log(option);
        this.resizeEchart(myChart, width, height);
        return myChart;
    };

    generatePolarOptions(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick) {
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
                    data: this.mergeXYDataForPolarPlot(data)
                }
            ]
        }
        const maxR = Math.max(...data.data.x);
        this.#planetaryRadii.forEach((value, key) => {
            console.log(Number(value), maxR)
            if (Number(value) < Number(maxR)) options.series.push(this.getPlanet(key));
        });
        return options;
    }

    mergeXYDataForPolarPlot(data) {
        const mergedData = [];
        if (data.data.x.length === data.data.y[0].length) {
            for (let i = 0; i < data.data.x.length; i++) mergedData.push([data.data.x[i], data.data.y[0][i]]);
        } else alert('Invalid Data For Polar Plot');
        return mergedData;
    }

    generat2dCartesianOptions(data, type, coordinateSystem, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick) {
        console.log(data)
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
            series: this.createSeries(data, type, coordinateSystem)
        }
    }

    createSeries(data, type, coordinateSystem) {
        const seriesArray = [];
        data.data.y.forEach(dataList => {
            seriesArray.push({
                data: dataList,
                type: this.getEchartType(type),
                coordinateSystem: coordinateSystem
            });
        });
        
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

    getPlanet(planet) {
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

    drawPlotlyChart = (data, type, pdiv, width, height) => {
        data = data.data;
        data = this.getPlotlyType(data, type);
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

    getEchartType = type => {
        switch (type) {
            case 'line':
                return 'line';
            case 'bar':
                return 'bar';
            case 'scatter':
                return 'scatter';
        }
    }

    getPlotlyType = (data, type) => {
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
                data.header = this.getPlotlyTableHeaderObject(data);
                data.cells = this.getPlotlyTableCellsObject(data);
                break;
        }
        return data;
    }

    getPlotlyTableHeaderObject = data => {

        const header = {
            values: [],
            align: "center",
            line: { width: 1, color: 'black' },
            fill: { color: "black" },
            font: { family: "Arial", size: 18, color: "white" }
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

    getPlotlyTableCellsObject = data => {
        const cellObject = {
            values: [],
            align: "right",
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 11, color: ["black"] }
        };
        data.headerNames.forEach(header => {
            cellObject.values.push(data[header]);
        });
        return cellObject;
    };
}