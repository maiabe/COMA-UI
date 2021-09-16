const plotlyPublisher = new Publisher();
plotData = (data) => {
    data = getRandomType(data);
    console.log(data);
    Plotly.newPlot(document.getElementById('plot_1'), [data], {
        margin: { t: 40 }
    });
    plotlyPublisher.publishMessage({tag: 'New Plot Created', data: 'plot_1'});
}

plotChart = data => {
    console.log(data);
    Plotly.newPlot(document.getElementById('plot_1'), [data], {
        margin: { t: 40 }
    });
};

getRandomType = (data) => {
    switch (Math.ceil(Math.random() * 6)) {
        case 0:
        case 1:
            data.type = 'bar';
            break;
        case 2:
            data.type = 'scatter';
            break;
        case 3:
            data.type = 'bar';
            data.orientation = 'h';
            break;
        case 4:
            data.type = 'scatter';
            data.mode = 'lines';
            break;
        case 5:
        case 6:
            data.type = 'scatter';
            data.mode = 'markers';
            break;
        default:
            data.type = 'bar';
            break;
    }
    return data;
}