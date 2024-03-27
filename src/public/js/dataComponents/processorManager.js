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
        //console.log(filterOptions);
        const filteredData = sourceData.filter((sd, i) => {
            return filterOptions.every((option) => {

                if (!option.optionName || !option.fieldName) {
                    return true; // Skip empty or incomplete filters
                }

                const fieldValue = sd[option.fieldName];

                if (option.dataType === 'value') {
                    switch (option.optionName) {
                        // Numerical data types
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
                }
                else if (option.dataType === 'category') {
                    switch (option.optionName) {
                        // Category data types
                        case 'Category Selection':
                            const { categoryNames } = option.optionValues;
                            return categoryNames.indexOf(fieldValue) !== -1;
                        case 'Keyword':
                            const { equality, keyword } = option.optionValues;
                            if (!keyword) { return true; }
                            return (equality === 'Equal') ? fieldValue === keyword : fieldValue !== keyword;
                        default:
                            return true;
                    }
                }
                else {
                    // Convert the fieldValue to date only string (without time)
                    const dateOnly = fieldValue.split(' ')[0];
                    switch (option.optionName) {
                        // Date data types
                        case 'Date Range':
                            const { start, end } = option.optionValues;
                            // Return sourceData instance if date value is within the specified start and end date range
                            return dateOnly >= start && dateOnly <= end;
                        case 'After':
                            const { afterDate } = option.optionValues;
                            return dateOnly >= afterDate;
                        case 'Before':
                            const { beforeDate } = option.optionValues;
                            return dateOnly <= beforeDate;
                        case 'Date Selection':
                            const { equality, date } = option.optionValues;
                            if (!date) { return true; }
                            return (equality === 'Equal') ? dateOnly === date : dateOnly !== date;
                        default:
                            return true;
                    }
                }

                
            });
        });


        // Filter sourceData down to only checked fields
        return filteredData.map((fd, i) => {
            const selectedFields = {};
            filterOptions.forEach(option => {
                if (fd.hasOwnProperty(option.fieldName)) {
                    selectedFields[option.fieldName] = fd[option.fieldName];
                }
            });
            return selectedFields;
        });
    }

}