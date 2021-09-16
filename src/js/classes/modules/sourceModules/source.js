/** This represents a source module and extends the module class. */
class Source extends Module {
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
}

class Sql extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('SQL Query');
        this.image = 'images/icons/sql-open-file-format.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Fits extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('FITS File');
        this.image = 'images/icons/files.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}



class RandomData extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('Random Data');
        this.image = 'images/icons/data-random-squares.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Json extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('JSON Data');
        this.image = 'images/icons/json-file.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Ephemeris extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('Ephemeris');
        this.image = 'images/icons/axis.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }

}

class Mjd extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("MJD");
        this.image = 'images/icons/calendar.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }
}

class CometAll extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("All Data");
        this.image = 'images/icons/truck.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }


}
