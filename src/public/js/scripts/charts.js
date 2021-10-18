const plotlyPublisher = new Publisher();
plotData = (data, type, pdiv) => {
    data = data.data;
    data = getType(data, type);
    console.log(pdiv);
    Plotly.newPlot(pdiv, [data], {
        margin: { t: 40 }
    });
    plotlyPublisher.publishMessage({ tag: 'New Plot Created', data: 'plot_1' });
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