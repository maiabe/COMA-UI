class Output extends Module {
    constructor(category, color, shape, command, name, image, inports, outports) {
        super(category, color, shape, command, name, image, inports, outports);
    }
}

class ScatterPlot extends Output {
    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Scatter Plot', 'images/icons/scatter-graph.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
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
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
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
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
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

class ImageOutput extends Output {
    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Image', 'images/icons/image.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.setPopupContent();
    }
}
class Value extends Output {
    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Value', 'images/icons/equal.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.dataArea;
        this.textArea;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        const setValueWrapper = GM.HF.createNewDiv('', '', ['setValueWrapper'], []);
        this.popupContent.appendChild(setValueWrapper);
        const dataArea = GM.HF.createNewDiv('', '', ['numberDataArea'], []);
        this.textArea = GM.HF.createNewParagraph('', '', ['popup-text-large'], [], this.data);
        dataArea.appendChild(this.textArea);
        this.popupContent.appendChild(dataArea);
    };

    updatePopupText = val => {
        this.textArea.innerHTML = val;
    };

    
}
