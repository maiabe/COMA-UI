export class ChartBuilder {
    constructor() { };

    plotData = (data, type, pdiv, width, height, framework, theme, xAxisLabel, yAxisLabel) => {
        switch (framework) {
            case 'plotly':
                return this.drawPlotlyChart(data, type, pdiv, width, height);
            case 'echart':
                return this.drawEChartChart(data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel);
        }
    }

    drawEChartChart = (data, type, pdiv, width, height, theme, xAxisLabel, yAxisLabel) => {
        console.log(xAxisLabel, yAxisLabel);
        const myChart = echarts.init(pdiv, theme);
        const option = {
            xAxis: {
                type: isNaN(data.data.x[0]) ? 'category' : 'value',
                data: data.data.x,
                name: xAxisLabel,
                nameLocation: 'middle',
                nameGap: 34
            },
            yAxis: {
                type: isNaN(data.data.y[0]) ? 'category' : 'value',
                name: yAxisLabel,
                nameLocation: 'middle',
                nameGap: 34
            },
            series: [
                {
                    data: data.data.y,
                    type: this.getEchartType(type)
                }
            ]
        };
        console.log(option);
        option && myChart.setOption(option);
        this.resizeEchart(myChart, width, height);
        return myChart;
    };

    /**
     * Resizes an Echart
     * @param {Echart Object} chartObject 
     * @param {number} width 
     * @param {height} height 
     */
    resizeEchart = (chartObject, width, height) => chartObject.resize({ width: width, height: height });

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