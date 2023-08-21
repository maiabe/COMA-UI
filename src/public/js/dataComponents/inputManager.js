import { Message, Publisher } from '../communication/index.js';
import { CsvReader, DataTable } from './index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { DATA_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, MODULE_MANAGER, getNumDigits } from '../sharedVariables/index.js';

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
    readFile = (moduleKey, fileId, fileType) => {
        var valid = this.#validateFileType(moduleKey, fileId, fileType);
        if (valid) {
            // Set moduleData (columnHeaders)
            //this.#csvReader.getColumns(moduleKey, this.setModuleDataCB);
            // TODO: set columnHeaders as: [{ fieldName: 'name', dataType: 'value' }, ...] .. 
            //          or for nested data, [{ fieldName: 'name', data: [{ fieldName: 'name', dataType: 'category' }, ...] }, ...]
            this.#csvReader.getFileData(moduleKey, fileId, this.setModuleDataCB);
        } else {
            console.log('File type expected does not match. Expected file type:' + fileType);
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
    #validateFileType = (moduleKey, fileId, fileType) => {
        var file = document.getElementById(fileId).files[0];
        var valid = false;
        // check if extention matches the expected file type
        var extention = file.name.split('.');
        if (extention[1] == fileType) {
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
    setModuleDataCB = (moduleKey, moduleData, toggleModuleColor) => {
        console.log(moduleData);
        const data = {
            moduleKey: moduleKey,
            moduleData: moduleData,
            toggleModuleColor: toggleModuleColor
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

    // ----------------------------------------- Table Inspector Data Organization -----------------------------------------
    getColumnHeaders(sourceData) {
        var columnHeaders = [];
        var keys = Object.keys(sourceData[0]);
        // create columnHeader objects list
        columnHeaders = this.buildColumnHeaders(sourceData[0], keys, columnHeaders);
        //columnHeaders = [{ fieldName: 'test1', dataType: 'value'}, { fieldName: 'test1', dataType: 'value'}, { fieldName: 'test1', dataType: 'value'}];
        return columnHeaders;
    }

    buildColumnHeaders(dataRow, keys, columnHeaders) {
        keys.forEach(key => {
            if (!this.excludeFieldMatched(key)) {
                var columnVal = Number(dataRow[key]);
                columnVal = Number.isNaN(columnVal) ? dataRow[key] : columnVal;
                var dataType = typeof (columnVal);
                if (dataType !== 'object' || columnVal === null) {
                    columnHeaders.push({ fieldName: key, dataType: (dataType === 'number' || columnVal === null) ? 'value' : 'category' });
                }
                else {
                    var nestedDataRow = columnVal;
                    var nestedKeys = Object.keys(nestedDataRow);
                    var nestedColumnHeaders = [];
                    columnHeaders.push({ fieldName: key, data: nestedColumnHeaders });

                    this.buildColumnHeaders(nestedDataRow, nestedKeys, nestedColumnHeaders);
                }
            }
        });
        return columnHeaders;
    }

    /** Helper function to exclude all the fields with the string 'id' (just 'id') and '_id' (at the end)
     * @param {fieldName} fieldName to check whether to exclude as columnHeader or not
     */
    excludeFieldMatched(fieldName) {
        var match = false;
        var excludeFields = [/_id$/i, /^id$/i]
        for (let i = 0; i < excludeFields.length; i++) {
            var field = excludeFields[i];
            match = field.test(fieldName);
            if (match) {
                break;
            }
        }
        return match;
    }

    // ----------------------------------------- Chart Inspector Data Organization -----------------------------------------
    // build Chart axis information from columnHeaders (to build Chart Module Inspector Card)
    getChartAxisData(remoteData, sourceData) {
        var columnHeaders = this.getColumnHeaders(sourceData);
        var chartAxisData = [];
        var xAxisData = { axis: 'xaxis', fields: [] };
        var yAxisData = { axis: 'yaxis', fields: [] };
        var errorData = { axis: 'error', fields: [] };
        columnHeaders.forEach(columnHeader => {
            if (remoteData) {
                if (columnHeader.hasOwnProperty('data')) {
                    var columnHeaderY = columnHeader.data;
                    columnHeaderY.forEach(header => {
                        var fieldName = header.fieldName;
                        if (fieldName.includes('err') || fieldName.includes('error')) {
                            header['fieldGroup'] = columnHeader.fieldName;
                            errorData['fields'].push(header);
                        }
                        else {
                            header['fieldGroup'] = columnHeader.fieldName;
                            yAxisData['fields'].push(header);
                        }
                    });
                }
                // x-axis data
                else {
                    xAxisData['fields'].push(columnHeader);
                }
            }
            // local csv data
            else {
                if (columnHeader.fieldName.includes('error') || columnHeader.fieldName.includes('err')) {
                    errorData['fields'].push(columnHeader);
                }
                else {
                    xAxisData['fields'].push(columnHeader);
                    yAxisData['fields'].push(columnHeader);
                }
            }
        });
        chartAxisData.push(xAxisData);
        chartAxisData.push(yAxisData);
        chartAxisData.push(errorData);
        return chartAxisData;
    }

    addRoutes = routes => this.#dataTable.set('routes', routes);
    addObjects = objects => this.#dataTable.set('objects', objects);
    getObjects = () => this.#dataTable.get('objects');
}