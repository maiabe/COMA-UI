import { Message, Publisher } from '../communication/index.js';
import { CsvReader, DataTable } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { DATA_MANAGER, INPUT_MANAGER } from '../sharedVariables/index.js';

export class InputManager {

    publisher;                      // Publishes messages to the hub
    #csvReader;

    constructor() {
        this.publisher = new Publisher();
        this.#csvReader = new CsvReader();
    };

    readFile = (type, source, path, moduleKey) => {
        switch (type) {
            case 'csv':
                if (this.#validateFile(source, path)) {
                    this.#csvReader.readFile(document.getElementById(path).files[0], this.fileReaderCB, moduleKey);
                } else {
                    console.log('Cannot Read File: No File Found.');
                }
                break;
        }
    }

    #validateFile = (source, path) => {
        let valid = false;
        switch (source) {
            case 'html':
                if (document.getElementById(path).files.length > 0) {
                    valid = true;
                }
                break;
        }
        return valid;
    }

    fileReaderCB = (table, processId) => {
        if (table) {
            const dt = new DataTable();
            const data = {
                val: {
                    type: 'table',
                    data: new DataTable(table)
                },
                id: processId
            }
            const msg = new Message(DATA_MANAGER, INPUT_MANAGER, 'New Data Event', data);
            this.publisher.publishMessage(msg);
        }
    }
}