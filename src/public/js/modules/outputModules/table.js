import { Output } from "../index.js";
import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";
import { LT_SOURCE, LT_OUTPUT } from "../../sharedVariables/constants.js";


export class Table extends Output {

    #dataArea;    // Popup section that can display data.

    constructor(category, color, shape, key) {
        super(category, color, shape, 'getTableData', 'Table', 'images/icons/table_inv.png',
            [{ name: 'IN', leftSide: true, type: LT_SOURCE }, { name: 'OUT', leftSide: true, type: LT_OUTPUT }], [], key);
        this.HF = new HTMLFactory();
        this.setPopupContent();
        //this.addData('link', -1, false, '', false);
        //this.addData('onCreationFunction', this.onCreation.bind(this));
        // close data source popup and inspectors

    }

    /*setPopupContent = () => {
        const popupContent = this.HF.createNewDiv('table-popup', 'table-popup', ['table-popup'], []);

        //popupContent.appendChild(tablePopup);
        this.addData('popupContent', popupContent, false, '', false);
        //this.addData('plotDiv', plotDiv, false, '', false);

        *//*const plotDiv = this.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);

        popupContent.appendChild(this.plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);*//*
    }*/

    setPopupContent = () => {
        //this.popupContentMaker.addDescriptionText(this.getData('description'));
        //this.popupContentMaker.createFileUploadField(this.handleFiles.bind(this), this.getData('key'));
        //this.popupContentMaker.addDataArea();
        var moduleKey = this.getData('key');
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper(), false, '', false);

        this.popupContentMaker.setTablePopupContent(moduleKey);
    }

    // moduleData: { moduleHeaders, 
    // Set Inspector card content
    updateInspectorCard(moduleKey, moduleData) {
        // fields objects include { fieldname, displayname, and unitsArray }
        if (moduleData) {
            // add unitsArray if any.. lookup static data?
            var fields = moduleData.columnHeaders.map(header => {
                if (!header.includes('id')) {
                    return { fieldName: header, displayName: header };
                }
            });
            // add view table button
            this.inspectorCardMaker.updateTableModuleInspectorCard(moduleKey, moduleData, fields);
        }
        else {
            console.log('moduleData is not set. Please make sure the source module contains data');
        }
        

    }

    // add eventListener for viewTable button




    onCreation = name => {
        //this.addData('metadata', metadata);

        console.log(name);
        //this.setPopupContent();

        //this.inspectorCardMaker.addSearchFormFields(metadata)
        // --> Add Date Range Field Min Max = date picker? (too many dates can be chosen from, slider may not be very useful)
        // --> Add Object (Comet) text input


    }

    /** --- PUBLIC ---
    * Stores the metadata and updates the linkedToData field.
    * @param {JSON Object} data */
    /*setData = data => {
        this.addData('data', data);
        *//*const headers = data.val.data.getHeaders();
        this.addData('headers', headers);*//*
        const metadata = data.val.data.getMetadata();
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
    }*/

/*    setRemoteData = data => {
        console.log(data);
        // add headers
        this.addData('data', data);
        const wrapper = this.getData('popupContent');
        const content = this.popupContentMaker.addDataCard(data, 'remote-data-' + this.getData('key'));
        wrapper.appendChild(content);
    }*/



}