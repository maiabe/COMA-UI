class Output extends Module {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.data;
    }
    setData = data => {
        this.data = data;
    }

    getData = () => {
        return this.data;
    }

    clearData = () => {
        this.data = undefined;
    }
}

class ScatterPlot extends Output {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Scatter Plot");
        this.image = 'images/icons/scatter-graph.png';
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
        this.setupInspectorContent();
        this.subscriber = new Subscriber(this.handleMessage);
        plotlyPublisher.subscribe(this.subscriber);

    }

    setPopupContent = () => {
        this.popupContent = document.createElement('div');
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle('New Scatter Plot Module');
        this.plotDiv = document.createElement('div');
        this.plotDiv.id = `plot_${this.key}`;
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        this.popupContent.appendChild(this.plotDiv);
    }

    loadPopupContent = () => {
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle(this.name);
        MP.setHeaderColor(this.color);
    }

    handleMessage = msg => {
        if (msg.tag = 'New Plot Created') {
            this.loadPopupContent();
        }
    }
}

class BarChart extends Output {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Bar Chart");
        this.image = 'images/icons/bar-chart.png';
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
        this.setupInspectorContent();
        this.subscriber = new Subscriber(this.handleMessage);
        ENV.publisher.subscribe(this.subscriber);
    }

    setPopupContent = () => {
        this.popupContent = document.createElement('div');
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle('Bar Chart Module');
        this.plotDiv = document.createElement('div');
        this.plotDiv.id = `plot_${this.key}`;
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        this.popupContent.appendChild(this.plotDiv);
    }

    loadPopupContent = () => {
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle(this.name);
        MP.setHeaderColor(this.color);
    }
    handleMessage = msg => {
        switch (msg.tag) {
            case 'Link Drawn':
                if (msg.data.toNodeKey === this.key) {
                    this.setData(this.getDataFromNode(msg.data.fromNodeKey));
                    this.addPlotInspectorFields();
                }
        }
    }

    addPlotInspectorFields = () => {
        const div = document.createElement('div');
        const select = document.createElement("select");
        select.id = "bar-x-axis";
        select.name = "bar-x-axis";
        const select2 = document.createElement("select");
        select2.id = "bar-y-axis";
        select2.name = "bar-y-axis";
        let index = 0;
        for (const val of this.data[0]) {
            var option = document.createElement("option");
            option.value = index;
            option.text = val.charAt(0).toUpperCase() + val.slice(1);
            select.appendChild(option);
            var option2 = document.createElement("option");
            option2.value = index;
            option2.text = val.charAt(0).toUpperCase() + val.slice(1);
            select2.appendChild(option2);
            index++;
        }

        var label = document.createElement("label");
        label.innerHTML = "X Axis: "
        label.htmlFor = "bar-x-axis";
        var label2 = document.createElement("label");
        label2.innerHTML = "Y Axis: "
        label2.htmlFor = "bar-y-axis";
        div.appendChild(label).appendChild(select);
        div.appendChild(label2).appendChild(select2);
        if (!this.inspectorContent.html) {
            this.inspectorContent.html = [];
        }

        const button = document.createElement('input');
        button.value = 'Plot';
        button.type = 'button';
        div.appendChild(button);
        this.inspectorContent.html.push(div);
        this.updateInspectorContent();

        button.addEventListener('click', this.plot);
    }

    plot = () => {
       const x = document.querySelector('#bar-x-axis').value;
       const y = document.querySelector('#bar-y-axis').value;

       const data = {x:[], y:[], type: 'bar'};
       this.data.forEach((e, index) => {
        if (index > 0) {
            e.forEach((point, index) => {
                if (index == x) {
                    data.x.push(point);
                }
                if (index == y) {
                    data.y.push(point);
                }
            });
        }
       });
       plotChart(data);
    }
}
class LineChart extends Output {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Line Chart");
        this.image = 'images/icons/line-chart.png';
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
        this.setupInspectorContent();
        this.subscriber = new Subscriber(this.handleMessage);
        ENV.publisher.subscribe(this.subscriber);
    }

    setPopupContent = () => {
        this.popupContent = document.createElement('div');
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle('Line Chart Module');
        this.plotDiv = document.createElement('div');
        this.plotDiv.id = `plot_${this.key}`;
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        this.popupContent.appendChild(this.plotDiv);
    }

    loadPopupContent = () => {
        this.plotDiv.innerHTML = document.getElementById('plot_1').innerHTML;
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle(this.name);
        MP.setHeaderColor(this.color);
    }

    handleMessage = msg => {
        switch (msg.tag) {
            case 'Link Drawn':
                if (msg.data.toNodeKey === this.key) {
                    this.setData(this.getDataFromNode(msg.data.fromNodeKey));
                    this.addPlotInspectorFields();
                }
        }
    }

    addPlotInspectorFields = () => {
        const div = document.createElement('div');
        const select = document.createElement("select");
        select.id = "line-x-axis";
        select.name = "line-x-axis";
        const select2 = document.createElement("select");
        select2.id = "line-y-axis";
        select2.name = "line-y-axis";
        let index = 0;
        for (const val of this.data[0]) {
            var option = document.createElement("option");
            option.value = index;
            option.text = val.charAt(0).toUpperCase() + val.slice(1);
            select.appendChild(option);
            var option2 = document.createElement("option");
            option2.value = index;
            option2.text = val.charAt(0).toUpperCase() + val.slice(1);
            select2.appendChild(option2);
            index++;
        }

        var label = document.createElement("label");
        label.innerHTML = "X Axis: "
        label.htmlFor = "line-x-axis";
        var label2 = document.createElement("label");
        label2.innerHTML = "Y Axis: "
        label2.htmlFor = "line-y-axis";
        div.appendChild(label).appendChild(select);
        div.appendChild(label2).appendChild(select2);
        if (!this.inspectorContent.html) {
            this.inspectorContent.html = [];
        }

        const button = document.createElement('input');
        button.value = 'Plot';
        button.type = 'button';
        div.appendChild(button);
        this.inspectorContent.html.push(div);
        this.updateInspectorContent();

        button.addEventListener('click', this.plot);
    }

    plot = () => {
       const x = document.querySelector('#line-x-axis').value;
       const y = document.querySelector('#line-y-axis').value;

       const data = {x:[], y:[], type: 'scatter'};
       this.data.forEach((e, index) => {
        if (index > 0) {
            e.forEach((point, index) => {
                if (index == x) {
                    data.x.push(point);
                }
                if (index == y) {
                    data.y.push(point);
                }
            });
        }
       });
       plotChart(data);
    }

}
class Table extends Output {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Table");
        this.image = 'images/icons/table.png';
        this.popupContent;
        this.dataArea;
        this.setPopupContent();
        this.setupInspectorContent();
        this.subscriber = new Subscriber(this.handleMessage);
        ENV.publisher.subscribe(this.subscriber);
    }

    setPopupContent = () => {
        this.popupContent = document.createElement('div');
        this.dataArea = document.createElement('div');
        this.dataArea.id = 'tableDataArea';
        this.popupContent.appendChild(this.dataArea);
    }

    handleMessage = msg => {
        switch (msg.tag) {
            case 'Link Drawn':
                if (msg.data.toNodeKey === this.key) {
                    this.setData(this.getDataFromNode(msg.data.fromNodeKey));
                    this.dataArea.innerHTML = '';
                    this.dataArea.append(HTG.generateTableFromData(this.getData(), 200))
                }
        }
    };


}
class ImageOutput extends Output {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Image");
        this.image = 'images/icons/image.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }
}
