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


    // Get sourceData
    // moduleData to pass.. { datasetType, columnHeaders, sourceData }
    getFileData = (moduleKey, fileId, setModuleCB) => {
        var fileInput = document.getElementById(fileId);
        var file = fileInput.files[0];
        var datasetTypeDD = fileInput.closest('.csv-inspector-wrapper').querySelector('.dataset-type-dropdown');
        var datasetType = datasetTypeDD.options[datasetTypeDD.selectedIndex].text;

        //var columnHeaders = [];
        var sourceData = [];
        new Response(file).text()
            .then(content => {
                if (content) {
                    const rows = content.split(/\r\n|\n/);
                    var columns = rows[0].split(',');
                    rows.forEach((row, i) => {
                        if (i > 0) {
                            var rowObj = {};
                            var values = row.split(',');
                            values.forEach((val, j) => {
                                val = val.replaceAll('\"', '');
                                var key = columns[j].replaceAll('\"', '');
                                rowObj[key] = val;
                            });
                            sourceData.push(rowObj);
                        }
                    });

                    var moduleData = {
                        datasetType: datasetType,
                        sourceData: sourceData,
                    };

                } else {
                    // TODO: defer to error screen
                    console.log('failed to read file data columns.');
                }
                return moduleData;
            })
            .then(moduleData => {
                var toggleModuleColor = moduleData.sourceData ? true : false;
                setModuleCB(moduleKey, moduleData, toggleModuleColor);
            })
            .catch(error => {
                console.error(error);
            });
    }


    #removeIdFields(fields) {
        var displayFields = fields.map((field) => {
            if (!field.includes('id')) {
                return field;
            }
        });
        return displayFields;
    }

}