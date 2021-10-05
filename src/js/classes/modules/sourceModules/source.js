/** This represents a source module and extends the module class. */
class Source extends Module {
    #params;
    constructor(category, color, shape, location, command, name, image, inports, outports) {
        super(category, color, shape, command, name, image, inports, outports);
        this.addData('location', location, false, '', false);
    }
}

class Sql extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql', 'SQL Query', 'images/icons/sql-open-file-format.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Fits extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql', 'FITS File', 'images/icons/files.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}



class RandomData extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'getRandomData', 'Random Data', 'images/icons/data-random-squares.png', [],[{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Json extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'local', 'processJSONData', 'JSON Data','images/icons/json-file.png',[], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Ephemeris extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql', 'Ephemeris', 'images/icons/axis.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }

}

class Mjd extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql', 'MJD', 'images/icons/calendar.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }
}

class CometAll extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'remote', 'querySql', 'All Data','images/icons/truck.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.setPopupContent();
    }
}

class NumberSource extends Source {
    constructor(category, color, shape) {
        super(category, color, shape, 'local', 'storeThisData', 'Number', 'images/icons/number.png', [], [{ name: 'OUT', leftSide: false }]);
        this.popupContent;
        this.textArea;
        this.dataArea;
        this.setPopupContent();
        this.addData('value', -1, true, -1, true);
    }

    setPopupContent = () => {
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
        this.setData('value', e.srcElement.value, e.srcElement.value);
        GM.MM.requestInspectorUpdate(this.getData('key'));
        this.updatePopupDataValue();
    }

    updatePopupDataValue = () => {
        this.textArea.innerHTML = this.getData('value');
    };


}
