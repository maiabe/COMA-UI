import { getNumDigits, getDataType } from '../../sharedVariables/index.js';

export class CsvReader {
    constructor() {};
    readFile = (file, cb, moduleKey) => {
        new Response(file).text().then(content => {
            const dataTable = [];
            if (content) {
                const rows = content.split(/\r\n|\n/);
                rows.forEach(r => {
                    dataTable.push(r.split(','));
                });
            }
            cb(dataTable, moduleKey);
        });
    }

    // gets only the columns
    getColumns = (moduleKey, cb) => {
        var inspectorWrapper = document.getElementById(`Inspector-card-${moduleKey}`);
        var datasetTypeDD = inspectorWrapper.querySelector('.dataset-type-dropdown');
        var selectedType = datasetTypeDD.options[datasetTypeDD.selectedIndex].text;
        var file = inspectorWrapper.querySelector(`#upload_csv-${moduleKey}`).files[0];
        var moduleData = undefined;
        var columnHeaders = [];
        new Response(file).text().then(content => {
            if (content) {
                const rows = content.split(/\r\n|\n/);
                var columns = rows[0].split(',');
                columns.forEach((e) => {
                    e = e.replaceAll('\"', '');
                    if (!e.includes('id')) {
                        columnHeaders.push(e);
                    }
                });
                moduleData = {
                    remoteData: false,
                    fileId: `upload_csv-${moduleKey}`,
                    datasetType: selectedType,
                    columnHeaders: columnHeaders,
                }
            } else {
                console.log('failed to read file data columns.');
            }
            cb(moduleKey, moduleData);
        }).catch(error => {
            console.error(error);
        });
    }

    // gets only the values of the local file
    getData = (moduleData, cb) => {
        // only get the data for columnsToRender?
        // only get the data for chartData fields?

        var file = document.getElementById(moduleData.fileId).files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var content = e.target.result;
            const rows = content.split('\n');
            //moduleData.tableData = rows;
            var columns = rows[0].split(',');
            columns = columns.map((e) => { return e.replaceAll('\"', '') });
            var data = [];
            rows.forEach((row, i) => {
                if (i > 0) {
                    var rowObj = {};
                    var values = row.split(',');
                    values.forEach((val, j) => {
                        val = val.replaceAll('\"', '');
                        var key = columns[j];
                        rowObj[key] = val;
                    });
                    data.push(rowObj);
                }
            });

            moduleData.sourceData = data;
            //moduleData.status = "success";
            cb(moduleData);
        }

        reader.readAsText(file);
    }


    /** This reader will delete all column headers with empty string, and deletes all values of that column index
     * 
     * 
     * */
    // moduleData to pass.. { datasetType, columnHeaders, sourceData }
    getFileData = (moduleKey, fileId, objectName, setModuleCB) => {
        var fileInput = document.getElementById(fileId);
        var file = fileInput.files[0];
        var datasetTypeDD = fileInput.closest('.csv-inspector-wrapper').querySelector('.dataset-type-dropdown');
        var datasetType = datasetTypeDD.options[datasetTypeDD.selectedIndex].text;

        //var columnHeaders = [];
        new Response(file).text()
            .then(content => {
                return this.#parseCSV(content);
            })
            .then(sourceData => {
                var moduleData = {
                    remoteData: false,
                    datasetType: datasetType,
                    objectName: objectName,
                    sourceData: sourceData,
                };
                var toggleModuleColor = moduleData.sourceData ? true : false;
                setModuleCB(moduleKey, moduleData, toggleModuleColor);
            })
            .catch(error => {
                console.error(error);
            });
    }

    // read csv planet orbit data
    getObjectOrbits() {
        fetch('/get-object-orbits')
            .then(response => response.text())
            .then(content => {
                // get object orbits data
                var objectOrbitsData = this.#parseCSV(content);
                localStorage.setItem('Object Orbits', JSON.stringify(objectOrbitsData));
                return objectOrbitsData;
            })
            .catch(error => {
                console.error('Error fetching CSV:', error);
            });
    }

    /** Parses CSV input to return as a json data with correct dataTypes for each column values
     *  @param {string} content of the csv input
     *  @return {JSON} sourceData of the input read
     * */
    #parseCSV(content) {
        var sourceData = [];
        if (content) {
            var rows = content.split(/\r\n|\n/);
            // delete all empty rows
            rows = rows.filter(str => !/^\s*(\",|\s)*\s*$/.test(str));
            var columns = rows[0].split('\",');
            // remove empty columns
            var emptyCols = [];
            columns.forEach((str, i) => {
                columns[i] = str.trim();
                if (str === '') {
                    columns.splice(i, 1);
                    emptyCols.push(i);
                }
            });
            rows.forEach((row, i) => {
                if (i > 0) {
                    var rowObj = {};
                    var values = row.split('\",');

                    // remove empty column values
                    values.forEach((val, j) => {
                        if (emptyCols.includes(j)) {
                            values.splice(j, 1);
                        }
                    });
                    values.forEach((val, j) => {
                        val = val.replaceAll('\"', '');
                        val = val.trim();
                        if (columns[j]) {
                            var key = columns[j].replaceAll('\"', '');
                            //-- Determine data type of each value here and store it in rowObj accordingly
                            const dataType = getDataType(val); // returns time, value, or category dataTypes
                            switch (dataType) {
                                /*case 'date':
                                    val = Date(val); // convert to iso date
                                    break;*/
                                case 'value':
                                    let digits = getNumDigits(key);
                                    val = Number(Number(val).toFixed(digits));
                                    break;
                            }
                            rowObj[key] = val;
                        }
                    });
                    sourceData.push(rowObj);
                }
            });
            console.log(sourceData);
        } else {
            // TODO: defer to error screen
            console.log('failed to read file data columns.');
        }
        return sourceData;
    }



}