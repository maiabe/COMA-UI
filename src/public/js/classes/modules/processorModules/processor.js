class Processor extends Module {
    constructor(category, color, shape, command, name, image, inports, outports) {
        super(category, color, shape, command, name, image, inports, outports);
    }
}

class FunctionProcessor extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'function', 'Function', 'images/icons/function.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Gaussian extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'gaussianFilter', 'Gaussian Filter', 'images/icons/gaussian-function.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Laplacian extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'laplacianFilter', 'Laplacian Filter', 'images/icons/filter.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}
class Sum extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'sum', 'Sum', 'images/icons/sum-sign.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}
class Subtract extends Processor {
    constructor(category, color, shape) {
        super(category, color, shape, 'subtract', 'Subtract', 'images/icons/subtraction-symbol.png', [{ name: 'IN', leftSide: true }], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}