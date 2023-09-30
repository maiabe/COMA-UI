import { Publisher, Subscriber } from "../communication/index.js";
import { GM } from '../main.js';
import { ENVIRONMENT, MODULE_MANAGER, INSPECTOR, POPUP_MANAGER, INPUT_MANAGER, DATA_MANAGER, WORKER_MANAGER, OUTPUT_MANAGER, DOM_MANAGER, INSPECTOR_CARD } from '../sharedVariables/constants.js';
import { invalidVariables, printErrorMessage, varTest } from "../errorHandling/errorHandlers.js";
import { format_mapping, decimalAlignFormatter, getNumDigits } from '../sharedVariables/formatValues.js';
import { SearchFields } from '../sharedVariables/moduleData.js';

/* Envionment Data Table is the central communication hub of the application. All Messages
are routed through this singleton class. */
export default class Hub {

    publisher;  // publisher. Emits messages to subscribers.
    subscriber; // subscriber variable
    GM;
    
    #messageHandlerMap;
    #messageForOutputManager;
    #messageForDataManager;
    #messageForWorkerManager;
    #messageForInputManager;
    #messageForPopupManager;
    #messageForInspector;
    #messageForModuleManager;
    #messageForEnvironment;

    constructor() {
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler);
        this.#messageHandlerMap = new Map();
        this.#buildMessageHandlerMap();
    };

    #buildMessageHandlerMap() {
        this.#messageForOutputManager = new Map();
        this.#buildMessageForOutputManagerMap();
        this.#messageForDataManager = new Map();
        this.#buildMessageForDataManagerMap();
        this.#messageForWorkerManager = new Map();
        this.#buildMessageForWorkerManagerMap();
        this.#messageForInputManager = new Map();
        this.#buildMessageForInputManager();
        this.#messageForPopupManager = new Map();
        this.#buildMessageForPopupManager();
        this.#messageForInspector = new Map();
        this.#buildMessageForInspector();
        this.#messageForModuleManager = new Map();
        this.#buildMessageForModuleManager();
        this.#messageForEnvironment = new Map();
        this.#buildMessageForEnvironment();
        this.#messageHandlerMap.set(ENVIRONMENT, this.#messageForEnvironment);
        this.#messageHandlerMap.set(MODULE_MANAGER, this.#messageForModuleManager);
        this.#messageHandlerMap.set(INSPECTOR, this.#messageForInspector);
        this.#messageHandlerMap.set(POPUP_MANAGER, this.#messageForPopupManager);
        this.#messageHandlerMap.set(INPUT_MANAGER, this.#messageForInputManager);
        this.#messageHandlerMap.set(DATA_MANAGER, this.#messageForDataManager);
        this.#messageHandlerMap.set(WORKER_MANAGER, this.#messageForWorkerManager);
        this.#messageHandlerMap.set(OUTPUT_MANAGER, this.#messageForOutputManager);
    }

    /* All Messages from one component to another are handled here. The proper manager is notified through
    the Global Manager. */
    messageHandler = msg => {
        const msgContents = msg.readMessage();
        console.log(msgContents.type);   // Console Log All Events for Debugging.
        if (this.#messageHandlerMap.has(msgContents.to)) {
            if (this.#messageHandlerMap.get(msgContents.to).has(msgContents.type)) {
                this.#messageHandlerMap.get(msgContents.to).get(msgContents.type)(msgContents.data)
            }
        } else console.log('Cannot Read Message to ' + msgContents.to);
    };

    /** Hub subscribes */
    subscribe = () => {
        GM.ENV.publisher.subscribe(this.subscriber);
        GM.DM.publisher.subscribe(this.subscriber);
        GM.MM.publisher.subscribe(this.subscriber);
        GM.INS.publisher.subscribe(this.subscriber);
        GM.IM.publisher.subscribe(this.subscriber);
        GM.PLM.publisher.subscribe(this.subscriber);
        GM.OM.publisher.subscribe(this.subscriber);
        GM.WM.publisher.subscribe(this.subscriber);
        GM.PM.publisher.subscribe(this.subscriber);
        GM.DOM.publisher.subscribe(this.subscriber);
    };

    #buildMessageForEnvironment() {
        this.#messageForEnvironment.set('Create Composite Group Event', this.#createCompositeGroupEvent.bind(this));
        this.#messageForEnvironment.set('Draw Link Event', this.#drawLinkEvent.bind(this));
        this.#messageForEnvironment.set('Gray Out Pipeline Event', this.#grayOutPipelineEvent.bind(this));
        this.#messageForEnvironment.set('Partial Pipeline Return Event', this.partialPipelineReturnEvent.bind(this));
        this.#messageForEnvironment.set('Request Module Key Event', this.#requestModuleKeyEvent.bind(this));
        this.#messageForEnvironment.set('Start Environment Event', this.#startEnvironmentEvent.bind(this));
        this.#messageForEnvironment.set('New Module Created Event', this.#newModuleCreatedEvent.bind(this));
    }

    #buildMessageForModuleManager() {
        this.#messageForModuleManager.set('Saved Modules Loaded Event', this.#savedModulesLoadedEvent.bind(this));
        this.#messageForModuleManager.set('New Group Created', this.#newGroupCreated.bind(this));
        this.#messageForModuleManager.set('Nodes Deleted Event', this.#nodesDeletedEvent.bind(this));
        this.#messageForModuleManager.set('Link Drawn Event', this.#linkDrawnEvent.bind(this));

        this.#messageForModuleManager.set('Set Search Result Content', this.#setSearchResultContent.bind(this));
        this.#messageForModuleManager.set('Handle Fetch Error', this.#handleFetchError.bind(this));
        this.#messageForModuleManager.set('Set Module Data Event', this.#setModuleDataEvent.bind(this));
        this.#messageForModuleManager.set('Toggle Module Color Event', this.#toggleModuleColorEvent.bind(this));
        this.#messageForModuleManager.set('Update Inspector Card Event', this.#updateInspectorCardEvent.bind(this));

    }

    #buildMessageForInspector() {
        this.#messageForInspector.set('Publish Module Inspector Card Event', this.#publishModuleInspectorCardEvent.bind(this));
        this.#messageForInspector.set('Node Selected Event', this.#nodeSelectedEvent.bind(this));
        this.#messageForInspector.set('Minimize Card Event', this.#minimizeCardsEvent.bind(this));
        this.#messageForInspector.set('Maximize Card Event', this.#maximizeCardEvent.bind(this));

        this.#messageForInspector.set('Set Remote Dropdown Options', this.#setRemoteDropdownOptions.bind(this));
        this.#messageForInspector.set('Set Remote Objects Suggestions', this.#setRemoteObjectsSuggestions.bind(this));
    }

    #buildMessageForInputManager() {
        this.#messageForInputManager.set('Request List Of Objects Event', this.#requestListOfObjectsEvent.bind(this));
        this.#messageForInputManager.set('Objects Loaded Event', this.#objectsLoadedEvent.bind(this));
        this.#messageForInputManager.set('Routes Loaded Event', this.#routesLoadedEvent.bind(this));

        this.#messageForInputManager.set('Read File Event', this.#readFileEvent.bind(this));
        this.#messageForInputManager.set('Search Form Submit Event', this.#searchFormSubmit.bind(this));
        this.#messageForInputManager.set('Fetch Local Table Data Event', this.#fetchLocalTableDataEvent.bind(this));
        this.#messageForInputManager.set('Fetch Local Chart Data Event', this.#fetchLocalChartDataEvent.bind(this));
        this.#messageForInputManager.set('Prep Table Data Event', this.#prepTableDataEvent.bind(this));
        this.#messageForInputManager.set('Prep Chart Data Event', this.#prepChartDataEvent.bind(this));
        this.#messageForInputManager.set('Prep Orbit Data Event', this.#prepOrbitDataEvent.bind(this));
        this.#messageForInputManager.set('Get Object Orbits Event', this.#getObjectOrbitsDataEvent.bind(this));

        this.#messageForInputManager.set('Prep Object Images Event', this.#prepObjectImagesEvent.bind(this));
    }

    #buildMessageForWorkerManagerMap() {
        this.#messageForWorkerManager.set('Transmit Pipeline Event', this.#transmitPipelineEvent.bind(this));
        this.#messageForWorkerManager.set('Save Composite Module Event', this.#saveCompositeModuleEvent.bind(this));

        this.#messageForWorkerManager.set('Get Remote Dropdown Options', this.#getRemoteDropdownOptions.bind(this));
        this.#messageForWorkerManager.set('Get Remote Objects Suggestions', this.#getRemoteObjectsSuggestions.bind(this));
        this.#messageForWorkerManager.set('Fetch Remote Table Data Event', this.#fetchRemoteTableDataEvent.bind(this));
        this.#messageForWorkerManager.set('Get Planet Orbits Event', this.#getPlanetOrbitsDataEvent.bind(this));
    }

    #buildMessageForPopupManager() {
        this.#messageForPopupManager.set('Publish Module Popup Event', this.#publishModulePopupEvent.bind(this));
        this.#messageForPopupManager.set('Create Save Composite Popup Event', this.#createSaveCompositePopupEvent.bind(this));
        this.#messageForPopupManager.set('Double Click Event', this.#doubleClickEvent.bind(this));

    }


    #buildMessageForDataManagerMap() {
        this.#messageForDataManager.set('Pipeline Return Event', this.pipelineReturnEvent.bind(this));
        this.#messageForDataManager.set('New Data Event', this.#newDataEvent.bind(this));
        this.#messageForDataManager.set('New Filter Applied Event', this.#newFilterAppliedEvent.bind(this));
        this.#messageForDataManager.set('Data Conversion Event', this.#dataConversionEvent.bind(this));
        this.#messageForDataManager.set('Data Type Change Event', this.#dataTypeChangeEvent.bind(this));
    }

    #buildMessageForOutputManagerMap() {
        this.#messageForOutputManager.set('Create New CSV File Event', this.#createNewCSVFileEvent.bind(this));
        this.#messageForOutputManager.set('Create New Local Table Event', this.#createNewLocalTableEvent.bind(this));
        this.#messageForOutputManager.set('Create New Local Chart Event', this.#createNewLocalChartEvent.bind(this));
        this.#messageForOutputManager.set('Change EChart Theme Event', this.#eChartThemeEvent.bind(this));
        this.#messageForOutputManager.set('Popup Closed Event', this.#popupClosedEvent.bind(this));
        this.#messageForOutputManager.set('Resize Popup Event', this.#resizePopupEvent.bind(this));

        //this.#messageForOutputManager.set('New Table Event', this.#newTableEvent.bind(this));
        this.#messageForOutputManager.set('Set New Table Event', this.#setNewTableEvent.bind(this));
        this.#messageForOutputManager.set('Set New Chart Event', this.#setNewChartEvent.bind(this));
        this.#messageForOutputManager.set('Set New Orbit Event', this.#setNewOrbitEvent.bind(this));
        this.#messageForOutputManager.set('Set New Images Event', this.#setNewImagesEvent.bind(this));
    }

    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * Called when a new module is created by the ModuleGenerator. This notifies the Environment to insert
     * a new GOJS node into the graph environment. If the module requires metadata from the server, this function
     * notifies the WorkerManager to request it.
     * @param {{
     * groupkey (Number): Identifies a group of nodes. Will be undefined if there is no group.
     * module (Module): The new Module object.
     * templateExists (boolean): True if the Envrionment already has a template to build from. False if it
     *                           has to create a new template, ie. this is the first model of this type made.
     * }} data 
     * @returns 
     */
    #newModuleCreatedEvent(data) {
        if (invalidVariables([varTest(data.module, 'module', 'object'), varTest(data.templateExists, 'templateExists', 'boolean')], 'HUB', '#messageForEnvironment (New Module Created Event)')) return;
        console.log(data);
        var moduleKey = data.module.getData('key');
        GM.ENV.insertModule(data.module, data.templateExists, data.groupKey);
        try {
            var callOnCreation = data.module.getData('callOnCreationFunction');
            if (callOnCreation === true) {
                //this.#makeMetadataRequest(this.#getNewWorkerIndex(), data.module.getData('name'), data.module.getData('onCreationFunction'));
                data.module.onCreation();
            }
        } catch (e) {
            console.log(e);
        }
        this.#maximizeCardEvent({ id: moduleKey });

    }


    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * Called at application start. Creates the GOJS enviromnet.
     * @param {*} data The paramater is not actually used by the function. 
     */
    #startEnvironmentEvent(data) {
        try {
            GM.ENV.setUpEnvironment();
        } catch (e) {
            console.log('FAILED TO SET UP GOJS ENVIRONMENT');
            console.log(e);
        }
    }

    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * When a module is created in the ModuleGenerator, the module manager requests a key from the Environment.
     * The keys is passed back to the ModuleManager through a callback.
     * @param {{
     * name (string): Name of module i.e. CSV File
     * category (string): category of the module. ie. Source
     * cb (function): the callback function
     * groupKey (Number): identifies a module group. (will be undefined if this is not part of a group)
     * oldKey (Number): if a module is loaded from a saved prefab, it will have an old key associated. This will be rewritten
     *                  but is necessary to identify node when first created. (will be undefined otherwise)
     * }} data 
     * @returns 
     */
    #requestModuleKeyEvent(data) {
        if (invalidVariables([varTest(data.cb, 'cb', 'function'), varTest(data.name, 'name', 'string'), varTest(data.category, 'category', 'string')], 'HUB', '#messageForEnvironment (Request Module Key Event')) return;
        data.cb(data.name, data.category, GM.ENV.getNextNodeKey(), data.oldKey, data.groupKey);
    }

    /** --- PUBLIC --- MESSAGE FOR ENVIRONMENT
     * This function was used for testing to update the graph as individual nodes were processed on the server.
     * Depending on implementation, this may be depricated.
     * @param {*} data 
     * @returns 
     */
    partialPipelineReturnEvent(data) {
        if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Partial Pipeline Return Event')) return;
        GM.ENV.updatePipelineProgress(data.value);
    }

    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * This turns the environment gray to show that the request has been sent to the server.
     * @param {Number[]} data.value array of keys to gray out.
     */
    #grayOutPipelineEvent(data) {
        if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Gray Out Pipeline Event')) return;
        else GM.ENV.grayOutPipeline(data.value);
    }

    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * Draws a link programatically between two nodes. 
     * @param {{
     * from (Number): id of the origin of the link.
     * to (Number): id of the recipient of the link.
     * }} data 
     */
    #drawLinkEvent(data) {
        if (invalidVariables([varTest(data.from, 'from', 'number'), varTest(data.to, 'to', 'number')], 'HUB', '#messageForEnvironment (Draw Link Event')) return;
        GM.ENV.drawLinkBetweenNodes(data.from, data.to);
    }

    /** --- PRIVATE --- MESSAGE FOR ENVIRONMENT
     * Called when a prefab (saved) composite node is created by the module generator.
     * @param {{
     * name (string): the name of the group node 
     * callback (function): ModuleManager callback function that processes the group node.
     * }} data
     */
    #createCompositeGroupEvent(data) {
        if (invalidVariables([varTest(data.callback, 'callback', 'function')], 'HUB', '#messageForEnivonment (Create Composite Group Event')) return;
        data.callback(GM.ENV.createNewGroupNode(), data.name);
    }

    /** --- PRIVATE --- MESSAGE FOR MODULE MANAGER
     * Called when a new link is drawn. Checks if Module needs to be updated with data information or metadata information.
     * @param {{
     * event (string): 'LinkDrawn',
     * fromNodeKey (Number): Origin of the link
     * toNodeKey (Number) : End of the link
     * }} data
     */
    #linkDrawnEvent(data) {
        if (invalidVariables([varTest(data.fromNodeKey, 'fromNodeKey', 'number')], 'HUB', '#messageForEnvironment (Link Drawn Event)')) return;
        const toNodetype = GM.MM.getModule(data.toNodeKey).getData('type').toLowerCase();
        //const linked = GM.MM.checkForNewDataLink(data.toNodeKey, data.fromNodeKey);
        //const containsMetadata = GM.MM.checkForMetadataLink(data.fromNodeKey);
        console.log(toNodetype);

        // Processors are handled differently......................not needed?
        //if (linkedToData && type !== 'processor') this.#processNewDataLink(data.toNodeKey, data.fromNodeKey);
        if (toNodetype == 'output') this.#processNewOutputLink(data.fromNodeKey, data.toNodeKey);
        //else if (containsMetadata) this.#processMetadataLink(data.toNodeKey, data.fromNodeKey);

        // If this is a local Data connection, the Module Manager will update modules.
        //GM.MM.handleLocalDataConnection(data.toNodeKey, data.fromNodeKey);

    }

    /** --- PRIVATE ---
     * This is called by linkDrawnEvent when a new link is drawn between Source/Processor module and an Output Module.
     * @param {Number} fromKey Key to recipient of the link.
     * @param {Number} outputKey Key to node that originated the link
     */
    #processNewOutputLink(fromKey, outputKey) {
        const fromModule = GM.MM.getModule(fromKey);
        const fromModuleType = fromModule.getData('type').toLowerCase();
        const outputModule = GM.MM.getModule(outputKey);

        if (fromModuleType === 'source') {
            const outputModuleName = outputModule.getData('type').toLowerCase();
            /*const moduleCommand = outputModule.getData('command');
            console.log(moduleCommand);*/

            switch (outputModuleName) {
                case 'output':
                    var fromModuleData = fromModule.getData('moduleData');
                    console.log(fromModuleData);
                    // prepInspectorCardData sets the toModuleData from fromModuleData
                    outputModule.prepInspectorCardData(outputModule.getData('key'), fromModuleData, fromKey);

                    // The content of the moduleData parameter differs from module to module.
                    outputModule.updateInspectorCard();

                    break;
                default:
                    console.log(outputModuleName);
            }

            // select the output node
            this.#nodeSelectedEvent({ moduleKey: outputKey });           
        }
        // if fromModule is processor module

        //toModule.updateInspectorCardWithNewData(dataKey, dataSet.data.getHeaders()); // old

    }


    /** --- PRIVATE --- CALLED LOCALLY
     * This is called by linkDrawnEvent when a new link is drawn between a local data module and an 
     * Output Module.
     * @param {Number} toKey Key to node that originated the link
     * @param {Number} fromKey Key to recipient of the link.
     */
    #processNewDataLink(toKey, fromKey) {

        const toModule = GM.MM.getModule(toKey);
        const type = toModule.getData('type').toLowerCase();
        //const linkedToData = toModule.getData('linkedToData');
        const dataModule = GM.MM.getModule(fromKey);
        const dataKey = dataModule.getData('dataKey');
        const dataSet = GM.DM.getData(dataKey);

        if (type === 'output') {
            GM.MM.updateDynamicInspectorCardField(toKey, 'Data Linked', true);
        }

        // this is specifically for chart modules
        toModule.updateInspectorCardWithNewData(dataKey, dataSet.data.getHeaders());

        if (toModule.storeTableHeaders) {
            const headers = dataSet.data.getHeaders();
            toModule.storeTableHeaders(headers);
        }
        
    }

    /** --- PRIVATE --- CALLED LOCALLY
     * This is called after confirming that there is a new metadata link in the Link Drawn Event.
     * Passes the metadata to the newly linked module by invoking the Module Manager.
     * @param {Number} toKey
     * @param {Number} fromKey
     */
    #processMetadataLink(toKey, fromKey) {
        const metadata = GM.MM.getModule(fromKey).getData('metadata');
        GM.MM.getModule(toKey).processMetadata(metadata);
    }

    /** --- PRIVATE --- MESSAGE FOR MODULE MANAGER
     * Called when user deletes a module manually.
     * @param {Number[]} data an array of keys to delete. 
     */
    #nodesDeletedEvent(data) {
        if (invalidVariables([varTest(data, 'data', 'object')], 'HUB', 'Nodes Deleted Event')) return;
        data.forEach(key => {
            GM.MM.removeModule(key);
            GM.OM.removeOutputData(key); // Remove any saved chart information
        });
    }

    /** --- PRIVATE --- MESSAGE FOR MODULE MANAGER
     * @param {{
     * groupDiagram: {
     *         nodes (array of {type: (module name), name: (module category), key (number)}
     *         links (array of links)
     *     }
     * groupKey (number): key identifying the group.
     * }} data
     */
    #newGroupCreated(data) {
        if (invalidVariables([varTest(data.groupDiagram, 'groupDiagram', 'object'), varTest(data.groupKey, 'groupKey', 'number')], 'HUB', '#messageForModuleManager (New Group Created)')) return;
        const module = GM.MM.createNewCompositeModule(data.groupKey, data.groupDiagram);
        module.inspectorCardMaker.createInspectorCompositeDetailCard(data.groupDiagram, module.saveModule.bind(module));
    }

    /** --- PRIVATE --- MESSAGE FOR MODULE MANAGER
     * Called when WebWorker returns with saved data. (This is all done locally on the node server and will have
     * to be rewritten when we have access to the database.)
     * @param {{
     * clientId (Number): id returned from the server. Used by the webworker
     * data (Object): data for all of the modules. Contains links, nodes, description, name
     * type (String): Identifies the type of server return. Used by the webworker
     * }} data 
     */
    #savedModulesLoadedEvent(data) {
        if (data.data !== 'No Saved Modules Found') {
            Object.entries(data.data).forEach(module => {
                // Module[0] is the name, Module[1] is the module data.
                GM.MM.storeCompositePrefabData(module[0], module[1]);
                GM.MSM.addCompositeSubMenuItem(module[0]);
            });
        }
        GM.MSM.initializeMenu(); // Now that the composite modules have returned, build the Module Selection Menu.
    }


    /** --- PRIVATE --- MESSAGE FOR INSPECTOR
     * Hides all cards, them maximizes the inspector card of the node that was clicked in the Environment
     * @param {{moduleKey (number): key of the module clicked}} data 
     */
    #nodeSelectedEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInspector (Node Selected Event.)')) return;
        GM.MM.collapseAllInspectorCards();
        GM.MM.getModule(data.moduleKey).getInspectorCard().maximizeCardEnvironmentClick();
    }

    /** --- PRIVATE --- MESSAGE FOR INSPECTOR
     * minimizes all inspector cards */
    #minimizeCardsEvent() {
        GM.INS.minimizeCards();
    }

    /** --- PRIVATE --- MESSAGE FOR INSPECTOR
     * Maximizes a single card
     * @param {id (number): id of the module to maximize}
     */
    #maximizeCardEvent(data) {
        GM.INS.maximizeCard(data.id);
    }

    /** --- PRIVATE --- MESSAGE FOR INSPECTOR
     * Passes the HTML data for an inspector card when a module is created.
     * @param {{
     * card (HTML Div): contains the HTML to inject 
     * moduleKey (Number): the key the module whose card to publish
     * }} data 
     */
    #publishModuleInspectorCardEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.card, 'card', 'object')], 'HUB', '#messageForInspector (publish Module Card Event')) return;
        GM.INS.addModuleCard(data.moduleKey, data.card);
    }

    /** --- PRIVATE --- MESSAGE FOR Popup Manager
     * Passes the HTML data for a popup when a module is created.
     * @param {moduleKey} (Number): the key of the module whose popup to publish
     * @param {content} (Object): the object { color, popupContent, headerText } of the Popup to publish
     * }} data 
     */
    #publishModulePopupEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.content, 'content', 'object')], 'HUB', '#messageForInspector (publish Module Card Event')) return;
        GM.PM.createModulePopup(data.moduleKey, data.content);
    }

    /** --- PRIVATE --- MESSAGE FOR POPUP MANAGER
     * Generates popup when a Environment graph node is double-clicked.
     * Currently the system just loads the popup to point (0,0)
     * @param {{
     * moduleKey (Number): the id of the module clicked
     * x (Number): the x position of the click (not currently working)
     * y (Number): the y position of the click (not currently working)
     * }} data 
     */
    #doubleClickEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.x, 'x', 'number'), varTest(data.y, 'y', 'number')], 'HUB', '#messageForPopupManager (double click event)'));
        this.#openModulePopup(data.moduleKey, data.x, data.y);
    }

    /** --- PRIVATE --- MESSAGE FOR POPUP MANAGER
     * Creates the popup for saving a module with Module name and description fields.
     * @param {{
     * color (string): hex color for the popup header.
     * content (HTML div): the content to displace.
     * headerText (string): text to display in the popup header.
     * }} data 
     */
    #createSaveCompositePopupEvent(data) {
        console.log(data)
        if (invalidVariables([varTest(data.content, 'content', 'object'), varTest(data.color, 'color', 'string'), varTest(data.headerText, 'headerText', 'string')], 'HUB', '#messageForPopupManager (Create Save Composite Popup Event)')) return;
        GM.PM.createOtherPopup(data);
    }

    /** --- PRIVATE --- MESSAGE FOR INPUT MANAGER
     * 
     * @param {{
     * moduleKey (Number): the key to the source module 
     * path (string): the id of HTML element that generates the upload.
     * source (string): html
     * type (string): the type of file ie. csv
     * }} data 
     */
    #readFileEvent(data) {
        if (invalidVariables([varTest(data.fileType, 'fileType', 'string'), varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInputManager (Read File Event)')) return;
        // validateFile function and sets moduleData
        GM.IM.readFile(data.moduleKey, data.fileId, data.fileType);
    }

    #setModuleDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.moduleData, 'moduleData', 'object'), varTest(data.toggleModuleColor, 'toggleModuleColor', 'boolean')], 'HUB', '#messageForModuleManager (Set Module Data Event)')) return;
        var module = GM.MM.getModule(data.moduleKey);
        console.log(data);
        var processed = false;
        if (data.moduleData) {
            module.addData('moduleData', data.moduleData);
            processed = true;

            //console.log(module);
            if (data.toggleModuleColor) {
                this.#toggleModuleColorEvent(data.moduleKey, processed);
            }
        }
        else {
            module.removeData('moduleData');

            // set error screen (in popup) ...?

        }
        return processed;
    }

    #toggleModuleColorEvent(moduleKey, processed) {
        if (invalidVariables([varTest(moduleKey, 'moduleKey', 'number'), varTest(processed, 'processed', 'boolean')], 'HUB', '#toggleModuleColorEvent (Toggle Module Color Event)')) return;
        // toggle module color and inspector/popup header color
        GM.ENV.toggleNodeColor(moduleKey, processed);
        GM.MM.toggleHeaderColor(moduleKey, processed);
    }

    #updateInspectorCardEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.moduleData, 'moduleData', 'object')], 'HUB', '#messageForModuleManager (Update Inspector Card Event)')) return;
        var module = GM.MM.getModule(data.moduleKey);
        module.updateInspectorCard();
    }

    //*************** search form */
    //-------------------------------------- .. use prepworker event.. from Worker manager
    #searchFormSubmit(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.queryType, 'queryEntries', 'string'), varTest(data.queryEntries, 'queryEntries', 'object')], 'HUB', '#messageForInputManager (Search Form Submit Event)')) return;
        const workerId = this.#getNewWorkerIndex();
        this.#prepWorker(workerId, MODULE_MANAGER, 'Set Search Result Content', data.moduleKey)
            .processSearch(workerId, data);
    }

    #handleFetchError(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.query, 'query', 'object'), varTest(data.message, 'message', 'object')], 'HUB', '#messageForPopupManager (Handle Fetch Error)')) return;

        console.log(data);
        var resultData = { query: data.query, detail: data.message };
        GM.MM.updatePopupContent(data.moduleKey, 'error', resultData);

        // do prepworker


        // Open popup if not opened yet
        if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0, 0);
    }

    /***************** Mai 022823 ******************/
    ////////////////////////////////////////////////////////// ------------- REWRITE THIS FUNCTION TO REUSE SetModuleData func in the hub
    /*
     * Updates a popup content for this search module with the search result
     *  @param {number} data.moduleKey
     *  @param {Object} data.val query entries and search taskResult data
     * */
    #setSearchResultContent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.status, 'status', 'string'), varTest(data.queryType, 'queryType', 'string'), varTest(data.queryEntries, 'queryEntries', 'object'), varTest(data.sourceData, 'sourceData', 'object')], 'HUB', '#messageForInputManager (Set Search Result Content)')) return;
        var processed = false;
        console.log(data);
        if (data.status === 'success') {
            var moduleData = {
                moduleKey: data.moduleKey,
                moduleData: {
                    remoteData: data.remoteData,
                    status: data.status,
                    datasetType: data.datasetType,
                    sourceData: data.sourceData,
                },
                toggleModuleColor: true,
            };
            processed = this.#setModuleDataEvent(moduleData);

            var moduleName = GM.MM.getModule(data.moduleKey).getData('name').toLowerCase();
            // update module popup content
            GM.MM.updatePopupContent(data.moduleKey, moduleName, data);

            // toggle Module color
            /*GM.ENV.toggleNodeColor(data.moduleKey, processed);
            GM.MM.toggleHeaderColor(data.moduleKey, processed);*/
        }
        else {
            // update module popup with error screen
        }
        
        if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0, 0);
    }

    /*
     * Updates a popup content for this search module with the search result
     *  @param {number} data.moduleKey moduleKey
     *  @param {Object} data.val search result data
     * */
    /*#setSearchResultContent(data) {
        if (invalidVariables([varTest(data.val, 'val', 'object'), varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInputManager (Set Search Result Content)')) return;
        console.log(data);

        let tableData = undefined;
        // if error, display error
        if (data.val.data !== undefined) {
            // Organize tableData for Tabulator
            const jsonData = JSON.parse(data.val.data);
            console.log(jsonData);

            const headers = Object.keys(jsonData.data[0]);

            let columns = [];
            headers.forEach(function (headeritem) {
                var leftWidth = 0;
                // Get the width of the left decimal type values
                var decimalType = jsonData.data[0][headeritem];
                if (decimalType.includes(".")) {
                    // get all values of the current column
                    jsonData.data.map((val) => {
                        let value = val[headeritem].split(".");
                        if (value[0].length > leftWidth) {
                            leftWidth = value[0].length;
                        }
                    });
                }
                columns.push({
                    title: headeritem, field: headeritem,
                    titleFormatter: function (cell) {
                        let title = cell.getValue();
                        cell.getElement().style.textAlign = "center";
                        return title;
                    },
                    formatter: function (cellValue) {
                        let value = cellValue._cell.value;
                        let valueWrapper = GM.HF.createNewDiv('', '', ['column-val-wrapper'], [{ style: "display", value: "flex" }, { style: "font-family", value: "monospace" }]);
                        if (leftWidth == 0) {
                            // create span of 100% with the value
                            let span = GM.HF.createNewSpan('', '', ['column-val'], [{ style: "text-align", value: "center" }, { style: "display", value: "block" }, { style: "width", value: "100%" }], value);
                            valueWrapper.appendChild(span);
                        }
                        else {
                            let left = value.split(".")[0];
                            let right = value.split(".")[1];
                            // create left span with leftWidth
                            let spanLeft = GM.HF.createNewSpan('', '', ['column-val'], [{ style: "text-align", value: "end" }, { style: "width", value: leftWidth + "ch" }], left);
                            // create right span width 100% - leftWidth
                            let spanDecimal = GM.HF.createNewSpan('', '', ['column-val'], [], ".");
                            let spanRight = GM.HF.createNewSpan('', '', ['column-val'], [], right);
                            valueWrapper.appendChild(spanLeft);
                            valueWrapper.appendChild(spanDecimal);
                            valueWrapper.appendChild(spanRight);
                        }

                        //console.log(valueWrapper);
                        return valueWrapper;
                    },
                });
                jsonData.data.forEach(function (item) {
                    if (Object.keys(format_mapping).includes(headeritem)) {
                        item[headeritem] = Number(item[headeritem]).toFixed(format_mapping[headeritem]);
                    }
                });
            });
            tableData = { columns: columns, tabledata: jsonData.data };
        }

        var resultData = { query: data.val.query, tableData: tableData };
        GM.MM.updatePopupContent(data.moduleKey, data.val.status, resultData);

        // Open popup if not opened yet
        if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0, 0);
    }*/

    /** Gets dropdown options from db. If it fails, load the table locally from static data
     *  
     * */
    #getRemoteDropdownOptions(data) {
        console.log(data);
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.dirName, 'dirName', 'string'),
            varTest(data.fieldWrapperId, 'fieldWrapperId', 'string'), varTest(data.delay, 'delay', 'number')], 'HUB', '#messageForWorkerManager (Get Remote Dropdown Options Event)')) return;
        // use prepworker
        const workerId = this.#getNewWorkerIndex();
        try {
            this.#prepWorker(workerId, INSPECTOR, 'Set Remote Dropdown Options', data.moduleKey)
                .getRemoteDropdownOptions(workerId, data);
        } catch (e) {
            // Add display error function here

            console.log("ERROR GETTING REMOTE DROPDOWN OPTIONS");
            console.log(e);
        }
    }

    // remote search data is the return from server
    #setRemoteDropdownOptions(data) {
        if (invalidVariables([varTest(data.fieldName, 'fieldName', 'string'), varTest(data.fieldWrapperId, 'fieldWrapperId', 'string'), varTest(data.data, 'data', 'object')], 'HUB', '#messageForWorkerManager (Set Remote Dropdown Options Event)')) return;
        console.log(data);
        // get options for the fieldName
        var success = false;
        if (data.data) {
            var result = data.data[data.fieldName];
            var options = [{ name: '--- None ---', value: -1 }];
            switch (data.fieldName) {
                case "filters":
                    result.map((item) => { options.push({ name: item.common_name, value: item.id }) });
                    break;
                default:
                    result.map((item) => { options.push({ name: item.name, value: item.id }) });
            }
            console.log(options);

            // append to dropdown INS
            success = GM.INS.setRemoteDropdownOptions(data.moduleKey, data.fieldWrapperId, options);
        }
    }

    /** Gets objects suggestions from the backend on user input. 
     * 
     * 
     * */
    #getRemoteObjectsSuggestions(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.dirName, 'dirName', 'string'),
            varTest(data.fieldWrapperId, 'fieldWrapperId', 'string'), varTest(data.term, 'term', 'string'), varTest(data.delay, 'delay', 'number')], 'HUB', '#messageForInputManager (Get Remote Objects Suggestions Event)')) return;
        const workerId = this.#getNewWorkerIndex();
        try {
            this.#prepWorker(workerId, INSPECTOR, 'Set Remote Objects Suggestions', data.moduleKey)
                .getRemoteObjectsSuggestions(workerId, data);
        } catch (e) {
            // Add display error function here

            console.log("ERROR GETTING OBJECTS SUGGESTIONS");
            console.log(e);
        }
    }

    #setRemoteObjectsSuggestions(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldWrapperId, 'fieldWrapperId', 'string'), varTest(data.data, 'data', 'object')], 'HUB', '#messageForWorkerManager (Set Remote Objects Suggestions Event)')) return;
        console.log(data);
        // get options for the fieldName
        var success = false;
        if (data.data) {
            // append to dropdown INS
            success = GM.INS.setRemoteObjectsSuggestions(data.moduleKey, data.fieldWrapperId, data.data);
        }
        if (!success) {
            console.log("Could not retrieve remote data.");
        }
    }

    /** --- PRIVATE --- MESSAGE FOR INPUT MANAGER
     * Called When routes are loaded
     * @param {Object} data.data the routes 
     */
    #routesLoadedEvent(data) {
        if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Routes Loaded Event')) return;
        GM.IM.addRoutes(data.data);
    }

    /** --- PRIVATE --- MESSAGE FOR INPUT MANAGER
     * Called when objects list is loaded
     * @param {Object} data.data the list of the objects 
     */
    #objectsLoadedEvent(data) {
        if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Objects Loaded Event')) return;
        GM.IM.addObjects(data.data);
    }

    /** --- PRIVATE --- MESSAGE FOR INPUT MANAGER
     * Requests a list of objects from the Input Manager (Only works if there are objects returned from the server.)
     * @param {{callbackFunction (function): function that handles the data on the InspectorCardMaker}} data 
     */
    #requestListOfObjectsEvent(data) {
        if (invalidVariables([varTest(data.callbackFunction, 'callbackFunction', 'function')], 'HUB', '#messageForInputManager (Request List Of Objects Event)')) return;
        let objects = GM.IM.getObjects();
        if (objects === undefined) objects = { '9P': 'Temple 1', '10P': 'Temple 2' }; // Create Fake Data for Testing
        data.callbackFunction(objects);
    }

    /** --- PRIVATE --- MESSAGE FOR WORKER MANAGER
     * Notifies the Node server to write a new saved module to file.
     * @param {{
     * groupInfo (Object): Object representing the group of modules to be saved.
     * name (string): The name of the saved group (user generated)
     * description (string): User generated description
     * }} data 
     */
    #saveCompositeModuleEvent(data) {
        if (invalidVariables([varTest(data.groupInfo, 'groupInfo', 'object'), varTest(data.name, 'name', 'string'), varTest(data.description, 'description', 'string')], 'HUB', '#messageForWorkerManager (Save Composite Module Event)')) return;
        const workerIndex = this.#getNewWorkerIndex();
        try {
            this.#prepWorker(workerIndex)
                .sendCompositeModuleInfoToServer(workerIndex, data);
        } catch (e) {
            console.log("ERROR TRANSMITTING SAVED COMPOSITE MODEL");
            console.log(e);
        }
    }

    /** --- PRIVATE --- Message For Worker Manager
     * Draws a Table to a table module popup. Uses table module.
     * @param {{
     * id (Number): module id,
     * val (Object): values of the data response
     * linkDataNode (Boolean): Draw a link to the module or not
     * local (Boolean): Data comes from local or remote.
     * }} data 
     */
    #fetchRemoteTableDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.queryType, 'queryType', 'string'), varTest(data.queryEntries, 'queryEntries', 'object')], 'HUB', '#messageForWorkerManager (Fetch Remote Table Data Event)')) return;
        const workerId = this.#getNewWorkerIndex();
        this.#prepWorker(workerId, OUTPUT_MANAGER, 'Set New Table Event', data.moduleKey)
            .processSearch(workerId, data);
    }
    #fetchLocalTableDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.remoteData, 'remoteData', 'boolean'), varTest(data.fileId, 'fileId', 'string'), varTest(data.columnsToRender, 'columnsToRender', 'object')], 'HUB', '#messageForInputManager (Fetch Local Table Data Event)')) return;
        // Get table content from local target file
        GM.IM.getTableData(data);
    }


    ////////////////////////////////////////////// create fetchRemoteChartDataEvent ///////////////////////////////////////////////////

    #fetchLocalChartDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.remoteData, 'remoteData', 'boolean'), varTest(data.datasetType, 'datasetType', 'string'), varTest(data.fileId, 'fileId', 'string'), varTest(data.traceData, 'traceData', 'object')], 'HUB', '#messageForInputManager (Fetch Local Table Data Event)')) return;
        // Get Chart content from local target file
        GM.IM.getChartData(data);
    }

    

    /** --- PRIVATE --- MESSAGE FOR WORKER MANAGER
     * Notifies the Worker Manager to transmit a pipeline to the server for processing
     * (THIS WAS GENERATED FOR MY OWN PERSONAL TESTING BACKEND AND WILL HAVE TO BE REWRITTEN)
     * @param {Object[]} data An array of objects representing the pipeline to transmit.  
     */
    #transmitPipelineEvent(data) {
        const workerIndex = this.#getNewWorkerIndex();
        try {
            this.#prepWorker(workerIndex)
                .sendPipelineToServer(workerIndex, data.value);
        } catch (e) {
            console.log("ERROR TRANSMITTING PIPELINE");
            console.log(e);
        }

    }

    /** --- PRIVATE --- MESSAGE FOR DATA MANAGER
    * When data is added to the application, a data module must be generated. This function
    * can also connect the new module to the source with a link. It will then swap the key to the data 
    * on the Data Manager from the Source module to the data module.
    * @param {{
     * id (Number): the id of the module that generated the data.
     * linkDataNode (boolean): true if a link should be programatically drawn
     * local (boolean): true if local, false if from the server.
     * val {
     *     data (DataTable): the data object 
     *      type: ex. 'table'
     * }
     * }} data 
     * @returns 
     */
    #newDataEvent(data) {
        if (invalidVariables([varTest(data.id, 'id', 'number'), varTest(data.val, 'val', 'object'), varTest(data.linkDataNode, 'linkDataNode', 'boolean'), varTest(data.local, 'local', 'boolean')], 'HUB', ' #messageForDataManager. (new data event)')) return;
        else if (GM.DM.addData(data.id, data.val, data.local)) {
            try {
                // moduleCategory is Composite, but this node is actually a non-composite data node. Still using that category for color characteristics only.
                GM.MM.deployNewModule({ moduleName: 'Data', moduleCategory: 'Composite', type: 'non-composite' });
                const module = GM.MM.connectDataModule(data.id);
                if (data.local) module.setMetadata(data.val.data.getMetadata());
                if (module && data.linkDataNode) {

                    // Connect the source module and the newly generated data module
                    GM.ENV.drawLinkBetweenNodes(module.getData('link'), module.getData('key'));

                    // The data belongs to the data module, not the source module.
                    GM.DM.swapDataKeys(module.getData('link'), module.getData('key'));
                }
            } catch (e) {
                console.log('ERROR CREATING NEW DATA MODULE');
                console.log(e);
            }
        }
    }

    /** --- PRIVATE --- MESSAGE FOR DATA MANAGER
     * Called when a new filter module is applied to a dataset.
     * Adds a flag to data on the DataManager and stores a callback that can access the data directly from the filter card.
     * @param {{
     * dataKey (Number): The key that identifies the dataset on the DataManager
     * filterFunction (Function): This function is bound the the minmax card of the filter. It is a getData function  
     *                            that returns information about what filters have been applied to the dataset.
     * }} data 
     */
    #newFilterAppliedEvent(data) {
        if (invalidVariables([varTest(data.filterFunction, 'filterFunction', 'function'), varTest(data.dataKey, 'dataKey', 'number')], 'HUB', 'newFilterAppliedEvent')) return;
        GM.DM.addFilterToDataTable(data.filterFunction, data.dataKey); // Flag the data as filtered on the DataManager
    }

    /** --- PRIVATE --- MESSAGE FOR DATA MANAGER
     * When any data conversion is applied, such as Julian Data to Modified Julian Date, this event is called. It
     * calles the Data Manager to convert the data and create a new DataTable object. Then a new Data Module is created and
     * added to the environment.
     * @param {{
     * inputFieldName (string): The name of the column in the data table to convert,
     * key (Number):  The key identifying the data on the DataManager,
     * moduleKey (Number): The key of the DataConversion module,
     * outputFieldName (string): The name of the new column that will be added to the data table.
     * conversionFunction (function): The function to map to the data. 
     * }} data 
     */
    #dataConversionEvent(data) {
        const dataTable = GM.DM.convertData(data.inputFieldName, data.outputFieldName, data.conversionFunction, data.key, data.moduleKey);
        this.#newDataEvent({ id: data.moduleKey, val: dataTable, local: true, linkDataNode: true });
    }

    /** --- PRIVATE ---
     * Datatypes can be changed in the filter if they are wrongly typed.
     * @param {{
     * metadata (Object): Object containing the metadata of the dataset,
     * oldType (string): The current type
     * newType (string): Change to this type
     * field (string): The column in the dataset to change
     * dataKey (Number): Key identifying the dataset on the DataManager
     * callback (function): callback to the min/max card that initiated the event
     * updateMetadataCallback (function): callback to the filter module to update with new metadata.
     * }} data 
     */
    #dataTypeChangeEvent(data) {
        GM.DM.changeDataType(
            data.metadata,
            data.oldType,
            data.newType,
            data.field,
            data.dataKey,
            data.callback,
            data.updateMetadataCallback);
    }

    pipelineReturnEvent(data) {
        //     const keyArray = [];
        //     data.value.forEach(dataObject => {
        //         if (dataObject.id != undefined && dataObject.val != undefined) {
        //             // Data Is Pushed to the data manager. Then the datamanager sends a new data loaded event. to the module manager
        //             GM.DM.addData(dataObject.id, { type: typeof (dataObject.val), data: dataObject.val });
        //             keyArray.push(dataObject.id);
        //         } else printErrorMessage(`Parameter Error.`, `id: ${dataObject.id}, value: ${dataObject.val} -- HUB -> Pipeline Return Event`);
        //         GM.ENV.highlightChangedNodes(keyArray);
        //     });
    }

    /** --- PRIVATE --- MESSAGE FOR OUTPUT MANAGER
     * When a popup with a chart is resized, the chart must also be resized. This function will pass the width and height
     * of the popup to the OutputManager to redraw the chart.
     * @param {{
     * moduleKey (Number): A key associated with the specific popup element.
     * }} data 
     */
    #resizePopupEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Resize Popup Event)')) return;
        if (GM.OM.popupHasAChart(data.moduleKey)) {
            // Popup Manager will pass the height and width to the Output Manager to redraw the Chart to the right size.
            GM.OM.resizeChart(data.moduleKey,
                GM.PM.getPopupWidth(data.moduleKey),
                GM.PM.getPopupHeight(data.moduleKey));
        }
        if (GM.OM.popupHasOrbit(data.moduleKey)) {
            GM.OM.resizeOrbit(data.moduleKey,
                GM.PM.getPopupWidth(data.moduleKey),
                GM.PM.getPopupHeight(data.moduleKey));
        }
    }

    /** --- PRIVATE --- MESSAGE FOR OUTPUT MANAGER
     * If there is a chart on the popup that was removed, that chart is removed.
     * @param {{moduleKey: (number) the key of the popup that was deleted}} data 
     */
    #popupClosedEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Popup Closed Event)')) return;
        //if (GM.OM.popupHasActiveChart(data.moduleKey)) GM.OM.removeChart(data.moduleKey);
        // set visibility hidden
        var modulePopup = GM.MM.getPopupContentForModule(data.moduleKey);
        var popup = modulePopup.content;
        if (popup) {
            var popupWrapper = popup.closest(`#popup-${data.moduleKey}`);
            popupWrapper.style.visibility = "hidden";
        }
    }

    /** --- PRIVATE --- MESSAGE FOR OUTPUT MANAGER
     * Sets the theme for a chart. This event is emitted from the chart popup.
     * If the chart is currently being displayed, it is redrawn with the new colors.
     * @param {{
     * moduleKey: (number) the key of the module that generated the popup
     * theme: (string) this identifies the theme to apply to the chart.
     * }} data 
     * @returns 
     */
    #eChartThemeEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.theme, 'theme', 'string')], 'HUB', '#messageForOutputManager (Change EChart Theme Event)')) return;
        if (GM.OM.popupHasAChart(data.moduleKey)) {
            if (GM.OM.changeEchartTheme(data.moduleKey, data.theme)) {
                if (GM.OM.popupHasActiveChart(data.moduleKey)){
                    GM.OM.redrawEChart(
                        data.moduleKey,
                        GM.PM.getPopupWidth(data.moduleKey),
                        GM.PM.getPopupHeight(data.moduleKey));
                }
            }
        }
    }

    /** --- PRIVATE --- Message For Output Manager
     * Called when user clicks Generate on a Chart inspector card.
     * @param {{
     * datasetKey (Number): the key identifying the data on the DataManager,
     * div (HTML Div): Where to inject the chart into the DOM,
     * fieldData (Object): Contains information from the ChartDataStorage object on the Output module. It has information 
     *                     such as labels, coordinateSystem, and other options.
     * moduleKey (Number): the id of the chart (Output) Module,
     * type (string): chart type i.e. 'bar', 'scatter'
     * }} data 
     */
    #createNewLocalChartEvent(data) {
        if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object'), varTest(data.div, 'div', 'object'), varTest(data.type, 'type', 'string')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
        if (GM.DM.hasData(data.datasetKey)) {
            const chartData = GM.DM.getXYDataWithFields(data.datasetKey, data.fieldData);
            // Store this information on the Output manager for quick redrawing during resizing charts.
            if (GM.OM.storeChartData(data.moduleKey,
                chartData,
                data.div,
                data.type,
                data.fieldData.xAxisLabel,
                data.fieldData.yAxisLabel,
                data.fieldData.xAxisGrid,
                data.fieldData.yAxisGrid,
                data.fieldData.xAxisTick,
                data.fieldData.yAxisTick,
                data.fieldData.coordinateSystem)) {
                if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0,0);
                GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
            }
        }
    }

    /** --- PRIVATE --- Message For Output Manager (Deprecated)
     * Calls the DataManager to get the relevant data and filter out the unwanted fields that the user has unchecked. Then passes
     * that data to the output manager to generate a new CSV file.
     * @param {{
     * datasetKey (Number): key identifying the data on the DataManager,
     * moduleKey (Number): key identifying the module,
     * fieldData (Object): Conaints information from the ChatDataStorage objeect on the ToCSV module. The only important information
     *                     in this object is the Headers but the entire object needs to be passed to the DataManager.
     * }} data 
     */
    #createNewCSVFileEvent(data) {
        if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object')], 'HUB', '#messageForOutputManager (Create Csv File Event)')) return;
        if (GM.DM.hasData(data.datasetKey)) {
            const tableData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
            GM.OM.generateCsvFile(tableData);
        }
    }

    /** --- PRIVATE --- Message For Output Manager
     * Draws a Table to a module popup. Uses Plotly to create the chart instead of ECharts.
     * @param {{
     * datasetKey (Number): key identifying the data on the DataManager,
     * moduleKey (Number): key identifying the module,
     * fieldData (Object): Conaints information from the ChatDataStorage objeect on the ToCSV module. The only important information
     *                     in this object is the Headers but the entire object needs to be passed to the DataManager.
     * div (HTML Div): The dom location to insert the chart
     * type (string): 'table' identifies the chart type.
     * }} data 
     */
    #createNewLocalTableEvent(data) {
        if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.type, 'type', 'string')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
        if (GM.DM.hasData(data.datasetKey)) {
            const chartData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
            if (GM.OM.storeChartData(data.moduleKey, chartData, data.div, data.type, '', '')) {
                if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0,0);
                if (GM.PM.isPopupOpen(data.moduleKey))
                {
                    GM.OM.drawChart(data.moduleKey, 
                        data.div, 
                        GM.PM.getPopupWidth(data.moduleKey), 
                        GM.PM.getPopupHeight(data.moduleKey));
                }
            }
        }
    }

    /////////////////////////////////////////////////////////// for input & outputmanagers ///////////////////////////////////////////////////////////


    //******************************************************************************************************/
    //********************************************* TABLE MODULE *******************************************/
    //******************************************************************************************************/

    /** Sets a table moduleData from source moduleData
     * @param {moduleKey} moduleKey of the table module
     * @param {sourceModuleData} sourceModuleData of the source module
     * */
    #prepTableDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.sourceModuleData, 'sourceModuleData', 'object')], 'HUB', '#messageForInputManager (Prep Table Data Event)')) return;
        var processed = false;
        var fromDatasetType = data.sourceModuleData.datasetType;
        var fromSourceData = data.sourceModuleData.sourceData;
        console.log(fromSourceData);

        if (fromSourceData) {
            // get columnHeaders
            var columnHeaders = GM.IM.getColumnHeaders(fromSourceData);
            console.log(columnHeaders);

            // set moduleData for this table module
            var data = {
                moduleKey: data.moduleKey,
                moduleData: {
                    datasetType: fromDatasetType,
                    columnHeaders: columnHeaders,
                    sourceData: fromSourceData,
                },
                toggleModuleColor: true,
            };
            processed = this.#setModuleDataEvent(data);
        }
        // else show error
        
    }

    /** Sets a new tabulator table to the Table Module Popup.
     * @param {moduleData} moduleData to set the table content with.
     *                      (e.g. { moduleKey: 1, datasetType: "", columnHeaders: [""], columnsToRender: [""], sourceData: [{}] })
     * */
    #setNewTableEvent(moduleData) {
        if (invalidVariables([varTest(moduleData.moduleKey, 'moduleKey', 'number'), varTest(moduleData.datasetType, 'datasetType', 'string'),
        varTest(moduleData.sourceData, 'sourceData', 'object'), varTest(moduleData.columnsToRender, 'columnsToRender', 'object')], 'HUB', '#messageForOutputManager (Set New Table Event)')) return;

        console.log('---------------- set New Table Event --------------');
        var processed = false;

        //-------------- write function in OutputManager.. in chartBuilder.js
        // Organize tableData for Tabulator

        var tableData = GM.OM.getTabulatorData(moduleData.datasetType, moduleData.columnsToRender, moduleData.sourceData);
        // store tableData in OM?
        /*
                headers.forEach(function (headeritem) {
                    var columnData = headerData.find(h => h.fieldName === headeritem);
                    // Get the width of the left decimal type values
                    *//*var leftWidth = 0;
        var decimalType = data[0][headeritem];
        if (decimalType.includes(".")) {
            // get all values of the current column
            data.map((val) => {
                let value = val[headeritem].split(".");
                if (value[0].length > leftWidth) {
                    leftWidth = value[0].length;
                }
            });
        }*//*
        columns.push({
            title: headeritem, field: headeritem,
            headerHozAlign: "center",
            *//*formatter: 'text',
        formatterParams: function (cellValue) {
            let value = cellValue._cell.value;
            let valueWrapper = GM.HF.createNewDiv('', '', ['column-val-wrapper'], [{ style: "display", value: "flex" }, { style: "font-family", value: "monospace" }]);
            if (leftWidth == 0) {
                // create span of 100% with the value
                let span = GM.HF.createNewSpan('', '', ['column-val'], [{ style: "text-align", value: "center" }, { style: "display", value: "block" }, { style: "width", value: "100%" }], value);
                valueWrapper.appendChild(span);
            }
            else {
                let left = value.split(".")[0];
                let right = value.split(".")[1];
                // create left span with leftWidth
                let spanLeft = GM.HF.createNewSpan('', '', ['column-val'], [{ style: "text-align", value: "end" }, { style: "width", value: leftWidth + "ch" }], left);
                // create right span width 100% - leftWidth
                let spanDecimal = GM.HF.createNewSpan('', '', ['column-val'], [], ".");
                let spanRight = GM.HF.createNewSpan('', '', ['column-val'], [], right);
                valueWrapper.appendChild(spanLeft);
                valueWrapper.appendChild(spanDecimal);
                valueWrapper.appendChild(spanRight);
            }
    
            //console.log(valueWrapper);
            return valueWrapper;
        },*//*
    });
});*/
        //resultData = { columns: columns, tabledata: tableData };
        processed = true;

        // Open popup if not opened yet
        if (!GM.PM.isPopupOpen(moduleData.moduleKey)) this.#openModulePopup(moduleData.moduleKey, 0, 0);

        GM.MM.updatePopupContent(moduleData.moduleKey, 'table', tableData);

        // toggle module color and inspector/popup header color
        GM.ENV.toggleNodeColor(moduleData.moduleKey, processed);
        GM.MM.toggleHeaderColor(moduleData.moduleKey, processed);
    }



    //******************************************************************************************************/
    //********************************************* CHART MODULE *******************************************/
    //******************************************************************************************************/

    /** Sets a chart moduleData from source moduleData
     * @param {moduleKey} moduleKey of the table module
     * @param {sourceModuleData} sourceModuleData of the source module
     * */
    #prepChartDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.sourceModuleData, 'sourceModuleData', 'object')], 'HUB', '#messageForOutputManager (Prep Chart Data Event)')) return;
        var processed = false;
        var remoteData = data.sourceModuleData.remoteData;
        var fromDatasetType = data.sourceModuleData.datasetType;
        var fromSourceData = data.sourceModuleData.sourceData;
        console.log(fromSourceData);

        if (fromSourceData) {
            // get columnHeaders
            var chartAxisData = GM.IM.getChartAxisData(remoteData, fromSourceData);
            
            // set moduleData for this table module
            var data = {
                moduleKey: data.moduleKey,
                moduleData: {

                    datasetType: fromDatasetType,
                    sourceData: fromSourceData,
                    chartAxisData: chartAxisData,
                },
                toggleModuleColor: true,
            };
            processed = this.#setModuleDataEvent(data);
        }
        // else show error

    }

    #setNewChartEvent(moduleData) {
        // moduleKey, datasetType, chartData, status, tableData
        if (invalidVariables([varTest(moduleData, 'moduleData', 'object')], 'HUB', '#messageForOutputManager (Set New Chart Event)')) return;
        // get chart type
        var key = moduleData.moduleKey;
        var module = GM.MM.getModule(key);
        var div = module.getData('plotDiv');

        // Organize the chartData for Echart
        var chartData = GM.OM.prepChartData(key, moduleData.datasetType, moduleData.chartTitle, moduleData.traceData, moduleData.sourceData);
        var processed = GM.OM.storeChartData(key, chartData, div, module.getData('chartType'), module.getData('coordinateSystem'));
        if (processed)
        {
            GM.OM.drawChart(key, div, GM.PM.getPopupWidth(key), GM.PM.getPopupHeight(key));
            if (!GM.PM.isPopupOpen(key)) this.#openModulePopup(key, 0, 0);
        }

        // toggle module color and inspector/popup header color
        this.#toggleModuleColorEvent(moduleData.moduleKey, processed);
    }


    /** --- PRIVATE --- Message For Output Manager (deprecated)
     * Draws a Table to a module popup. Uses Plotly to create the chart instead of ECharts.
     * @param {{
     * id (Number): module id,
     * val (Object): values of the data response
     * linkDataNode (Boolean): Draw a link to the module or not
     * local (Boolean): Data comes from local or remote.
     * }} data 
     */
    /*#newTableEvent(data) {
        if (invalidVariables([varTest(data.id, 'id', 'number'), varTest(data.val, 'val', 'object'), varTest(data.linkDataNode, 'linkDataNode', 'boolean'), varTest(data.local, 'local', 'boolean')], 'HUB', ' #messageForOutputManager. (new table event)')) return;
        //if (GM.OM.addData(data.id, data.val, data.local)) {
            try {
                // moduleCategory is Composite, but this node is actually a non-composite data node. Still using that category for color characteristics only.

                // oncreation of module, add dataTable in this module, then create popup card

                GM.MM.deployNewModule({ moduleName: 'Table', moduleCategory: 'Output', type: 'non-composite' });
                const module = GM.MM.connectTableModule(data.id);
                if (data.local) {
                    module.setData(data);
                }
                else {
                    module.setRemoteData(data.val.data);
                    //module.getData('data');
                }
                if (module && data.linkDataNode) {
                    // Connect the source module and the newly generated data module
                    GM.ENV.drawLinkBetweenNodes(module.getData('link'), module.getData('key'));

                    // The data belongs to the data module, not the source module.
                    //GM.DM.swapDataKeys(module.getData('link'), module.getData('key'));
                    const data = { moduleKey: module.getData('key') };
                    this.#nodeSelectedEvent(data);
                    // open popup
                    console.log(module);
                }
            } catch (e) {
                console.log('ERROR CREATING NEW TABLE MODULE');
                console.log(e);
            }
        //}
        // outputmanager draw chart

    }*/

    //******************************************************************************************************/
    //********************************************** ORBIT MODULE ******************************************/
    //******************************************************************************************************/

    // sets planet orbits on creation of orbit module
    #getPlanetOrbitsDataEvent() {
        if (invalidVariables([], 'HUB', '#messageForWorkerManager (Get Planet Orbits Event)')) return;
        const workerId = this.#getNewWorkerIndex();
        this.#prepWorker(workerId)
            .getPlanetOrbits(workerId);
    }
    // sets object orbits on creation of orbit module
    #getObjectOrbitsDataEvent() {
        if (invalidVariables([], 'HUB', '#messageForInputManager (Get Object Orbits Event)')) return;
        GM.IM.getObjectOrbits();
    }

    /** Sets a orbit moduleData from source moduleData
     * @param {moduleKey} moduleKey of the table module
     * @param {sourceModuleData} sourceModuleData of the source module
     * */
    #prepOrbitDataEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.sourceModuleData, 'sourceModuleData', 'object')], 'HUB', '#messageForOutputManager (Prep Orbit Data Event)')) return;

        GM.IM.prepOrbitModuleData(data.moduleKey, data.sourceModuleData.remoteData, data.sourceModuleData.sourceData);
    }

    #setNewOrbitEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Set New Orbit Event)')) return;
        const key = data.moduleKey;
        const module = GM.MM.getModule(key);
        let processed = module.getData('processed');
        if (!processed) {
            let moduleData = module.getData('moduleData');
            let div = module.getData('orbitDiv');
            console.log(GM.PM.getPopupWidth(key));

            console.log(moduleData);
            let orbitData = GM.OM.prepOrbitData(data.objectsToRender, moduleData.sourceData, data.orbitsToRender);
            processed = GM.OM.storeOrbitData(key, orbitData, div);
            if (processed) {
                GM.OM.drawOrbit(key, div, GM.PM.getPopupWidth(key), GM.PM.getPopupHeight(key));
                module.addData('processed', true);
            }
        }
        // toggle module color and inspector/popup header color
        this.#toggleModuleColorEvent(key, processed);
        if (!GM.PM.isPopupOpen(key)) this.#openModulePopup(key, 0, 0);
    }


    //******************************************************************************************************/
    //***************************************** OBJECT IMAGES MODULE ***************************************/
    //******************************************************************************************************/

    /**
     * Prepare Object Images data to get corresponding object name of the image to render
     * */
    #prepObjectImagesEvent(data) {
        const key = data.moduleKey;
        const module = GM.MM.getModule(key);
        const moduleData = data.sourceModuleData;
        const remote = moduleData.remoteData;

        if (remote) {
            // get object name from the search module input
            GM.IM.prepObjectImagesModuleData(remote, key, data.sourceModuleKey);

        }
        else {
            // same as remote... just add the object type-ahead field to the csv module & set moduleData


        }
        
    }

    async #setNewImagesEvent(data) {
        if (!data.imagePopupExists) {
            // get path of the images to render
            const imagePaths = await GM.OM.getObjectImagePaths(data.objectToRender);
            //console.log(imagePaths);

            const imageModuleData = {
                moduleKey: data.moduleKey,
                moduleData: {
                    objectName: imagePaths.objectName,
                    imageDates: imagePaths.imageDates,
                    imagesToRender: imagePaths.imagesToRender,
                },
                toggleModuleColor: true,
            }

            this.#setModuleDataEvent(imageModuleData);


            // Render images in popup body (and date dropdown)
            const module = GM.MM.getModule(data.moduleKey);
            const moduleData = module.getData('moduleData');
            module.renderObjectImages(data.moduleKey, moduleData);
        }

        if (!GM.PM.isPopupOpen(data.moduleKey)) this.#openModulePopup(data.moduleKey, 0, 0);
    }


    /** --- PUBLIC ---     * At application start, server is pinged to get routes and available objects.
     */
    makeInitialContactWithServer() {
        //this.#getRoutes();
        //this.#getObjects();
        this.#getSavedModules();
    }
    
    /** --- PRIVATE --- 
     * Opens a new popup linked to a specific module.
     * @param {Number} key module key
     * @param {Number} x x position to insert popup element in dom
     * @param {Number} y y position tin insert popup element in dom
     */
    #openModulePopup(key, x, y) {
        //GM.PM.createModulePopup(key, GM.MM.getPopupContentForModule(key), x, y);

        // instead of createModulePopup, set the visibility to visible 
        var modulePopup = GM.MM.getPopupContentForModule(key);
        var popup = modulePopup.content;
        if (popup) {
            var popupWrapper = popup.closest(`#popup-${key}`);
            popupWrapper.style.visibility = "visible";
        }

        // add delay to show the loading screen for minimum 0.5sec?

        // look for popup wrapper
        
        // resize to update width and height of the popup accordingly

    }

    /** ---PRIVATE---
     * Called when a new module is created that requires metadata from the server. Likely a Source module.
     * @param {Number} workerIndex the index of an available webWorker.
     * @param {string} moduleName the name of the new module
     * @param {function} callbackFunction handles the metadata when it is returned. 
     */
    #makeMetadataRequest(moduleKey, callbackFunction) {

        callbackFunction(moduleKey);
        /*GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex, callbackFunction)
            .setWorkerMessageHandler(workerIndex)*/
            //.requestMetadata(workerIndex, moduleName);
    }

    /** --- PRIVATE ---
     * Gets all routes from the server API
     */
    #getRoutes() {
        const workerIndex = this.#getNewWorkerIndex();
        this.#prepWorker(workerIndex, INPUT_MANAGER, 'Routes Loaded Event')
            .getRoutesFromServer(workerIndex);
    }

    /** --- PRIVATE ---
     * Gets a list of all queryable objects from the server API
     */
    #getObjects() {
        const workerIndex = this.#getNewWorkerIndex();
        this.#prepWorker(workerIndex, INPUT_MANAGER, 'Objects Loaded Event')
            .getObjectsFromServer(workerIndex);
    }

    /** --- PRIVATE ---
     * Gets all of the saved modules at startup
     */
    #getSavedModules() {
        const workerIndex = this.#getNewWorkerIndex();
        this.#prepWorker(workerIndex, MODULE_MANAGER, 'Saved Modules Loaded Event')
            .getSavedModulesFromServer(workerIndex);
    }

    /** --- PRIVATE ---
     * Initializes a new worker and sets necessary variables.
     * @param {Number} workerIndex id of the worker that will handle the task
     * @param {Number} messageRecipient id of the recipient of the return message (ie OUTPUT_MANAGER)
     *                             This can be undefined if no message needs to be directed to a specific component.
     * @param {string} returnMessage the message to send upon return 
     *                          This can be undefined if no message needs to be directed to a specific component.
     * @returns the active webworker, ready to handle a job.
     */
    #prepWorker(workerIndex, messageRecipient, returnMessage, moduleKey) {
        if (messageRecipient && returnMessage) {
            var moduleKey = moduleKey ? moduleKey : -1;
            return GM.WM.notifyWorkerOfId(workerIndex)
                .setStopWorkerFunction(workerIndex)
                .setHandleReturnFunction(workerIndex)
                .setWorkerMessageHandler(workerIndex)
                .setWorkerReturnMessageRecipient(workerIndex, messageRecipient)
                .setWorkerReturnMessage(workerIndex, returnMessage, moduleKey)
        } else {
            return GM.WM.notifyWorkerOfId(workerIndex)
                .setStopWorkerFunction(workerIndex)
                .setHandleReturnFunction(workerIndex)
                .setWorkerMessageHandler(workerIndex)
        }

    }

    /** --- PRIVATE ---
     * Starts a new web worker and returns the worker id to the calling function.
     * @returns the id of an active and available worker
     */
    #getNewWorkerIndex() {
        return GM.WM.addWorkerToDataTable(GM.WM.startWorker());
    }

    // This function is called when the run button is pressed.
    // The Pipeline must be validated, jsonified, then sent to the next layer for processing.
    run = () => {
        let m = GM.ENV.getModel();
        GM.PLM.validatePipeline(GM.MM.getModulesForPipeline(m));
    }
}