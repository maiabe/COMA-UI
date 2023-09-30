/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Source } from "../index.js";
import { CsvReader } from "../../dataComponents/index.js";
import { LT_SOURCE, LT_PROCESSOR, LT_OUTPUT } from "../../sharedVariables/constants.js";

export class Csv extends Source {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'local', 'storeData', 'CSV File', 'images/icons/csv-file-format-extension-white.png', [],
            [{ name: 'OUT', leftSide: false, type: LT_SOURCE }], key);
        this.csvReader = new CsvReader();
        this.addData('inportType', [-1]);
        this.addData('outportType', [LT_PROCESSOR, LT_OUTPUT]);
        this.addData('description', 'This module loads a CSV file (.csv) and converts it into a module.');
        this.addData('linkedToData', false);
        this.addData('remoteData', false);
        this.addData('callOnCreationFunction', true);
        this.addData('popupWidth', 300);
        this.addData('popupHeight', 300);
        //this.addData('onCreationFunction', this.onCreation.bind(this));
        //this.#createInspectorCardData();
        //this.setPopupContent();


        //this.#createInspectorCardData();
    }

    /** --- PRIVATE ---
     * Adds cards to the Inspector Card */
    #createInspectorCardData() {
        //this.inspectorCardMaker.addInspectorCardDescription(this.getData('description'));
        this.inspectorCardMaker.createCSVModuleInspectorCard(this.handleFiles.bind(this), this.getData('key'));
        //this.inspectorCardMaker.createFileUploadField(this.handleFiles.bind(this), this.getData('key'));
    }

    /** --- PUBLIC ---
     * This function is attached to the file upload field in the CSV popup window. This function
     * is called when a file is uploaded. It will check that the file has a .csv extension. */
    handleFiles = () => {
        const newFileArray = document.getElementById('upload_csv-' + this.getData('key')).files;
        if (newFileArray.length > 0) {
            const words = newFileArray[0].name.split('.');
            if (words[words.length - 1].toLowerCase() === 'csv') {
                this.#toggleReadFileButton(false);
            }
            else {
                this.#toggleReadFileButton(true);
            }
        }
    }

    /** --- PRIVATE ---
     * When a file is loaded from the local machine and has been validated the read file button
     * is enabled so the user can complete the file upload. */
    #toggleReadFileButton = (toggle) => {
        this.inspectorCardMaker.getField('readFileButton').disabled = toggle;
    };

    onCreation = () => {
        //this.addData('metadata', metadata);

        this.inspectorCardMaker.createCSVModuleInspectorCard(this.handleFiles.bind(this), this.getData('key'));

        //this.inspectorCardMaker.addSearchFormFields(metadata)
        // --> Add Date Range Field Min Max = date picker? (too many dates can be chosen from, slider may not be very useful)
        // --> Add Object (Comet) text input

    }
}