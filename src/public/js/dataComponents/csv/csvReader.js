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

    getColumns = (fileId, cb, moduleKey) => {
        var file = document.getElementById(fileId).files[0];
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
                    fileId: fileId,
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

    getData = (moduleData, cb) => {
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
            moduleData.tableData = data;
            moduleData.status = "success";
            cb(moduleData);
        }

        reader.readAsText(file);
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