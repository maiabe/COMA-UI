export class ChartBuilder {
    constructor() { };

    plotData = (data, type, pdiv, width, height, framework, theme) => {
        switch (framework) {
            case 'plotly':
                return this.drawPlotlyChart(data, type, pdiv, width, height);
            case 'echart':
                return this.drawEChartChart(data, type, pdiv, width, height, theme);
        }
    }

    drawEChartChart = (data, type, pdiv, width, height, theme) => {

        const myChart = echarts.init(pdiv, theme);
        const option = {
            xAxis: {
                type: 'value',
                data: data.data.x
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: data.data.y,
                    type: this.getEchartType(type)
                }
            ]
        };

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
                data.header = this.getPlotlyTableHeaderObject();
                data.cells = this.getPlotlyTableCellsObject(data);
                break;
        }
        return data;
    }

    getPlotlyTableHeaderObject = () => {
        return {
            values: [["<b>X</b>"], ["<b>Y</b>"]],
            align: "center",
            line: { width: 1, color: 'black' },
            fill: { color: "black" },
            font: { family: "Arial", size: 18, color: "white" }
        };
    };

    getPlotlyTableCellsObject = data => {
        return {
            values: [data.x, data.y],
            align: "right",
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 11, color: ["black"] }
        };
    };
}