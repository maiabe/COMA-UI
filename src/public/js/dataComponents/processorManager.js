import { Message, Publisher } from '../communication/index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { INPUT_MANAGER, OUTPUT_MANAGER, MODULE_MANAGER, getNumDigits, INSPECTOR_CARD, getDataType } from '../sharedVariables/index.js';

export class ProcessorManager {
    
    publisher;  // Publishes messages to the hub

    constructor() {
        this.publisher = new Publisher();
    };


    /**
     * Filter source data according to filter options
     * */
    getFilteredData(filterOptions, sourceData) {
        let filteredSourceData = [];
        sourceData.forEach((sd) => {
            let fsd = {};
            filterOptions.forEach((option) => {
                fsd[option.fieldName] = sd[option.fieldName];



                // only record data that matches the 
                filteredSourceData.push(fsd);
            });
        });

        return filteredSourceData;
    }

}