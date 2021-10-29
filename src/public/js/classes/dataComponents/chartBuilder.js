class ChartBuilder {
    constructor() { };

    plotData = (data, type, pdiv, width, height) => {
        data = data.data;
        data = this.getType(data, type);
        Plotly.newPlot(pdiv, [data], {
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
    }

    plotChart = data => {
        Plotly.newPlot(document.getElementById('plot_1'), [data], {
            margin: { t: 40 }
        });
    };

    getType = (data, type) => {
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
                data.header = {
                    values: [["<b>X</b>"], ["<b>Y</b>"]],
                    align: "center",
                    line: { width: 1, color: 'black' },
                    fill: { color: "black" },
                    font: { family: "Arial", size: 18, color: "white" }
                };
                data.cells = {
                    values: [data.x, data.y],
                    align: "right",
                    line: { color: "black", width: 1 },
                    font: { family: "Arial", size: 11, color: ["black"] }
                }
                break;
        }
        return data;
    }
}