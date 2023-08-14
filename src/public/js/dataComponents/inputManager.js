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

    // ----------------------------------------- Table Data Organization -----------------------------------------
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
                var columnVal = dataRow[key];
                var dataType = typeof (columnVal);
                if (dataType !== 'object' || columnVal === null) {
                    columnHeaders.push({ fieldName: key, dataType: (dataType === 'number') ? 'value' : (columnVal === null) ? 'null' : 'category' });
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

    /** Prepares the tableData needed to create Tabulator data for columns and data organization.
     * @param {sourceData object} sourceData of the sourceModule linked to the current table module
     * @returns {tableData object} tableData is array of objects that contains information about each field of the sourceData and the values for each field 
     *                              (e.g. tableData = [{ columns: [{ title: 'Date', field: 'date', hozAlign: 'center' }, ...],
     *                                                   tableData: [{ mjd: '5986.480892', dec_obj: '27.803', ... }, ...] }],
     * */
    getTabulatorData(datasetType, columnsToRender, sourceData) {
        console.log(columnsToRender);
        console.log(sourceData);

        var resultColumns = [];
        var tableColumns = this.#buildTabulatorColumns(columnsToRender, resultColumns);
        var resultData = [];
        //var tableSourceData = this.#buildTabulatorSourceData(sourceData, columnsToRender, resultData);
        var tableSourceData = [];
        sourceData.forEach(dataRow => {
            var newDataRow = this.#buildTabulatorSourceData(columnsToRender, dataRow, {});
            tableSourceData.push(newDataRow);
        });

        var tabulatorData = { columns: tableColumns, tabledata: tableSourceData };
        console.log(tabulatorData);
        return tabulatorData;
    }

    #buildTabulatorColumns(columnsToRender, tableColumns) {
        columnsToRender.forEach(column => {
            if (column.hasOwnProperty('data')) {
                var nestedColumnsToRender = column.data;
                var nestedTableColumns = [];
                tableColumns.push({ title: column.fieldName, columns: nestedTableColumns, headerHozAlign: 'left' });
                this.#buildTabulatorColumns(nestedColumnsToRender, nestedTableColumns);
            } else {
                tableColumns.push({ title: column.fieldName, field: column.fieldName, hozAlign: 'right' });
            }
        });
        return tableColumns;
    }

    #buildTabulatorSourceData(columnsToRender, dataRow, newDataRow) {
        columnsToRender.forEach(column => {
            var value = dataRow[column.fieldName];
            if (column.hasOwnProperty('data')) {
                // get the value (obj)
                var nestedColumnsToRender = column.data;
                var nestedDataRow = dataRow[column.fieldName];
                var nestedNewDataRow = newDataRow;
                // get the rest of columns to render
                this.#buildTabulatorSourceData(nestedColumnsToRender, nestedDataRow, nestedNewDataRow);
            }
            else {
                if (column.dataType === 'value') {
                    var numDigits = getNumDigits(column.fieldName);
                    newDataRow[column.fieldName] = Number(value).toFixed(numDigits);
                }
                else if (column.dataType === 'null') {
                    newDataRow[column.fieldName] = 'Null';
                }
                else {
                    newDataRow[column.fieldName] = value;
                }
            }
        }); 
        return newDataRow;
    }

    addRoutes = routes => this.#dataTable.set('routes', routes);
    addObjects = objects => this.#dataTable.set('objects', objects);
    getObjects = () => this.#dataTable.get('objects');
}