class Processor extends Module {
    #command;
    constructor(category, color, shape, command) {
        super(category, color, shape);
        this.#command = command;
    }

    getCommand = () => {
        return this.#command;
    }
}

class FunctionProcessor extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'function');
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("Function");
        this.image = 'images/icons/function.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Gaussian extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'gaussianFilter');
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("Gaussian Filter");
        this.image = 'images/icons/gaussian-function.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Laplacian extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'laplacianFilter');
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("Laplacian Filter");
        this.image = 'images/icons/filter.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}
class Sum extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'sum');
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("Sum");
        this.image = 'images/icons/sum-sign.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}
class Subtract extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'subtract');
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("Subtract");
        this.image = 'images/icons/subtraction-symbol.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}