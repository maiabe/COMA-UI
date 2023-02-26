const fs = require('fs')

class DatabaseSimulator {
    #db;
    #files;
    constructor() {
        this.#files = new Map();
        this.#db = new Map();
        this.setFilePaths();
        this.populateDatabase();
    }

    populateDatabase() {
        this.#files.forEach((value, key) => {
            this.populateFileIntoDatabase(key, value);
        });
    }

    setFilePaths() {
        this.#files.set('Search', './localFileStorage/searchModule.json');
        this.#files.set('Cholera', './localFileStorage/cholera.json');
    }

    populateFileIntoDatabase(databaseKey, filePath) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.#db.set(databaseKey, JSON.parse(data));
        });
    }

    getMetadata(name) {
        const object = {
            returnData: this.#db.get(name).metadata,
            type: 'Metadata Return'
        }

        return JSON.stringify(object);
    }

}

module.exports = DatabaseSimulator;