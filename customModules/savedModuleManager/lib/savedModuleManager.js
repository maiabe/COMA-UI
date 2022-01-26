const fs = require('fs')

class SavedModuleManager {

    constructor() {
        this.moduleMap = null;
        this.loadSavedModules();
    }

    loadSavedModules() {
        fs.readFile('./localFileStorage/savedModules.json', 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            this.moduleMap = new Map(Object.entries(JSON.parse(data)));
        });
    }

    updateFile() {
        fs.writeFile('./localFileStorage/savedModules.json', JSON.stringify(Object.fromEntries(this.moduleMap)), (err) => {
            if (err) throw err;
        });
        return true;
    }

    getAllModules() {
        const object = {
            returnData: Object.fromEntries(this.moduleMap),
            type: 'Saved Modules'
        }
        return JSON.stringify(object);
    }
    getModuleById() {}

    removeModule() {
        
    }

    addModule(groupInfo){
        this.moduleMap.set('New Composite Module', groupInfo);
        console.log(this.moduleMap);
        if (this.updateFile()) return 'Successfully Saved Module';
        else return 'Save Module Failed';
    }
}

module.exports = SavedModuleManager;