class ModuleManager {
    #MG;          // Module Generator
    publisher;    // Message Publisher

    constructor() {
        this.#MG = new ModuleGenerator();
        this.publisher = new Publisher();
        this.moduleMap = new Map();
    };

    /**
     * Creates a new module by calling the module generator
     * @param {string} name name of the module.
     * @param {string} category category of the module (i.e. output, processor, source)
     * @param {number} key unique identifier of the module.
     * @return true if successful, false if not.
     */
    createNewModule = (name, category, key) => {
        if (key && category && name) {
            const templateExists = this.moduleMap.has(key);
            const module = this.#MG.generateNewModule(name, category);
            module.setData('key', key, key);
            this.#addModule(module, key);
            const data = { module: module, templateExists: templateExists };
            const msg = new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', data);
            this.#sendMessage(msg);
            return true;
        } else console.log(`ERROR: Missing Value -> name: ${name}, category: ${category}, key: ${key} -- ModuleManager - createNewModule`);
        return false;
    }

    /**
     * Loads the module into the gojs environment.
     * @param {string} name the name of the module
     * @param {string} category the category of the module (ie. output, processor, source).
     * @return true if successful, false if failure.
     */
    deployNewModule = (name, category) => {
        if (name && category) {
            const data = { name: name, category: category, cb: this.createNewModule };
            const msg = new Message(ENVIRONMENT, MODULE_MANAGER, 'Request Module Key Event', data);
            this.#sendMessage(msg);
            return true;
        } else console.log(`ERROR: Missing Parameter value for name: ${name} or category: ${category} -- Module Manager - deployNewModule`);
        return false;
    };

    /**
     * Add a module to the moduleMap hash table.
     * @param {Module} module the module to add
     * @param {number} key the key to add
     * @return true if successful add, false if not.
     */
    #addModule = (module, key) => {
        if (module) {
            if (key) {
                this.moduleMap.set(key, module);
                return true;
            } else console.log(`ERROR: key: ${key}. -- Module Manager - add module`);
        } else console.log(`ERROR: module is undefined. -- Module Manager - add module.`)
        return false;
    };

    /**
     * Removes a node from the hash table.
     * @param {number} key the key of the module to remove
     * @return true if successful, false if failure.
     */
    #removeModule = key => {
        if (key) {
            if (this.moduleMap.has(key)) {
                this.moduleMap.delete(key);
                return true;
            } else console.log(`ERROR: key: ${key} does not exist in the Module Map hash table. -- ModuleManager - $removeModule`);
        } else console.log(`ERROR: key: ${key}. -- ModuleManager - #removeModule`);
        return false;
    };

    /**
     * Retrieves the module from the hash table.
     * @param {number} key the Key of the module to get.
     * @returns the module if it is found, undefined if not.
     */
    getModule = key => {
        if (key) {
            if (this.moduleMap.has(key)) return this.moduleMap.get(key);
            else console.log(`ERROR: No module found for key ${key}. -- ModuleManager - getModule`);
        } else console.log(`ERROR: Key: ${key}. -- ModuleManager - getModule`);
        return undefined;
    };

    /**
     * Converts the array of node keys to actual modules and adds the modules to the overall model.
     * @param {Object containing links[] and nodes[]} model This is an object with 2 arrays, links and nodes. Nodes have data for key, type, and name.
     * @returns the updated model that includes the module objects. Returns undefined if the model is undefined.
     */
    getModulesForPipeline = model => {
        if (model) model.nodes.forEach(node => node.module = this.getModule(node.key));
        else console.log(`ERROR: Model is undefined. -- ModuleManager - getModulesForPipeline`);
        return model;
    };

    /**
     * Gets the content necessary to pupulate the inspector.
     * @param {number} key the key of the module 
     * @returns the content necessary to populate the inspector for a specific module.
     */
    getInspectorContentForModule = key => {
        if (key) {
            const module = this.getModule(key);
            if (module) {
                const content = module.getInspectorContent();
                if (content) return content;
            } else console.log(`ERROR: Module is undefined for key: ${key}. -- ModuleManager getInspectorContentForModule`);
        } else console.log(`ERROR: Key: ${key}. -- Module Manager - getInspectorContentForModule`);
        return undefined;
    };

    /**
     * Gets the content necessary to populate a popup associated with a specific module.
     * @param {number} key the key of the module to get.
     * @returns the content for the popup.
     */
    getPopupContentForModule = key => {
        if (key) {
            const module = this.getModule(key);
            if (module) {
                const content = module.getPopupContent();
                if (content) return content;
            } else console.log(`ERROR: Module is undefined for key: ${key}. -- ModuleManager getPopupContentForModule`);
        } else console.log(`ERROR: Key: ${key}. -- Module Manager - getPopupContentForModule`);
        return undefined;
    }

    /**
     * When a module has an upload event, this funciton constructs the filename and path to be read by the input manager.
     * @param {string} type they type of file (ie. csv)
     * @param {string} source the source of the file (ie html or local)
     * @param {string} path the path to the file, ie. the div id, or absolute path to the file system.
     * @param {number} key the module key associated with the file upload.
     */
    readFile = (type, source, path, key) => {
        if (type && source && path && key) {
            const data = {
                type: type,
                source: source,
                path: path,
                moduleKey: key
            };
            // Notify Input Manager to read the file.
            const msg = new Message(INPUT_MANAGER, MODULE_MANAGER, 'Read File Event', data);
            this.publisher.publishMessage(msg);
            return true;
        } else (`ERROR: Parameters-- type: ${type}, source: ${source}, path: ${path}, key: ${key} -- ModuleManger - ReadFile`);
        return false;
    };

    /** This function is called when new data is added to the data Manager. The message will be handled by the hub.
     * The callback will be sent to the data manager. So see process New Data for the next step.
     * @param {number} key the key of the module associated with the new data.
     * @returns true if successful, false if missing data.
     */
    newDataLoaded = key => {
        if (key) {
            // Attach ProcessNewData function as callback. The Hub will call this function and pass the callback to the data manager.
            const data = { moduleKey: key, callBackFunction: this.processNewData };
            const msg = new Message(DATA_MANAGER, MODULE_MANAGER, 'Data Request Event', data);
            this.#sendMessage(msg);
            return true;
        } else console.log(`ERROR: Key: ${key}. -- ModuleManager - newDataLoaded`);
        return false;
    };

    /** Call Back function when new data is Requested. 
     * @param {number} key the module key associated with the data.
     * @param {object} data an object containing a type (ie. 'table') and a data structure (ie. DataTable).
     */
    processNewData = (key, data) => {
        if (data) {
            if (key) {
                const module = this.getModule(key);
                if (module) {
                    switch (data.type) {
                        case 'table':
                            this.#processTable(module, data);
                            break;
                        case 'number':
                            this.#processNumber(module, data);
                            break
                        case 'object':
                            this.#processChart(module, data, key);
                            break;
                    }
                    // Notify Hub (Node Selected Event is used to update Inspector Data)
                    const messageData = { moduleKey: key };
                    const msg = new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', messageData);
                    this.#sendMessage(msg);
                } else console.log(`ERROR: Module was not Found for key ${key}. -- ModuleManager -> ProcessNewData`);
            } else console.log(`ERROR: Key: ${key}. -- ModuleManager - processNewData`);
        } else console.log(`ERROR: Cannot process data, data === undefined. -- ModuleManager - processNewData`);
    };
    /**
     * This function will process data returned from the server. This data needs to be turned into a chart.
     * @param {Module} module The module associfated with the chart.
     * @param {object} data The data to plot.
     * @param {number} key The key of the module.
     */
    #processChart = (module, data, key) => {
        if (module) {
            if (data) {
                if (key) {
                    const type = this.#getChartType(module.getData('name'));
                    if (type) {
                        const messageData = {
                            moduleKey: key,
                            data: data,
                            type: type,
                            div: module.plotDiv
                        }
                        const msg = new Message(OUTPUT_MANAGER, MODULE_MANAGER, 'Create New Chart Event', messageData);
                        this.#sendMessage(msg);
                    } else console.log(`ERROR: ChartType was not found for module with key: ${key}. -- ModuleManager -> #processChart`);
                } else console.log(`ERRROR: key: ${key}. -- ModuleManager - #processChart`);
            } else console.log(`ERROR: data === undfined. Cannot build the chart without data. -- Module Manager - #processChart`);
        } else console.log(`ERROR: module === undefined. Cannot build a chart. -- Module Manager - #processChart`);
    };

    /**
     * Converts the name of the chart module to the chart type for processing.
     * @param {string} chartName the Name of the module requesting the chart.
     * @returns string that plotly can use to make the chart.
     */
    #getChartType = chartName => {
        if (chartName) {
            switch (chartName) {
                case 'Bar Chart':
                    return 'bar';
                case 'Scatter Plot':
                    return 'scatter';
                case 'Line Chart':
                    return 'line';
                case 'Table':
                    return 'table';
                default:
                    return undefined;
            }
        } else console.log(`ERROR: No Chart name was found. -- ModuleManager -> #getChartType`)
    };

    /**
     * Processes the data returned from the server when it is a single value.
     * @param {Module} module the module associated with the returned number
     * @param {object} data contains the number to process
     */
    #processNumber = (module, data) => {
        if (module && data) {
            module.addData('value', data.data, true, data.data, false);
            module.updatePopupText(data.data);
        } else console.log(`ERROR: module: ${module}, data: ${data}. -- Module Manager -> #processNumber`);
    }

    /**
     * Processes data rerturned from the server when a table is requested.
     * @param {Module} module the module associated with the output table.
     * @param {object} data the data to build the table from.
     */
    #processTable = (module, data) => {
        if (module && data) {
            // Updates the module data table for data access and the inspector.
            module.addData('Data Set', true, true, 'True', false);
            module.addData('Rows', data.data.getRows(), true, data.data.getRows(), false);
            module.addData('Columns', data.data.getColumns(), true, data.data.getColumns(), false);
            module.addData('Elements', data.data.getNumElements(), true, data.data.getNumElements(), false);
        } else console.log(`ERROR: module: ${module}, data: ${data}. -- Module Manager -> #processTable`);
    }

    /**
     * Updates a field in the module data hash table.
     * @param {number} key the key that identifies the module to update
     * @param {string} field the field to update
     * @param {*} value the data to update
     * @returns true if successful, false if failure;
     */
    updateModuleDataTable = (key, field, value) => {
        if (key && field && value) {
            if (this.moduleMap.has(key)) {
                if (parseFloat(value)) value = parseFloat(value); // Check to see if the value is a string and should be converted to a number.
                try {
                    this.moduleMap.get(key).setDataValue(field, value).updatePopupData(field);
                } catch (e) {
                    return false;
                } finally {
                    return true;
                }
            } else console.log(`ERROR: no module found for key: ${key} -- ModuleManager -> updateModuleDataTable`);
        } else console.log(`ERROR: Missing parameter(s). key: ${key}, field: ${field}, value: ${value}. ModuleManager -> updateModuleDataTable`);
        return false;
    };

    /**
     * Called to update the inspector for a specific module.
     * @param {number} key the key of the module that has the correct inspector data.
     */
    requestInspectorUpdate = key => {
        if (key) {
            const messageData = {moduleKey: key};
            const msg = new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', messageData); // Node Selected Event will load data for this node into the inspector.
            this.#sendMessage(msg);
        } else console.log(`ERROR: key: ${key} -- ModuleManager -> requestInspectorUpdate`);

    };

    /**
     * Sends a Message to all subscribers (should only be hub.)
     * @param {Message} msg the message object to send.
     */
    #sendMessage = msg => {
        if (msg) {
            this.publisher.publishMessage(msg);
        } else console.log(`ERROR: cannot send null message. -- Module Manager -> #sendMessage`);
    };
}
