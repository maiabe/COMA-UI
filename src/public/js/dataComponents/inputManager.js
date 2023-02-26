import { Message, Publisher } from '../communication/index.js';
import { CsvReader, DataTable } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { DATA_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER } from '../sharedVariables/index.js';

export class InputManager {

    publisher;                      // Publishes messages to the hub
    #csvReader;
    #dataTable;

    constructor() {
        this.publisher = new Publisher();
        this.#csvReader = new CsvReader();
        this.#dataTable = new Map();
    };

    readFile = (type, source, path, moduleKey) => {
        switch (type) {
            case 'csv':
                if (this.#validateFile(source, path))
                    this.#csvReader.readFile(document.getElementById(path).files[0], this.fileReaderCB, moduleKey);
                else console.log('Cannot Read File: No File Found.');
                break;
        }
    }

    #validateFile = (source, path) => {
        let valid = false;
        switch (source) {
            case 'html':
                if (document.getElementById(path).files.length > 0) valid = true;
                break;
        }
        return valid;
    }

    fileReaderCB = (table, processId) => {
        if (table) {
            const data = {
                val: {
                    type: 'table',
                    data: new DataTable(table),
                },
                id: processId,
                linkDataNode: true,
                local: true
            }
            const msg = new Message(OUTPUT_MANAGER, INPUT_MANAGER, 'New Table Event', data);
            this.publisher.publishMessage(msg);
        }
    }


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