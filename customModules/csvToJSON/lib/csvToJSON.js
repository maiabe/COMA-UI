const { header } = require('express/lib/request');
const fs = require('fs')

class CsvToJSON {
    constructor() { }

    convertCSVFileToJSON(filePath) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            let stringArray = data.split('\n');
            const JSONObjectArray = [];
            let headerArray = [];
            stringArray.forEach((row, index) => {
                if (index === 0) {
                    headerArray = row.split(',');
                } else {
                    const splitRow = row.split(',');
                    const obj = {};
                    splitRow.forEach((element, index) => {
                        obj[headerArray[index]] = element;
                    });
                    JSONObjectArray.push(obj);
                }
            });
            this.updateFile('./localFileStorage/cholera.json',JSONObjectArray);
        });
    }

    updateFile(filePath, dataToWrite) {
        fs.writeFile(filePath, JSON.stringify(dataToWrite), (err) => {
            if (err) throw err;
        });
        return true;
    }
}

module.exports = CsvToJSON;