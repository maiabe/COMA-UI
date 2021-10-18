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

    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.popupContent.appendChild(this.plotDiv);
    }
}

class BarChart extends Output {
    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Bar Chart', 'images/icons/bar-chart.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.popupContent.appendChild(this.plotDiv);
    }
}

class LineChart extends Output {
    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Line Chart', 'images/icons/line-chart.png', [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.popupContent.appendChild(this.plotDiv);
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
