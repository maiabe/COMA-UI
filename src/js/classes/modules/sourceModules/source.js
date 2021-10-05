/** This represents a source module and extends the module class. */
class Source extends Module {
    #location;
    #params;
    constructor(category, color, shape, location, command) {
        super(category, color, shape, command);
        this.data;
        this.#location = location;
        this.#params;
    }

    setData = data => {
        this.data = data;
    }

    getData = () => {
        return this.data;
    }

    getLocation = () => {
        return this.#location;
    }
    getParams = () => {
        return this.#params;
    }
}

class Sql extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql');
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
        super(category, color, shape, 'remote', 'querySql');
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
        super(category, color, shape, 'remote', 'getRandomData');
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
        super(category, color, shape, 'local', 'processJSONData');
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
        super(category, color, shape, 'remote', 'querySql');
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
        super(category, color, shape, 'remote', 'querySql');
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
        super(category, color, shape, 'remote', 'querySql');
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName("All Data");
        this.image = 'images/icons/truck.png';
        this.popupContent;
        this.setPopupContent();
        this.setupInspectorContent();
    }


}

class NumberSource extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'local', 'storeThisData');
        this.value = -1;
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('Number');
        this.image = 'images/icons/number.png';
        this.popupContent;
        this.textArea;
        this.dataArea;
        this.setPopupContent();
        this.setupInspectorContent();
        this.setupPopupContent();
        this.addInspectorContent('Value', {text: this.value, modify: true});
    }

    setupPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        const setValueWrapper = GM.HF.createNewDiv('', '', ['setValueWrapper'], []);
        this.popupContent.appendChild(setValueWrapper);
        const valIn = GM.HF.createNewTextInput('value-in', 'value-in', [], [], 'text', false);
        setValueWrapper.append(valIn);
        valIn.addEventListener('change', this.handleInputChange);
        const dataArea = GM.HF.createNewDiv('', '', ['numberDataArea'], []);
        this.textArea = GM.HF.createNewParagraph('', '', ['popup-text-large'], [], '-1');
        dataArea.appendChild(this.textArea);
        this.popupContent.appendChild(dataArea);
    };

    handleInputChange = e => {
        this.value = parseFloat(e.srcElement.value);
        this.textArea.innerHTML = this.value;
        this.addInspectorContent('Value', {text: this.value, modify: true});
        GM.MM.requestInspectorUpdate(this.getKey());
    }

    getValue = () => {
        return this.value;
    }

}
