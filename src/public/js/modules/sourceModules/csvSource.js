/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Source } from "../index.js";
import { CsvReader } from "../../dataComponents/index.js";
import { LOCAL_DATA_SOURCE } from "../../sharedVariables/constants.js";

export class Csv extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'local', 'storeData', 'CSV File', 'images/icons/csv-file-format-extension-white.png', [], [{ name: 'OUT', leftSide: false, type: LOCAL_DATA_SOURCE }], key);
        this.csvReader = new CsvReader();
        this.addData('inportType', -1);
        this.addData('outportType', LOCAL_DATA_SOURCE);
        this.addData('description', 'This module loads a CSV file (.csv) and converts it into a module.');
        this.addData('linkedToData', false);
        this.#setPopupContent();
        this.#createInspectorCardData();
    }

    /** --- PRIVATE ---
     * Adds cards to the Inspector Card */
    #createInspectorCardData() {
        this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
    }

    /** --- PRIVATE ---
     * Calls the popupContentMaker to build the HTML content for the CSV popup. */
    #setPopupContent = () => {
        this.popupContentMaker.addDescriptionText(this.getData('description'));
        this.popupContentMaker.createFileUploadField(this.handleFiles.bind(this), this.getData('key'));
        this.popupContentMaker.addDataArea();
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);

    }

    /** --- PUBLIC ---
     * This function is attached to the file upload field in the CSV popup window. This function
     * is called when a file is uploaded. It will check that the file has a .csv extension. */
    handleFiles = () => {
        const newFileArray = document.getElementById('upload_csv').files;
        if (newFileArray.length > 0) {
            const words = newFileArray[0].name.split('.');
            if (words[words.length - 1].toLowerCase() === 'csv') {
                this.#enableReadFileButton();
            }
        }
    }

    /** --- PRIVATE ---
     * When a file is loaded from the local machine and has been validated the read file button
     * is enabled so the user can complete the file upload. */
    #enableReadFileButton = () => {
        this.popupContentMaker.getField('readFileButton').disabled = false;
    };

}