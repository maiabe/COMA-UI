import { Source } from "../index.js";
import { GM } from '../../main.js';
import { CsvReader } from "../../dataComponents/index.js";
import { LOCAL_DATA_SOURCE } from "../../sharedVariables/constants.js";

export class Csv extends Source {
    constructor(category, color, shape, key) {
        console.log(category, color, shape, key)
        super(category, color, shape, 'local', 'storeData', 'CSV File', 'images/icons/csv-file-format-extension-white.png', [], [{ name: 'OUT', leftSide: false, type: LOCAL_DATA_SOURCE }], key);
        this.dataArea;
        this.readFileButton;
        this.deployButton;
        this.csvReader = new CsvReader();
        this.addData('inportType', -1);
        this.addData('outportType', LOCAL_DATA_SOURCE);
        this.addData('description', 'This module loads a CSV file (.csv) and converts it into a module.')
        this.setPopupContent();
        this.createInspectorCardData();
    }

    createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.popupContentMaker.createFileUploadField(this.handleFiles.bind(this), this.getData('key'));
        this.popupContentMaker.addDataArea();
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);

    }

    createTable = () => {
        this.popupContentMaker.getField('dataArea').appendChild(this.csvReader.generateHTMLTable(100));
    };

    handleFiles = () => {
        const newFileArray = document.getElementById('upload_csv').files;
        if (newFileArray.length > 0) {
            const words = newFileArray[0].name.split('.');
            if (words[words.length - 1].toLowerCase() === 'csv') {
                this.enableReadFileButton();
            }
        }
    }
    enableReadFileButton = () => {
        this.popupContentMaker.getField('readFileButton').disabled = false;
    };

}