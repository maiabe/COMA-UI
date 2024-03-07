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
        console.log(filterOptions);
        return sourceData.filter((sd, i) => {
            return filterOptions.every((option) => {
                if (!option.optionName || !option.fieldName) {
                    return true; // Skip empty or incomplete filters
                }

                const fieldValue = sd[option.fieldName];

                switch (option.optionName) {
                    case 'Range':
                        const { min, max } = option.optionValues;
                        return fieldValue >= min && fieldValue <= max;
                    case 'Less Than':
                        const { lessThanVal } = option.optionValues;
                        return fieldValue < lessThanVal;
                    case 'Greater Than':
                        const { greaterThanVal } = option.optionValues;
                        return fieldValue > greaterThanVal;
                    case 'Value':
                        const { equality, value } = option.optionValues;
                        if (!value) { return true; }
                        return (equality === 'Equal') ? fieldValue === value : fieldValue !== value;
                    default:
                        return true;
                }
            });
        });
    }

}