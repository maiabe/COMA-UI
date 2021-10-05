class ModuleManager {
    #MG;          // Module Generator
    publisher;    // Message Publisher

    constructor() {
        this.#MG = new ModuleGenerator();
        this.publisher = new Publisher();
        this.moduleMap = new Map();
    };

    createNewModule = (name, category, key) => {
        const templateExists = this.moduleMap.has(key);
        const mod = this.#MG.generateNewModule(name, category);
        mod.setKey(key);
        console.log(mod);
        this.#addModule(mod);
        const data = {
            module: mod,
            templateExists: templateExists
        };
        const msg = new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', data);
        this.#sendMessage(msg);
    }

    deployNewModule = (name, category) => {
        const data = { name: name, category: category, cb: this.createNewModule };
        const msg = new Message(ENVIRONMENT, MODULE_MANAGER, 'Request Module Key Event', data);
        this.#sendMessage(msg);
    };

    /** Adds a module to the correct Array. 
     * @param module -> The module to add.
    */
    #addModule = module => {
        this.moduleMap.set(module.getKey(), module);
    };

    /** Removes the Module from the correct Array. 
     * @param key -> The key of the node.
     * @param the -> The type of the node.
    */
    #removeModule = (key) => {
        this.moduleMap.delete(key);
    };

    /** Gets a module from the correct array
     * @param key -> The key of the node.
     * @param type -> The type of the node.
     */
    getModule = key => {
        return this.moduleMap.get(key);
    };

    /** Gets the actual modules to add to the pipeline */
    getModulesForPipeline = model => {
        model.nodes.forEach(n => {
            const mod = this.getModule(n.key);
            n.module = mod;
        });
        return model;
    };

    getInspectorContentForModule = key => {
        return this.getModule(key).getInspectorContent();
    };

    getPopupContentForModule = key => {
        return this.getModule(key).getPopupContent();
    }

    /** When a file is uploaded to the HTML page, a nessage is sent for the Input Manager
     * To read the file.
     * @param type they type of file (ie. csv)
     * @param source the source of the file (ie html or local)
     * @param path the path to the file, ie. the div id, or absolute path to the file system.
     */
    readFile = (type, source, path, key) => {
        const data = {
            type: type,
            source: source,
            path: path,
            moduleKey: key
        };
        const msg = new Message(INPUT_MANAGER, MODULE_MANAGER, 'Read File Event', data);
        this.publisher.publishMessage(msg);
    };

    /** This function is called when new data is added to the data Manager.
     * @param key the key of the module associated with the new data.
     */
    newDataLoaded = key => {
        const data = { moduleKey: key, cb: this.processNewData };
        const msg = new Message(DATA_MANAGER, MODULE_MANAGER, 'Data Request Event', data);
        this.#sendMessage(msg);
    };

    /** Call Back function when new data is Requested. 
     * @param key the module key associated with the data.
     * @param data an object containing a type (ie. 'table') and a data structure (ie. DataTable).
     */
    processNewData = (key, data) => {
        console.log('type => ' + data.type);
        switch (data.type) {
            case 'table':
                const mod = this.getModule(key);
                mod.addInspectorContent('Data Set', true);
                mod.addInspectorContent('Rows', data.data.getRows());
                mod.addInspectorContent('Columns', data.data.getColumns());
                mod.addInspectorContent('Elements', data.data.getNumElements());
                
                break;
            case 'number':
                this.moduleMap.get(key).setData(data.data, data.type);
                break
        }

        const messageData = {
            moduleKey: key
        };
        const msg = new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', messageData);
        this.#sendMessage(msg);
    };

    parseOutputs = outputArray => {

    };

    requestInspectorUpdate = key => {
        const messageData = {
            moduleKey: key
        };
        const msg = new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', messageData);
        this.#sendMessage(msg);
    };

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };
}
