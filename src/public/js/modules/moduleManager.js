import { ModuleGenerator, SaveCompositeModulePopupContent } from './index.js';
import { Message, Publisher, Subscriber } from '../communication/index.js';
import { invalidVariables, printErrorMessage, varTest } from '../errorHandling/errorHandlers.js';
import { ENVIRONMENT, MODULE_MANAGER, MODULE, DATA_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, INSPECTOR, POPUP_MANAGER, WORKER_MANAGER } from '../sharedVariables/index.js';

export class ModuleManager {
    #MG;          // Module Generator
    publisher;    // Message Publisher
    moduleMap;    // Hash Table that stores modules {module key: module object}
    subscriber;
    compositePrefabMap;

    constructor() {
        this.#MG = new ModuleGenerator();
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler.bind(this));
        this.moduleMap = new Map();
        this.compositePrefabMap = new Map();
        this.messageHandlerMap = new Map();
        this.#buildMessageHandlerMap();
    };

    #buildMessageHandlerMap = () => {
        this.messageHandlerMap.set('Emit Data Conversion Event', this.emitDataConversionEvent.bind(this));
        this.messageHandlerMap.set('Emit Data Type Change Request', this.emitDataTypeChangeRequest.bind(this));
        this.messageHandlerMap.set('Emit Local Chart Event', this.emitLocalChartEvent.bind(this));
        this.messageHandlerMap.set('Emit Create CSV Event', this.emitCreateCSVEvent.bind(this));
        this.messageHandlerMap.set('Emit Local Table Event', this.emitLocalTableEvent.bind(this));
        this.messageHandlerMap.set('Request List of Objects', this.requestListOfObjects.bind(this));
        this.messageHandlerMap.set('Deploy Module Event', this.deployNewModule.bind(this));
    }

    /**
     * Passes messages from the Modules to the HUB to be executed.
     * @param {Message} msg the message to pass along the chain of command 
     */
    messageHandler = msg => {
        const message = msg.readMessage();
        console.log(message);
        if (message.to === MODULE_MANAGER) {
            try {
                this.messageHandlerMap.get(message.data.type)(message.data.args);
            } catch (e) {
                console.log(e);
            }
        } else if (message.to !== MODULE_MANAGER && message.from == MODULE) {
            msg.updateFrom(MODULE_MANAGER);
            this.#sendMessage(msg);
        }
    }

    addPublisher = publisherToSubscribeTo => {
        publisherToSubscribeTo.subscribe(this.subscriber);
    }

    /**
     * Creates a new module by calling the module generator. This function is called by the Environment as a callback after the Request Key Event.
     * @param {string} name name of the module.
     * @param {string} category category of the module (i.e. output, processor, source)
     * @param {number} key unique identifier of the module. ()
     * @param {int} oldKey -- ONLY USED BY COMPOSITE PREFAB NODES -- this is the key that was associted with the module when it was first saved. Must be overridden at creation.
     * @param {groupKey} -- ONLY USED BY COMPOSITE PREFAB NODES -- 
     * @return true if successful, false if not.
     */
    createNewModule = (name, category, key, oldKey, groupKey) => {
        if (invalidVariables([varTest(name, 'name', 'string'), varTest(category, 'category', 'string'), varTest(key, 'key', 'number')], 'ModuleManager', 'createNewModule')) return false;
        try {
            const module = this.#MG.generateNewModule(name, category, key);  // This is the new module Instance.
            module.addData('oldKey', oldKey); // It is fine if this is undefined
            module.publisher.subscribe(this.subscriber);
            this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', { module: module, templateExists: this.moduleMap.has(key), groupKey: groupKey }));
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorContent() }));
            this.#addModule(module, key);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * Creates a new composite Model
     * @param {number} key unique identifier of the module.
     * @param {groupData}
     * @return the new module or undefined if fail.
     */
    createNewCompositeModule = (key, groupData) => {
        try {
            const module = this.#MG.generateNewModule('Composite', 'Composite', key);
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorContent() }));
            this.#addModule(module, key);
            module.setCompositeGroupInfo(groupData);
            module.setSaveModuleFunction(this.saveCompositeModule.bind(this));
            return module;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    /** Creates a new Composite Prefab Model.
     * @param {number} key unique indentifier of the module.
     * @param {object} groupData stores a JSON representation of the modules and links of the group.
     * @param {string} description description of the module written by the user who saved the prefab.
     */ 
    createNewCompositePrefabModule = (key, groupData, description) => {
        try {
            const module = this.#MG.generateNewModule('CompositePrefab', 'Composite', key);
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorContent() }));
            this.#addModule(module, key);
            module.setCompositeGroupInfo(groupData);
            module.addData('description', description);
            module.createInspectorCardData();
            return module;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    collapseAllInspectorCards() {
        this.moduleMap.forEach((value, key) => {
            value.getInspectorCard().minimizeCard();
        });
    }

    storeCompositePrefabData(name, moduleData) {
        this.compositePrefabMap.set(name, moduleData);
    }

    saveCompositeModule(groupInfo) {
        const saveContent = new SaveCompositeModulePopupContent(groupInfo, this.saveCompositeModuleCallback.bind(this));
        this.#sendMessage(new Message(POPUP_MANAGER, MODULE_MANAGER, 'Create Save Composite Popup Event', { color: saveContent.getColor(), content: saveContent.getContent(), headerText: saveContent.getHeaderText() }));
        // this.#sendMessage(new Message(WORKER_MANAGER, MODULE_MANAGER, 'Save Composite Module Event', {groupInfo: groupInfo}));
    }

    saveCompositeModuleCallback(data) {
        if (data.name !== '') {
            this.#sendMessage(new Message(WORKER_MANAGER, MODULE_MANAGER, 'Save Composite Module Event', data));
        } else alert('Module Name Cannot Be Left Blank');
    }

    /**
     * Loads the module into the gojs environment.
     * @param {string} name the name of the module
     * @param {string} category the category of the module (ie. output, processor, source).
     * @return true if successful, false if failure.
     */
    // deployNewModule = (name, category, oldKey, groupKey) => {
    deployNewModule = args => {
        console.log(args.moduleName);
        if (args.type === 'non-composite') {
            this.#sendMessage(
                new Message(ENVIRONMENT, MODULE_MANAGER, 'Request Module Key Event',
                    {
                        name: args.moduleName,
                        category: args.moduleCategory,
                        cb: this.createNewModule,
                        oldKey: args.oldKey,
                        groupKey: args.groupKey
                    }));
        } else {
            this.#sendMessage(
                new Message(ENVIRONMENT, MODULE_MANAGER, 'Create Composite Group Event',
                    {
                        callback: this.deployCompositeComponentsWithGroupKey.bind(this),
                        name: args.moduleName
                    }));
        }
        return true;
    };

    /**
     * When a prefab module is deployed, each of the individual modules are deployed as their own independent 
     * modules, linked with a group key. The information for each of these individual modes is stored in the 
     * compositePrefabMap under the name of the module. After the individual modules are built and deployed, any
     * saved links are created by the Environment.
     * 
     * @param {number} key this is the group key (originated from gojs) 
     * @param {*} name the name of the composite module.
     */
    deployCompositeComponentsWithGroupKey = (key, name) => {
        const data = this.compositePrefabMap.get(name);
        const modulesInGroup = new Map();
        Object.values(data.groupInfo.nodes).forEach(node => {
            const args = {
                moduleName: node.type,
                moduleCategory: node.name,
                oldKey: node.key,
                groupKey: key,
                type: 'non-composite'
            }
            this.deployNewModule(args);
            modulesInGroup.set(this.getModuleByOldKey(node.key).getData('key'), this.getModuleByOldKey(node.key));
        });
        // Connect Modules with saved links
        Object.values(data.groupInfo.links).forEach(link => {
            const from = this.getModuleByOldKey(link.from);
            const to = this.getModuleByOldKey(link.to);
            this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'Draw Link Event', { from: from.getData('key'), to: to.getData('key') }));
        });
        this.moduleMap.forEach(module => module.destroyOldKey());
        this.createNewCompositePrefabModule(key, data.groupInfo, data.description);
    }

    getModuleByOldKey(key) {
        let mod = null;
        this.moduleMap.forEach(module => {
            const oldKey = module.getData('oldKey');
            if (oldKey === key) {
                mod = module;
            }
        });
        return mod;
    }



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
    removeModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', '#removeModule')) return false;
        if (this.moduleMap.has(key)) {
            const module = this.moduleMap.get(key);
            module.deleteInspectorCard();
            this.moduleMap.delete(key);
            return true;
        } else printErrorMessage('no module found for key', `key: ${key} -- ModuleManager - #removeModule`);
        return false;
    };

    /**
     * When a data module is generated, it connects to the module that generated the data. Search the module hash table and
     * locate the unconnected module, then link them.
     * @param {number} key identifies the module tha generated the daya.
     * @return {Module} the module that was modified or undefined.
     */
    connectDataModule(key) {
        let module = undefined;
        this.moduleMap.forEach(element => {
            if (element.getData('isDataModule') !== undefined) {
                if (element.getData('isDataModule') === true) {
                    if (element.getData('link') === -1) {
                        element.setDataValue('link', key);
                        module = element;
                    }
                }
            }
        });
        return module;
    }

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
    readFile = args => {
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
        console.log('test');
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
     * When a new link is drawn between 2 modules, this function checks to see if the link is drawn between a composite data module and some
     * other module, such as output or data filter processor. 
     * @param {number} to key to the module from is linked to 
     * @param {number} from key to the module from is linked from
     * @returns true if link contains a data module, false if not.
     */
    checkForNewDataLink(to, from) {
        if (invalidVariables([varTest(to, 'to', 'number'), varTest(from, 'from', 'number')], 'Module Manager', 'checkForNewDataLink')) return false;
        const toModule = this.getModule(to);
        const fromModule = this.getModule(from);
        if (!toModule || !fromModule) {
            printErrorMessage(`Missing Module`, `to: ${toModule}, from: ${fromModule}. --ModuleManager -> checkForNewDataLink`);
        } else {
            if (fromModule.getData('isDataModule') && toModule.getData('type') !== 'Processor') return true;
            if (fromModule.getData('linkedToData') && toModule.getData('type') !== 'Processor') return true;
        }
        return false;
    }


    checkForMetadataLink(from) {
        const fromModule = this.getModule(from);
        if (fromModule?.getData('linkedToData') && fromModule?.getData('metadata')) return true;
        else return false;
    }


    checkForLocalDataConnection(to, from) {
        const toModule = this.getModule(to);
        const fromModule = this.getModule(from);
        if (fromModule.getData('linkedToData')) this.updateModule_LocalDataConnection(toModule, fromModule);
        if (toModule.getData('name') === 'Filter') this.updateModule_NewFilterConnection(toModule, fromModule);
    }

    updateModule_NewFilterConnection(toModule, fromModule) {
        let dataKey = fromModule.getData('dataKey');
        this.#sendMessage(new Message(DATA_MANAGER, MODULE_MANAGER, 'New Filter Applied Event', { filterFunction: toModule.getFilterDataFunction.bind(toModule), dataKey: dataKey }));
    }

    updateModule_LocalDataConnection(toModule, fromModule) {
        toModule.addData('linkedToData', true);
        toModule.addData('dataKey', fromModule.getData('dataKey'));
    }

    updateDynamicInspectorCardField(key, field, value) {
        this.getModule(key).inspectorCardMaker.updateInspectorCardDynamicField(field, value);
    }

    updateMetadataToLinkedNodes(key, metadata, numColumns) {
        this.moduleMap.forEach(module => {
            const oldKey = module.getData('dataKey');
            if (oldKey === key) {
                module.processMetadataChange(metadata);
                try {
                    module.updateInspectorCardForModifiedMetadata(1);
                } catch (e) { }
            }
        });
    }

    /**
     * This function forwards a message along the chain of command to the HUB
     * @param {{
     * datasetKey: (number) the id to reference the data in DataManager,
     * moduleKey: (number)
     * fieldData: (object) stores the chart data information
     * div: (HTML Div) the html element to plot the chart,
     * type: (string) the type of chart to build
     * }} args 
     */
    emitLocalChartEvent(args) {
        this.#sendMessage(new Message(OUTPUT_MANAGER, MODULE_MANAGER, 'Create New Local Chart Event', args));
    }

    /**
    * This function forwards a message along the chain of command to the HUB
    * @param {{
    * datasetKey: (number) the id to reference the data in DataManager,
    * moduleKey: (number)
    * fieldData: (object) stores the chart data information
    * div: (HTML Div) the html element to plot the chart,
    * type: (string) the type of chart to build -- should be 'table'
    * }} args 
    */
    emitLocalTableEvent(args) {
        this.#sendMessage(new Message(OUTPUT_MANAGER, MODULE_MANAGER, 'Create New Local Table Event', args));
    }

    /**
    * This function forwards a message along the chain of command to the HUB
    * @param {{
     * datasetKey: (number) the id to reference the data in DataManager,
     * moduleKey: (number)
     * fieldData: (object) stores the chart data information
     * }} args 
     */
    emitCreateCSVEvent(args) {
        console.log(args)
        this.#sendMessage(new Message(OUTPUT_MANAGER, MODULE_MANAGER, 'Create New CSV File Event', args));
    }

    requestListOfObjects(callbackFunction) {
        this.#sendMessage(new Message(INPUT_MANAGER, MODULE_MANAGER, 'Request List Of Objects Event', { callbackFunction: callbackFunction }));
    }

    /**
     * This function passes the message from the Data Converter module to the Hub to the Data Manager.
     * @param {object: {
     *  dataKey : number referencing data stored by DataManager
     *  key     : number module key
     *  conversionDetails : {
     *                         fn : function -- the conversion function
     *                         outputFieldName string -- the new column name after conversion
     *                         input: string -- the name of the column that is input into the conversion function }
     * }} args Arguments passed to the data converter stored on the DataManager
     */
    emitDataConversionEvent(args) {
        this.#sendMessage(new Message(DATA_MANAGER, MODULE_MANAGER, 'Data Conversion Event',
            {
                conversionFunction: args.conversionDetails.fn,
                outputFieldName: args.conversionDetails.outputFieldName,
                inputFieldName: args.conversionDetails.input,
                key: args.dataKey,
                moduleKey: args.moduleKey
            }));
    }

    /**
     * This function passes the message from the Filter module to the HUB when a data type is changed in a Filter Module
     * @param {{
     * metadata: (object) the metadata for a dataset
     * dataKey: (number) the id of the data on the DataManager
     * moduleKey: (number) the id of the filter Module
     * field: (string) the name of the field to change type
     * oldType: (string)
     * newType: (string)
     * callback: an update function called upon completion.
     * updateMetadataCallback: (function) forward propogate any changes.
     * }} args 
     */
    emitDataTypeChangeRequest(args) {
        this.#sendMessage(new Message(DATA_MANAGER, MODULE_MANAGER, 'Data Type Change Event', args));
    }

    /**
     * This function will process data returned from the server. This data needs to be turned into a chart.
     * @param {Module} module The module associated with the chart.
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
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(field, 'field', 'string')], 'ModuleManager', 'updateModuleDataTable')) return false;
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
