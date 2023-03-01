import { Output } from "../index.js";
import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";
import { TABLE_OUTPUT, LOCAL_DATA_SOURCE, MODULE, MODULE_MANAGER, OUTPUT_MANAGER, REMOTE_DATA_TABLE } from "../../sharedVariables/constants.js";


export class Table extends Output {

    #dataArea;    // Popup section that can display data.

    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Table', 'images/icons/table.png', [{ name: 'IN', leftSide: true, type: TABLE_OUTPUT }, { name: 'IN', leftSide: true, type: LOCAL_DATA_SOURCE }], [{ name: 'OUT', leftside: false, type: REMOTE_DATA_TABLE }], key);
        this.HF = new HTMLFactory();
        this.addData('link', -1, false, '', false);
        this.addData('inportType', TABLE_OUTPUT);
        this.addData('inportType', LOCAL_DATA_SOURCE);
        this.addData('outportType', REMOTE_DATA_TABLE);
        //this.addData('onCreationFunction', this.onCreation.bind(this));
        this.setPopupContent();
        // close data source popup and inspectors

    }

    setPopupContent = () => {
        const popupContent = this.HF.createNewDiv('table-popup', 'table-popup', ['table-popup'], []);
        //const tablePopup = this.HF.createNewDiv(`table-popup`, `table-popup`, ['table-popup'], []);

        //popupContent.appendChild(tablePopup);
        this.addData('popupContent', popupContent, false, '', false);
        //this.addData('plotDiv', plotDiv, false, '', false);

        /*const plotDiv = this.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);

        popupContent.appendChild(this.plotDiv);
        this.addData('popupContent', popupContent, false, '', false);
        this.addData('plotDiv', plotDiv, false, '', false);*/

    }



    // Set Inspector card content


    onCreation = name => {
        //this.addData('metadata', metadata);

        console.log(name);

        //this.inspectorCardMaker.addSearchFormFields(metadata)
        // --> Add Date Range Field Min Max = date picker? (too many dates can be chosen from, slider may not be very useful)
        // --> Add Object (Comet) text input


    }

    /** --- PUBLIC ---
    * Stores the metadata and updates the linkedToData field.
    * @param {JSON Object} data */
    setData = data => {
        this.addData('data', data);
        /*const headers = data.val.data.getHeaders();
        this.addData('headers', headers);*/
        const metadata = data.val.data.getMetadata();
        this.addData('metadata', metadata);
        this.inspectorCardMaker.addMetadataCard(metadata);
        this.popupContentMaker.addMetadataCard(metadata);
        this.addData('linkedToData', true);
    }

    setRemoteData = data => {
        // add headers
        this.addData('data', data);
        const wrapper = this.getData('popupContent');
        const content = this.popupContentMaker.addDataCard(data, 'remote-data-' + this.getData('key'));
        wrapper.appendChild(content);

        this.addData('linkedToData', true);
    }

}