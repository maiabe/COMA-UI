const fs = require("fs");

class SavedModuleManager {
  constructor() {
    this.moduleMap = null;
    this.loadSavedModules();
  }

  loadSavedModules() {
    fs.readFile("./assets/savedModules.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      this.moduleMap = new Map(Object.entries(JSON.parse(data)));
    });
  }

  updateFile() {
    fs.writeFile(
      "./assets/savedModules.json",
      JSON.stringify(Object.fromEntries(this.moduleMap)),
      (err) => {
        if (err) throw err;
      }
    );
    return true;
  }

  getAllModules() {
    if (this.moduleMap.size > 0) {
      const object = {
        returnData: Object.fromEntries(this.moduleMap),
        type: "Saved Modules",
      };
      return JSON.stringify(object);
    } else return "No Saved Modules Found";
  }
  getModuleById() {}

  removeModule() {}

  addModule(groupInfo, name, description) {
    if (this.moduleMap.has(name))
      return `Saved Module Named ${name} already exists.`;
    else
      this.moduleMap.set(name, {
        groupInfo: groupInfo,
        description: description,
      });
    if (this.updateFile()) return "Successfully Saved Module";
    else return "Save Module Failed";
  }
}

module.exports = SavedModuleManager;
