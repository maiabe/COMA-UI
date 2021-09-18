class ModuleManager {
    #MG;          // Module Generator
    publisher;    // Message Publisher
    
    constructor() {
        this.#MG = new ModuleGenerator();
        this.publisher = new Publisher();
        this.nameArray = [];
        this.moduleArray = [];
    };

    createNewModule = (name, category) => {
        const templateExists = this.nameArray.includes(name) ? true: false;
        const mod = this.#MG.generateNewModule(name, category);
        this.#addModule(mod);
        const data = {module: mod, templateExists: templateExists};
        const msg = new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', data);
        this.#sendMessage(msg);
    }

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }

    /** Adds a module to the correct Array. 
     * @param module -> The module to add.
    */
    #addModule = module => {
        this.moduleArray.push(module);
        if (!this.nameArray.includes(module.getName())) {
            this.nameArray.push(module.getName());
        }
    };

    /** Removes the Module from the correct Array. 
     * @param key -> The key of the node.
     * @param the -> The type of the node.
    */
    #removeModule = (key, type) => {
        this.moduleArray.forEach((e, index) => {
            if (e.getKey() === key) {
                this.moduleArray.splice(index, 1);
            }
        });
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

    getInspectorContentForModule = key => {
        console.log(key);
        console.log(this.getModule(key));
        return this.getModule(key).getInspectorContent();
    };
}