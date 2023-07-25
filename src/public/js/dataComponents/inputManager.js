import { Message, Publisher } from '../communication/index.js';
import { CsvReader, DataTable } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { DATA_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, MODULE_MANAGER } from '../sharedVariables/index.js';

export class InputManager {

    publisher;                      // Publishes messages to the hub
    #csvReader;
    #dataTable;

    constructor() {
        this.publisher = new Publisher();
        this.#csvReader = new CsvReader();
        this.#dataTable = new Map();
    };

    // sets moduleData for CSV module
    readFile = (moduleKey, fileId, type) => {
        var valid = this.#validateFileType(moduleKey, fileId, type);
        if (valid) {
            // Set moduleData (columnHeaders)
            //this.#csvReader.getColumns(moduleKey, this.setModuleDataCB);
            this.#csvReader.getFileData(moduleKey, fileId, this.setModuleDataCB);
        } else {
            console.log('File type expected does not match. Expected file type:' + type);
        }
    }

    // Gets table data to set its content ... not needed?
    getTableData = (moduleData) => {
        if (moduleData.fileId) {
            this.#csvReader.getData(moduleData, this.setTableCB);
        }
    }

    // Gets chart data to set its content ... not needed?
    getChartData = (moduleData) => {
        if (moduleData.fileId) {
            this.#csvReader.getData(moduleData, this.setChartCB);
        }
    }
    


    /**
     * 
     * */
    #validateFileType = (moduleKey, fileId, type) => {
        var file = document.getElementById(fileId).files[0];
        var valid = false;
        // check if extention matches the expected file type
        var extention = file.name.split('.');
        if (extention[1] == type) {
            valid = true;
        }
        return valid;
    }

    // deprecated
    /*#validateFile = (source, path) => {
        let valid = false;
        switch (source) {
            case 'html':
                if (document.getElementById(path).files.length > 0) valid = true;
                break;
        }
        return valid;
    }*/

    /** Sets moduleData to the CSV module.
     * @param {moduleKey} moduleKey of this CSV module
     * @param {moduleData} moduleData to set to this CSV module with
     * */
    setModuleDataCB = (moduleKey, moduleData) => {
        const data = {
            moduleKey: moduleKey,
            moduleData: moduleData,
        }
        const msg = new Message(MODULE_MANAGER, INPUT_MANAGER, 'Set Module Data Event', data);
        this.publisher.publishMessage(msg);
    }

    // called at the table module to get the content of the file
    setTableCB = (moduleData) => {
        const msg = new Message(OUTPUT_MANAGER, INPUT_MANAGER, 'Set New Table Event', moduleData);
        this.publisher.publishMessage(msg);
    }

    // called at the chart module to get the content of the file
    setChartCB = (moduleData) => {
        const msg = new Message(OUTPUT_MANAGER, INPUT_MANAGER, 'Set New Chart Event', moduleData);
        this.publisher.publishMessage(msg);
    }

    // called at the table module to view button and get table data 
    

    // set sourceData (deprecated)
    fileReaderCB = (table, processId) => {
        if (table) {
            const data = {
                val: {
                    type: 'table',
                    data: new DataTable(table),
                },
                id: processId,
            }
            const msg = new Message(MODULE_MANAGER, INPUT_MANAGER, 'Set Module Data Event', data);
            this.publisher.publishMessage(msg);
        }
    }

    // deprecated
    searchFormSubmit = (type, formdata, moduleKey) => {
        // validate search input, then send input to worker manager for api call
        // send message to output manager with the json response from worker manager
        const keys = formdata.keys();
        for (let value of keys) {
            console.log(value)
        }
        // Validate input
        // send message to Worker Manager


        // store json result in variable
        // send message to output manager with json result data


        console.log("inside searchFormSubmit in Input Manager");
    }



    addRoutes = routes => this.#dataTable.set('routes', routes);
    addObjects = objects => this.#dataTable.set('objects', objects);
    getObjects = () => this.#dataTable.get('objects');
}