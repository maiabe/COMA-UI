import { ModuleGenerator, SaveCompositeModulePopupContent, PopupContentMaker } from './index.js';
import { Message, Publisher, Subscriber } from '../communication/index.js';
import { invalidVariables, printErrorMessage, varTest } from '../errorHandling/errorHandlers.js';
import { ENVIRONMENT, MODULE_MANAGER, MODULE, DATA_MANAGER, INPUT_MANAGER, OUTPUT_MANAGER, INSPECTOR, POPUP_MANAGER, WORKER_MANAGER } from '../sharedVariables/index.js';

export class ModuleManager {

    // Private Member Variables
    #MG;                  // Module Generator
    #moduleMap;           // Hash Table that stores modules {module key: module object}
    #compositePrefabMap;  // Stores the makeup of the prefabricated (ie. User created and saved) composite modules.
    #PCM;                 // Popup Content Maker

    constructor() {
        this.#MG = new ModuleGenerator();
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler.bind(this));
        this.#moduleMap = new Map();
        this.#compositePrefabMap = new Map();
        this.messageHandlerMap = new Map();
        this.#buildMessageHandlerMap();
        this.#PCM = new PopupContentMaker();
    };

    /* ########################## PRIVATE CLASS METHODS ##############################  */

    /** --- PRIVATE ---
     * Builds the hash table of functions required to handle events.
     */
    #buildMessageHandlerMap = () => {
        this.messageHandlerMap.set('Deploy Module Event', this.deployNewModule.bind(this));
    }

    /** --- PRIVATE ---
    * Sends a Message to all subscribers (should only be hub.)
    * @param {Message} msg the message object to send.
    */
    #sendMessage = msg => {
        if (invalidVariables([varTest(msg, 'msg', 'object')], 'ModuleManager', '#sendMessage')) return;
        this.publisher.publishMessage(msg);
    };

    /** --- PRIVATE ---
     * Creates a new module by calling the module generator. This function is called by the Environment as a callback after the Request Key Event.
     * @param {string} name name of the module.
     * @param {string} category category of the module (i.e. output, processor, source)
     * @param {number} key unique identifier of the module. ()
     * @param {int} oldKey -- ONLY USED BY COMPOSITE PREFAB NODES -- this is the key that was associted with the module when it was first saved. Must be overridden at creation.
     * @param {groupKey} -- ONLY USED BY COMPOSITE PREFAB NODES -- 
     * @return true if successful, false if not.
     */
    #createNewModule = (name, category, key, oldKey, groupKey) => {
        if (invalidVariables([varTest(name, 'name', 'string'), varTest(category, 'category', 'string'), varTest(key, 'key', 'number')], 'ModuleManager', 'createNewModule')) return false;
        try {
            const module = this.#MG.generateNewModule(name, category, key);  // This is the new module Instance.
            module.addData('oldKey', oldKey); // It is fine if this is undefined
            module.publisher.subscribe(this.subscriber);
            this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'New Module Created Event', { module: module, templateExists: this.#moduleMap.has(key), groupKey: groupKey }));
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorCard().getCard()  }));
            this.#addModule(module, key);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /** --- PRIVATE ---
     * Creates a new Composite Prefab Model.
     * @param {number} key unique indentifier of the module.
     * @param {object} groupData stores a JSON representation of the modules and links of the group.
     * @param {string} description description of the module written by the user who saved the prefab.
     */
    #createNewCompositePrefabModule = (key, groupData, description) => {
        try {
            const module = this.#MG.generateNewModule('CompositePrefab', 'Composite', key);
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorCard().getCard()  }));
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

    /** --- PRIVATE ---
     * When user clicks on the save composite model, this function generates a popup window with options to name and describe the new module.
     * They do the actual save event from this popup.
     * @param {JSON Object} groupInfo JSON representation of the node group.
     */
    #saveCompositeModule(groupInfo) {
        // Generate the Popup HTML element
        const saveContent = new SaveCompositeModulePopupContent(groupInfo, this.saveCompositeModuleCallback.bind(this));
        this.#sendMessage(new Message(POPUP_MANAGER, MODULE_MANAGER, 'Create Save Composite Popup Event', { color: saveContent.getColor(), content: saveContent.getContent(), headerText: saveContent.getHeaderText() }));
    }

    /** --- PRIVATE ---
     * Gets a module by its old key.
     * @param {Number} key this is the original key for a module that was created from a saved composite model. This key
     *                     refers to the object from the time it was saved, not this instance of the application. It can 
     *                     be used to find the right module when creating links and building the group when the prefab is first
     *                     created 
     * @returns the module or null.
     */
    #getModuleByOldKey(key) {
        let mod = null;
        this.#moduleMap.forEach(module => {
            const oldKey = module.getData('oldKey');
            if (oldKey === key) {
                mod = module;
            }
        });
        return mod;
    }

    /** --- PRIVATE ---
     * Add a module to the moduleMap hash table.
     * @param {Module} module the module to add
     * @param {number} key the key to add
     * @return true if successful add, false if not.
     */
    #addModule = (module, key) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(key, 'key', 'number')], 'ModuleManager', '#addModule')) return false;
        this.#moduleMap.set(key, module);
        return true;
    };

    /** --- PRIVATE ---
     * This is called to update the filter module's data and inspector cards when it is connected to a chain of modules
     * that includes local data.
     * @param {Number} toModule key to the filter module 
     * @param {Number} fromModule key to the module directly before the filter module in the new link. 
     */
    #updateModule_NewFilterConnection(toModule, fromModule) {
        let dataKey = fromModule.getData('dataKey');
        this.#sendMessage(
            new Message(DATA_MANAGER, MODULE_MANAGER, 'New Filter Applied Event',
                { filterFunction: toModule.getFilterDataFunction.bind(toModule), dataKey: dataKey }));
    }

    /** --- PRIVATE ---
     * This is called when a module is connected to a chain that includes a local data module. It updates some
     * flags and keys in the data table.
     * @param {Number} toModule 
     * @param {Number} fromModule 
     */
    #updateModule_LocalDataConnection(toModule, fromModule) {
        toModule.addData('linkedToData', true);
        toModule.addData('dataKey', fromModule.getData('dataKey'));
    }


    // ########################## PUBLIC CLASS METHODS ################################   

    /** --- PUBLIC ---
     * Passes messages from the Modules to the HUB to be executed.
     * @param {Message} msg the message to pass along the chain of command 
     */
    messageHandler = msg => {
        const message = msg.readMessage();
        if (message.to === MODULE_MANAGER) {
            try {
                this.messageHandlerMap.get(message.type)(message.data);
            } catch (e) {
                console.log(e);
            }
        } else if (message.to !== MODULE_MANAGER && message.from == MODULE) {
            msg.updateFrom(MODULE_MANAGER);
            this.#sendMessage(msg);
        }
    }

    /** --- PUBLIC ---
     * Subscribes to a publisher (Called in Init function in main.js to subscribe to ModuleSelectionMenu)
     * @param {Publisher} publisherToSubscribeTo 
     */
    addPublisher = publisherToSubscribeTo => {
        publisherToSubscribeTo.subscribe(this.subscriber);
    }


    /** --- PUBLIC ---
     * Creates a new composite Model
     * @param {number} key unique identifier of the module.
     * @param {groupData}
     * @return the new module or undefined if fail.
     */
    createNewCompositeModule = (key, groupData) => {
        try {
            const module = this.#MG.generateNewModule('Composite', 'Composite', key);
            this.#sendMessage(new Message(INSPECTOR, MODULE_MANAGER, 'Publish Module Inspector Card Event', { moduleKey: key, card: module.getInspectorCard().getCard() }));
            this.#addModule(module, key);
            module.setCompositeGroupInfo(groupData);
            module.setSaveModuleFunction(this.#saveCompositeModule.bind(this));
            return module;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    /** --- PUBLIC ---
     * Minimizes all Inspector Cards.
     */
    collapseAllInspectorCards() {
        this.#moduleMap.forEach((value, key) => {
            value.getInspectorCard().minimizeCard();
        });
    }

    /** --- PUBLIC ---
     * Stores a JSON representation of the Prefab model. This data is provided to the client from the NODE middleware, currently
     * from a file in localstorage.
     * @param {string} name the name of the module 
     * @param {JSON Object} moduleData a JSON representation of the entire composite model (nodes and links)
     */
    storeCompositePrefabData(name, moduleData) {
        this.#compositePrefabMap.set(name, moduleData);
    }

    /** -- PUBLIC ---
     * When a module is saved, this function is called by SaveCompositeModulePopupContent instance. This function is
     * passed when that instance is created.
     * @param {JSON Object
     * {
     * description: (string) The description of the save composite module (created by user)
     * name: (string) The name of the saved composite model (created by the user)
     * groupInfo: (Object) An array of nodes and an array of links.
     * }} data the data coorespoinding to the newly saved module.
     */
    saveCompositeModuleCallback(data) {
        console.log(data)
        if (data.name !== '') {
            this.#sendMessage(new Message(WORKER_MANAGER, MODULE_MANAGER, 'Save Composite Module Event', data));
        } else alert('Module Name Cannot Be Left Blank');
    }

    /** --- PUBLIC ---
     * Loads the module into the gojs environment.
     * @param {Object
     * {
     *  moduleName: (string) the name of the module being deployed. ex. 'CSV File'
     *  moduleCategory: (string) the category of the module being depolyed. ex. 'Source'
     *  type: (string) either composite or non-composite
     *  oldKey: (Number) a number representind a key of a saved module (will be overwritten, Optional)
     *  groupKey: (Number) a key representing the group membership (Optional: Only used with certain groups)
     * }} args The arguments passed in the message from the Module Selection Menu.
     * @return true 
     */
    deployNewModule = args => {
        if (args.type === 'non-composite') {
            this.#sendMessage(
                new Message(ENVIRONMENT, MODULE_MANAGER, 'Request Module Key Event',
                {
                    name: args.moduleName,
                    category: args.moduleCategory,
                    cb: this.#createNewModule,
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

    /** --- PUBLIC ---
     * When a prefab module is deployed, each of the individual modules are deployed as their own independent 
     * modules, linked with a group key. The information for each of these individual modes is stored in the 
     * compositePrefabMap under the name of the module. After the individual modules are built and deployed, any
     * saved links are created by the Environment.
     * 
     * @param {number} key this is the group key (originated from gojs Environment) 
     * @param {string} name the name of the composite module.
     */
    deployCompositeComponentsWithGroupKey = (key, name) => {
        const data = this.#compositePrefabMap.get(name);
        console.log(data)
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
            modulesInGroup.set(this.#getModuleByOldKey(node.key).getData('key'), this.#getModuleByOldKey(node.key));
        });
        // Connect Modules with saved links
        Object.values(data.groupInfo.links).forEach(link => {
            const from = this.#getModuleByOldKey(link.from);
            const to = this.#getModuleByOldKey(link.to);
            this.#sendMessage(new Message(ENVIRONMENT, MODULE_MANAGER, 'Draw Link Event', { from: from.getData('key'), to: to.getData('key') }));
        });
        this.#moduleMap.forEach(module => module.destroyOldKey());
        this.#createNewCompositePrefabModule(key, data.groupInfo, data.description);
    }

    /** --- PUBLIC ---
     * Removes a node from the hash table.
     * @param {number} key the key of the module to remove
     * @return true if successful, false if failure.
     */
    removeModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', '#removeModule')) return false;
        if (this.#moduleMap.has(key)) {
            const module = this.#moduleMap.get(key);
            module.deleteInspectorCard();
            this.#moduleMap.delete(key);
            return true;
        } else printErrorMessage('no module found for key', `key: ${key} -- ModuleManager - #removeModule`);
        return false;
    };

    /** --- PUBLIC ---
     * When a data module is generated, it connects to the module that generated the data. 
     * Search the module hash table and locate the unconnected module, then link them.
     * This is called by the Hub during a 'New Data Event'.
     * @param {number} key identifies the module tha generated the data.
     * @return {Module} the module that was modified or undefined.
     */
    connectDataModule(key) {
        let returnModule = undefined
        this.#moduleMap.forEach(module => {
            if (module.getData('isDataModule') !== undefined) { // Verify that this field exists in the data table
                if (module.getData('isDataModule')) {
                    if (module.getData('link') === -1) { // Varify that no link exists already
                        module.addData('link', key);
                        returnModule = module;
                        return; // Break the Loop
                    }
                }
            }
        });
        return returnModule;
    }

    /** --- PUBLIC ---
     * When a data module is generated, it connects to the table module that generated the data. 
     * Search the module hash table and locate the unconnected module, then link them.
     * This is called by the Hub during a 'New Table Event'.
     * @param {number} key identifies the module that generated the data.
     * @return {Module} the module that was modified or undefined.
     */
    connectTableModule(key) {
        let returnModule = undefined
        this.#moduleMap.forEach(module => {
            if (key !== -1) { // Verify that this module exists in the environment
                if (module.getData('link') === -1) { // Varify that no link exists already
                    module.addData('link', key);
                    returnModule = module;
                    return; // Break the Loop
                }
            }
        });
        return returnModule;
    }


    /** --- PUBLIC ---
     * Retrieves the module from the hash table.
     * @param {number} key the Key of the module to get.
     * @returns the module if it is found, undefined if not.
     */
    getModule = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'ModuleManager', 'getModule')) return undefined;
        if (this.#moduleMap.has(key)) return this.#moduleMap.get(key);
        else printErrorMessage(`No module found`, `key ${key}. -- ModuleManager - getModule`);
        return undefined;
    };

    /** --- PUBLIC ---
     * Converts the array of node keys to actual modules and adds the modules to the overall model. This function
     * is called by the HUB in the run() function. These values are passed to the PipelineManager for validation.
     * @param {Object containing links[] and nodes[]} model This is an object with 2 arrays, links and nodes. Nodes have data for key, type, and name.
     * @returns the updated model that includes the module objects. Returns undefined if the model is undefined.
     */
    getModulesForPipeline = model => {
        if (invalidVariables([varTest(model, 'model', 'object')], 'ModuleManager', 'getModulesForPipeline')) return undefined;
        model.nodes.forEach(node => node.module = this.getModule(node.key));
        return model;
    };

    /** --- PUBLIC ---
     * Gets the content necessary to populate a popup associated with a specific module.
     * Is utilized any time a new popup is created and is called by the Hub. (doubleClickEvent(), createNewChartEvent(), etc.)
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


    /***************** Mai 022823 ******************/
    /** --- PUBLIC ---
     * Create updated popup content and update popup for this module. 
     * @param {number} key the key of the module to get.
     * @param {string} type the type of the resulting display.
     * @param {object} data data to update to.
     */
    updatePopupContentForModule(moduleKey, data) {
        const module = this.getModule(moduleKey);
        let content = undefined;
        if (module) {
            // switch statement for each type of display (data.type)

            // create content for this module
            content = this.#PCM.setSearchResultTable(data.data);
            console.log(data.data);

            // update module with this content
            module.updatePopupContent(content);
        } else printErrorMessage('module is undefined', `key: ${key}. -- ModuleManager -> setPopupContentForModule`);
    }




    /** --- PUBLIC ---
     * When a new link is drawn between 2 modules, this function checks to see if the link is drawn between a composite data module and some
     * other module such as an output. This does not return true if the connection is made with a processor. Those are handled by a different
     * set of module specific functions. This is called by the Hub on a Link Drawn Event.
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
            if (fromModule.getData('isDataModule') && toModule.getData('type') !== 'Processor' ||
                fromModule.getData('linkedToData') && toModule.getData('type') !== 'Processor') return true;
        }
        return false;
    }

    /** --- PUBLIC ---
     * Called by the Hub on Link Drawn Event. This function checks to see if there is metadata available in the from
     * node of the newly drawn link.
     * @param {Number} from the key to the from node in the new link. 
     * @returns true if the checked node has stored metadata. False if otherwise.
     */
    checkForMetadataLink(from) {
        const fromModule = this.getModule(from);
        if (fromModule?.getData('linkedToData') && fromModule?.getData('metadata')) return true;
        else return false;
    }

    /** --- PUBLIC ---
     * Called by the hub at the end of the Link Drawn Event. If this flow chain contains a local data module such as the 
     * module created by a CSV file, the new module must have the flags set in its data table. Additionally, if this new
     * module is a filter module that is part of a chain with a local data module, it must get the metadata to build the 
     * inspector vard.
     * @param {Number} to key to the to node in the link.
     * @param {Number} from key to the from node in the link.
     */
    handleLocalDataConnection(to, from) {
        const toModule = this.getModule(to);
        const fromModule = this.getModule(from);
        if (fromModule.getData('linkedToData')) this.#updateModule_LocalDataConnection(toModule, fromModule);
        if (toModule.getData('name') === 'Filter') this.#updateModule_NewFilterConnection(toModule, fromModule);
    }

    /** --- PUBLIC ---
     * Dynamic Fields are updated when the variable changes. For instance, a new data link is made, the inspector card
     * may have a field for linked to data: false. This will be changed to true. Called by the HUB.
     * The inspector card maker will make the updates on the instpector card.
     * @param {Number} key key of the module who's data has changed 
     * @param {string} field the name of the field (ex. LinkedToData)
     * @param {any} value the new value.
     */
    updateDynamicInspectorCardField(key, field, value) {
        this.getModule(key).inspectorCardMaker.updateInspectorCardDynamicField(field, value);
    }

    /** --- PUBLIC ---
     * Updates a field in the module data hash table.
     * This is called by the Hub when there is a Value Change Event, such as a change in the inspector or a popup.
     * This may not be currently implemented 
     * @param {
     * {
     *  moduleKey (number) the module to select
     *  field (string) the field to change 
     *  newValue (any) the new value to set
     * }
     * } args
     * @returns true if successful, false if failure;
     */
    updateModuleDataTable = (args) => {
        if (this.#moduleMap.has(args.moduleKey)) {
            if (parseFloat(args.newValue)) args.newValue = parseFloat(args.newValue); // Check to see if the value is a string and should be converted to a number.
            this.#moduleMap.get(args.moduleKey).addData(args.field, args.value).updatePopupData(args.field);
            return true;
        } else printErrorMessage(`module undefined`, `key: ${args.moduleKey} --ModuleManager -> updateModuleDataTable`);
        return false;
    };

}
