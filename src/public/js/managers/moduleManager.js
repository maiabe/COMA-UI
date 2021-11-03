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
        if (invalidVariables([varTest(name, 'name', 'string'), varTest(category, 'category', 'string'), varTest(key, 'key', 'number')], 'ModuleManager', 'createNewModule')) return false;
        const module = this.#MG.generateNewModule(name, category);
        module.setData('key', key, key);
        const templateExists = this.moduleMap.has(key);
        this.#addModule(module, key);
        this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', { module: module, templateExists: templateExists }));
        return true;
    }

    /**
     * Loads the module into the gojs environment.
     * @param {string} name the name of the module
     * @param {string} category the category of the module (ie. output, processor, source).
     * @return true if successful, false if failure.
     */
    deployNewModule = (name, category) => {
        if (invalidVariables([varTest(name, 'name', 'string'), varTest(category, 'category', 'string')], 'ModuleManager', 'deployNewModule')) return false;
        this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'Request Module Key Event', { name: name, category: category, cb: this.createNewModule }));
        return true;
    };

    /**
     * Add a module to the moduleMap hash table.
     * @param {Module - object} module the module to add
     * @param {number} key the key to add
     * @return true if successful add, false if not.
     */
    #addModule = (module, key) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(key, 'key', 'number')], 'ModuleManager', '#addModule')) return false;
        this.moduleMap.set(key, module);
        return true;
    };

    /**
     * Removes a node from the hash table.
     * @param {number} key the key of the module to remove
     * @return true if successful, false if failure.
     */
    #removeModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', '#removeModule')) return false;
        if (this.moduleMap.has(key)) {
            this.moduleMap.delete(key);
            return true;
        } else printErrorMessage('no module found for key', `key: ${key} -- ModuleManager - #removeModule`);
        return false;
    };

    /**
     * Retrieves the module from the hash table.
     * @param {number} key the Key of the module to get.
     * @returns the module if it is found, undefined if not.
     */
    getModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'getModule')) return undefined;
        if (this.moduleMap.has(key)) return this.moduleMap.get(key);
        else printErrorMessage(`No module found`, `key ${key}. -- ModuleManager - getModule`);
        return undefined;
    };

    /**
     * Converts the array of node keys to actual modules and adds the modules to the overall model.
     * @param {Object containing links[] and nodes[]} model This is an object with 2 arrays, links and nodes. Nodes have data for key, type, and name.
     * @returns the updated model that includes the module objects. Returns undefined if the model is undefined.
     */
    getModulesForPipeline = model => {
        if (invalidVariables([varTest(model, 'model', 'object')], 'ModuleManager', 'getModulesForPipeline')) return undefined;
        model.nodes.forEach(node => node.module = this.getModule(node.key));
        return model;
    };

    /**
     * Gets the content necessary to pupulate the inspector.
     * @param {number} key the key of the module 
     * @returns the content necessary to populate the inspector for a specific module.
     */
    getInspectorContentForModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'getInspectorContentForPipeline')) return undefined;
        const module = this.getModule(key);
        if (module) {
            const content = module.getInspectorContent();
            if (!content) printErrorMessage(`undefined variable. No Content found`, `key: ${key}. -- ModuleManager -> getInspectorContentForPipeline`);
            return content;
        } else printErrorMessage('module is undefined', `key: ${key} -- ModuleManager -> getInspectorContentForModule`);
        return undefined;
    };

    /**
     * Gets the content necessary to populate a popup associated with a specific module.
     * @param {number} key the key of the module to get.
     * @returns the content for the popup.
     */
    getPopupContentForModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'getPopupContentForPipeline')) return undefined;
        const module = this.getModule(key);
        let content = undefined;
        if (module) {
            content = module.getPopupContent();
            if (!content) printErrorMessage(`undefined variable. No Content found`, `key: ${key}. -- ModuleManager -> getPopupContentForPipeline`);
        } else printErrorMessage('module is undefined', `key: ${key}. -- ModuleManager -> getPopupContentForModule`);
        return content;
    }

    /**
     * When a module has an upload event, this function constructs the filename and path to be read by the input manager.
     * @param {string} type they type of file (ie. csv)
     * @param {string} source the source of the file (ie html or local)
     * @param {string} path the path to the file, ie. the div id, or absolute path to the file system.
     * @param {number} key the module key associated with the file upload.
     */
    readFile = (type, source, path, key) => {
        if (invalidVariables([varTest(type, 'type', 'string'), varTest(source, 'source', 'string'), varTest(path, 'path', 'string'), varTest(key, 'key', 'number')], 'ModuleManager', 'readFile')) return false;
        this.publisher.publishMessage(new Message(INPUT_MANAGER, MODULE_MANAGER, 'Read File Event', { type: type, source: source, path: path, moduleKey: key }));
        return true;
    };

    /** This function is called when new data is added to the data Manager. The message will be handled by the hub.
     * The callback will be sent to the data manager. So see process New Data for the next step.
     * @param {number} key the key of the module associated with the new data.
     * @returns true if successful, false if missing data.
     */
    newDataLoaded = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'newDataLoaded')) return false;
        // Attach ProcessNewData function as callback. The Hub will call this function and pass the callback to the data manager.
        this.#sendMessage(new Message(DATA_MANAGER, MODULE_MANAGER, 'Data Request Event', { moduleKey: key, callBackFunction: this.processNewData }));
        return true;
    };

    /** Call Back function when new data is Requested. 
     * @param {number} key the module key associated with the data.
     * @param {object} data an object containing a type (ie. 'table') and a data structure (ie. DataTable).
     */
    processNewData = (key, data) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object')], 'ModuleManager', 'processNewData')) return;
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
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', { moduleKey: key }));
        } else printErrorMessage(`module undefined`, `key: ${key}. -- ModuleManager -> ProcessNewData`);
    };

    /**
     * This function will process data returned from the server. This data needs to be turned into a chart.
     * @param {Module} module The module associfated with the chart.
     * @param {object} data The data to plot.
     * @param {number} key The key of the module.
     */
    #processChart = (module, data, key) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(data, 'data', 'object'), varTest(key, 'key', 'number')], 'ModuleManager', '#processChart')) return;
        const type = this.#getChartType(module.getData('name'));
        if (type) this.#sendMessage(new Message(OUTPUT_MANAGER, MODULE_MANAGER, 'Create New Chart Event', { moduleKey: key, data: data, type: type, div: module.plotDiv }));
        else printErrorMessage(`type undefined`, `key: ${key}.--ModuleManager -> #processChart`);
    };

    /**
     * Converts the name of the chart module to the chart type for processing.
     * @param {string} chartName the Name of the module requesting the chart.
     * @returns string that plotly can use to make the chart.
     */
    #getChartType = chartName => {
        if (invalidVariables([varTest(chartName, 'chartName', 'string')], 'ModuleManager', '#getChartType')) return undefined;
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
    };

    /**
     * Processes the data returned from the server when it is a single value.
     * @param {Module} module the module associated with the returned number
     * @param {object} data contains the number to process
     */
    #processNumber = (module, data) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(data, 'data', 'object')], 'ModuleManager', '#processNumber')) return;
        module.addData('value', data.data, true, data.data, false);
        module.updatePopupText(data.data);
    }

    /**
     * Processes data rerturned from the server when a table is requested.
     * @param {Module} module the module associated with the output table.
     * @param {object} data the data to build the table from.
     */
    #processTable = (module, data) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(data, 'data', 'object')], 'ModuleManager', '#processTable')) return;
        // Updates the module data table for data access and the inspector.
        module.addData('Data Set', true, true, 'True', false);
        module.addData('Rows', data.data.getRows(), true, data.data.getRows(), false);
        module.addData('Columns', data.data.getColumns(), true, data.data.getColumns(), false);
        module.addData('Elements', data.data.getNumElements(), true, data.data.getNumElements(), false);
    }

    /**
     * Updates a field in the module data hash table.
     * @param {number} key the key that identifies the module to update
     * @param {string} field the field to update
     * @param {*} value the data to update
     * @returns true if successful, false if failure;
     */
    updateModuleDataTable = (key, field, value) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(field, 'field', 'string'), varTest(value, 'value', 'object')], 'ModuleManager', 'updateModuleDataTable')) return false;
        if (this.moduleMap.has(key)) {
            if (parseFloat(value)) value = parseFloat(value); // Check to see if the value is a string and should be converted to a number.
            this.moduleMap.get(key).setDataValue(field, value).updatePopupData(field);
            return true;
        } else printErrorMessage(`module undefined`, `key: ${key} --ModuleManager -> updateModuleDataTable`);
        return false;
    };

    /**
     * Called to update the inspector for a specific module.
     * @param {number} key the key of the module that has the correct inspector data.
     */
    requestInspectorUpdate = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'requestInspectorUpdate')) return;
        // Node Selected Event will load data for this node into the inspector.
        this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Node Selected Event', { moduleKey: key }));
    };

    /**
     * Sends a Message to all subscribers (should only be hub.)
     * @param {Message} msg the message object to send.
     */
    #sendMessage = msg => {
        if (invalidVariables([varTest(msg, 'msg', 'object')], 'ModuleManager', '#sendMessage')) return;
        this.publisher.publishMessage(msg);
    };
}
