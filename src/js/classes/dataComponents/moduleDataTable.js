class ModuleDataTable {
    constructor() {
        this.nameArray = [];
        this.moduleArray = [];
    };

    /** Adds a module to the correct Array. 
     * @param module -> The module to add.
    */
    addModule = module => {
        this.moduleArray.push(module);
        if (!this.nameArray.includes(module.getName())) {
            this.nameArray.push(module.getName());
        }
    };

    /** Removes the Module from the correct Array. 
     * @param key -> The key of the node.
     * @param the -> The type of the node.
    */
    removeModule = (key, type) => {
        switch (type) {
            case 'Source':
                this.sourceArray.forEach((e, index) => {
                    if (e.getKey() === key) {
                        this.sourceArray.splice(index, 1);
                    }
                });
                break;
            case 'Output':
                this.outputArray.forEach((e, index) => {
                    if (e.getKey() === key) {
                        this.outputArray.splice(index, 1);
                    }
                });
                break;
            case 'Processor':
                this.processorArray.forEach((e, index) => {
                    if (e.getKey() === key) {
                        this.processorArray.splice(index, 1);
                    }
                });
                break;
            default:
                console.log('Invalid Module Type. Cannot Remove Module.');
                break;
        }
    };

    /** Checks to see if there is a template for this specific type
     * @param type -> The type of the node identifies which array to check.
     * @return true if the array is not empty, false if the array is empty.
     */
    doesTemplateExist = name => {
        return this.nameArray.includes(name) ? false : true;
    };

    /** Gets a module from the correct array
     * @param key -> The key of the node.
     * @param type -> The type of the node.
     */
    getModule = key => {
        let mod = undefined;
        this.moduleArray.forEach(e => {
            if (e.getKey() === key) {
                mod = e;
            }
        });
        return mod;
    };

    handleDoubleClick = (event, key, type) => {
        const mod = this.getModule(key);
        mod.updatePopupContent();
        if (mod) {
            MP.open(event.Xr.clientY - 60, event.Xr.clientX + 60);
            mod.loadPopupContent();
        } else {
            console.log('No Module Matches This key/Type pair.');
        }
    }
}