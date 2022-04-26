import { Module } from "../index.js";
import { LOCAL_DATA_SOURCE, REMOTE_DATA_TABLE } from "../../sharedVariables/constants.js";

/** This represents a source module and extends the module class. */
export class Source extends Module {
    constructor(category, color, shape, location, command, name, image, inports, outports, key, description) {
        super(category, color, shape, command, name, image, inports, outports, key, description);
    }
}

export class Cholera extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'getCholeraData', 'Cholera', 'images/icons/skull-white.png', [], [{ name: 'OUT', leftSide: false, type: REMOTE_DATA_TABLE }], key);
        this.addData('inportType', -1);
        this.addData('outportType', REMOTE_DATA_TABLE);
        this.addData('description', 'This module returns all data on the London Cholera Outbreak.')
        this.addData('onCreationFunction', this.onCreation.bind(this));
        this.addData('requestMetadataOnCreation', true);
        this.addData('linkedToData', false);
        this.setPopupContent();
        this.createInspectorCardData();
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);
    }

    onCreation = metadata => {
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
        this.addData('linkedToData', true);
    }
}

export class Sql extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'SQL Query', 'images/icons/sql-open-file-format.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}

export class Fits extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'FITS', 'images/icons/files-white.png', [], [{ name: 'OUT', leftSide: false, type: LOCAL_DATA_SOURCE }], key, 'This module will retrieve fits files for an object.');
        this.setPopupContent();
        this.createInspectorCardData();
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription('This module will retrieve fits files for an object.');
        // this.inspectorCardMaker.addInspectorCardObjectsDropdown();
    }
}


export class RandomData extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'getRandomData', 'Random Data', 'images/icons/data-random-squares.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
        this.createInspectorCardData();
    }
    createInspectorCardData() {
        this.addInspectorCardDescription('This module will retrieve two random arrays of integers.');
        this.addInspectorCardIDField();
    }
}

export class Json extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'local', 'processJSONData', 'JSON Data', 'images/icons/json-file.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}

export class Ephemeris extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'Ephemeris', 'images/icons/axis.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }

}

export class Mjd extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'MJD', 'images/icons/calendar.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }
}

export class CometAll extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'remote', 'querySql', 'All Data', 'images/icons/truck.png', [], [{ name: 'OUT', leftSide: false }], key);
        this.setPopupContent();
    }
}
