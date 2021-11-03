/* Envionment Data Table is the central communication hub of the application. All Messages
are routed through this singleton class. */
class Hub {

    publisher;  // publisher. Emits messages to subscribers.
    subscriber; // subscriber variable

    constructor() {
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler);
    };

    /* All Messages from one component to another are handled here. The proper manager is notified through
    the Global Manager. */
    messageHandler = msg => {
        const msgContents = msg.readMessage();
        console.log(msgContents.type);   // Console Log All Events for Debugging.
        switch (msgContents.to) {
            case ENVIRONMENT:
                this.#messageForEnvironment(msgContents.type, msgContents.data);
                break;
            case MODULE_MANAGER:
                this.#messageForModuleManager(msgContents.type, msgContents.data);
                break;
            case INSPECTOR:
                this.#messageForInspector(msgContents.type, msgContents.data);
                break;
            case POPUP_MANAGER:
                this.#messageForPopupManager(msgContents.type, msgContents.data);
                break;
            case INPUT_MANAGER:
                this.#messageForInputManager(msgContents.type, msgContents.data);
                break;
            case DATA_MANAGER:
                this.#messageForDataManager(msgContents.type, msgContents.data);
                break;
            case WORKER_MANAGER:
                this.#messageForWorkerManager(msgContents.type, msgContents.data);
                break;
            case OUTPUT_MANAGER:
                this.#messageForOutputManager(msgContents.type, msgContents.data);
                break;

        }
    };

    /** Hub subscribes */
    subscribe = () => {
        GM.ENV.publisher.subscribe(this.subscriber);
        GM.DM.publisher.subscribe(this.subscriber);
        GM.MSM.publisher.subscribe(this.subscriber);
        GM.MM.publisher.subscribe(this.subscriber);
        GM.INS.publisher.subscribe(this.subscriber);
        GM.IM.publisher.subscribe(this.subscriber);
        GM.PLM.publisher.subscribe(this.subscriber);
        GM.OM.publisher.subscribe(this.subscriber);
        GM.WM.publisher.subscribe(this.subscriber);
        GM.PM.publisher.subscribe(this.subscriber);
    };

    /**
     * Handles all messages for the environment.
     * @param {string} type the event type
     * @param {object} data the data necessary to handle the event. It is event specific.
     */
    #messageForEnvironment = (type, data) => {
        switch (type) {
            case 'New Module Created Event':
                if (data.module && data.templateExists != undefined) GM.ENV.insertModule(data.module, data.templateExists);
                else console.log(`ERROR: parameter error. module: ${data.module}, templateExists: ${data.templateExists}. -- HUB -> #messageForEnvironment (new module created event)`);
                break;
            case 'Start Environment Event':
                GM.ENV.setUpEnvironment();
                break;
            case 'Request Module Key Event':
                if (data.cb != undefined && data.name && data.category) data.cb(data.name, data.category, GM.ENV.getNextNodeKey());
                else console.log(`ERROR: parameter error. callback: ${data.cb}, name: ${data.name}, category: ${data.category} -- HUB -> #messageForEnvironment (request module key event)`);
                break;
            case 'Partial Pipeline Return Event':
                if (data.value != undefined) GM.ENV.updatePipelineProgress(data.value);
                else console.log(`ERROR: parameter error. value: ${data.value}. -- HUB -> #messageForEnvironment (partial pipeline return event)`);
                break;
            case 'Gray Out Pipeline Event':
                if (data.value != undefined) GM.ENV.grayOutPipeline(data.value);
                else console.log(`ERROR: parameter error. value: ${data.value}. -- HUB -> #messageForEnvironment (gray out return event)`);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForEnvironment`);
                console.log(data);
                break;
        }
    }

    /**
     * Handles all messages for the Modules via the module manager
     * @param {string} type the event type
     * @param {object} data the data necessary to handle the event. it is event specific
     */
    #messageForModuleManager = (type, data) => {
        switch (type) {
            case 'Deploy Module Event':
                if (data.moduleName && data.moduleCategory) GM.MM.deployNewModule(data.moduleName, data.moduleCategory);
                else console.log(`ERROR: parameter error. name: ${data.moduleName}, category: ${data.moduleCategory}. -- HUB -> #messageForModuleManager (Deploy Module Event)`);
                break;
            case 'New Data Loaded Event':
                if (data.moduleKey != undefined) GM.MM.newDataLoaded(data.moduleKey);
                else console.log(`ERROR: Parameter Error. key: ${data.moduleKey}. -- HUB -> #mesageForModuleManager (New Data Loaded Event)`);
                break;
            case 'Value Change Event':
                if (data.moduleKey != undefined && data.field && data.newValue != undefined) GM.MM.updateModuleDataTable(data.moduleKey, data.field, data.newValue);
                else console.log(`ERROR: parameter error. key ${data.moduleKey}, field: ${data.field}, newValue: ${data.newValue}. -- HUB -> #messageForModuleManager (Value change event)`);
                break;
            case 'Link Drawn Event': 
                // TODO: Handle Link Drawn Event.
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForModelManager`);
                console.log(data);
                break;
        }
    };

    /**
     * Handles All messages for the Inspector
     * @param {string} type the event type
     * @param {object} data the data necessary to handle the event. It is event specific.
     */
    #messageForInspector = (type, data) => {
        switch (type) {
            case 'Node Selected Event':
                if (data.moduleKey != undefined) {
                    // When user selects a node, the inspector must be updated to show data for that module.
                    GM.INS.setCurrentModuleKey(data.moduleKey);
                    GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
                } else console.log(`ERROR: Parameter error. key: ${data.moduleKey}. -- HUB -> #messageForInspector (Node Selected Event.)`);
                break;
            case 'Clear Inspector Event':
                GM.INS.clearInspector(true);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForInspector`);
                console.log(data);
                break;
        }
    }

    /**
     * Handles all messages for the popups via the popup manager.
     * @param {string} type The event type.
     * @param {object} data the data necessary to handle the event. It is event specific.
     */
    #messageForPopupManager = (type, data) => {
        switch (type) {
            case 'Double Click Event':
                // Module Manager provides the content for the popup.
                if (data.moduleKey != undefined && data.x != undefined && data.y != undefined) GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), data.x, data.y);
                else console.log(`ERROR: Parameter Error. key: ${data.moduleKey}, x: ${data.x}, y: ${data.y}. -- HUB -> #messageForPopupManager (double click event)`);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForPopupManager`);
                console.log(data);
                break;
        }
    };

    /**
     * Handles all messages for the Input Manager
     * @param {string} type the event type
     * @param {object} data the data necessary to handle the event. It is event specific.
     */
    #messageForInputManager = (type, data) => {
        switch (type) {
            case 'Read File Event':
                if (data.type && data.source && data.path && data.moduleKey != undefined) GM.IM.readFile(data.type, data.source, data.path, data.moduleKey);
                else console.log(`ERROR: parameter Error. type: ${data.type}, source: ${data.source}, path: ${data.path}, key: ${data.moduleKey}. HUB -> #messageForInputManager (Read File Event)`);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForInputManager`);
                console.log(data);
                break;
        }
    }

    /**
     * Handles all messages for Workers via worker manager.
     * @param {string} type the event type
     * @param {object} data the data necessary to handle the event. It is event specific.
     */
    #messageForWorkerManager = (type, data) => {
        switch (type) {
            case 'Transmit Pipeline Event':
                if (data.value != undefined) {
                    const worker = GM.WM.startWorker(data.value);
                    const workerIndex = GM.WM.addWorkerToDataTable(worker);
                    GM.WM.notifyWorkerOfId(workerIndex)
                    .setStopWorkerFunction(workerIndex)
                    .setHandleReturnFunction(workerIndex)
                    .setWorkerMessageHandler(workerIndex)
                    .sendPipelineToServer(workerIndex, data.value);
                } else console.log(`ERROR: parameter error. value: ${data.value}. -- HUB -> #mesasgeForWorkerManager (Transmit pipeline event)`);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForWorkerManager`);
                console.log(data);
                break;
        }
    }

    /**
     * Handles all messages for the data manager.
     * @param {string} type The event type.
     * @param {object} data The data required to handle the event. It is event specific.
     */
    #messageForDataManager = (type, data) => {
        switch (type) {
            case 'New Data Event':
                if (data.id !== undefined && data.val != undefined) GM.DM.addData(data.id, data.val);
                else console.log(`ERROR: parameter error. id: ${data.id}, value: ${data.val}. -- HUB -> #messageForDataManager. (new data event)`);
                break;
            case 'Data Request Event':
                if (data.moduleKey && data.callBackFunction) GM.DM.processDataRequest(data.moduleKey, data.callBackFunction);
                else console.log(`ERROR: parameter error. key: ${data.moduleKey}, callback: ${data.callBackFunction}. -- HUB -> #messageForDataManager. (data request event)`);
                break;
            case 'Pipeline Return Event':
                const keyArray = [];
                data.value.forEach(dataObject => {
                    if (dataObject.id != undefined && dataObject.val != undefined) {
                        // Data Is Pushed to the data manager. Then the datamanager sends a new data loaded event. to the module manager
                        GM.DM.addData(dataObject.id, { type: typeof (dataObject.val), data: dataObject.val });
                        keyArray.push(dataObject.id);
                    } else console.log(`ERROR: Parameter Error. id: ${dataObject.id}, value: ${dataObject.val}`);
                    GM.ENV.highlightChangedNodes(keyArray);
                });
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForDataManager`);
                console.log(data);
                break;
        }
    }

    /**
     * Handles All Messages for the Output Manager.
     * @param {string} type The event type.
     * @param {object} data The data needed to handle the event. It is event specific.
     */
    #messageForOutputManager = (type, data) => {
        switch (type) {
            case 'Create New Chart Event':
                if (data.moduleKey != undefined && data.data != undefined && data.type && data.div) {
                    // If successfully able to store chart data, then draw a chart if the popup is open.
                    if (GM.OM.storeChartData(data.moduleKey, data.data, data.type)) {
                        if (GM.PM.isPopupOpen(data.moduleKey)) GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                    }
                } else console.log(`ERROR: Parameter missing. key: ${data.moduleKey}, data: ${data.data}, type: ${data.type}, $div: ${data.div}. -- HUB -> (Create New Chart Event)`);
                break;
            case 'Resize Popup Event':  // This fires when a popup has finished resizing.
                // If there is a chart in the popup window, redraw it when resizing is finished.
                if (data.moduleKey != undefined) {
                    if (GM.OM.popupHasAChart(data.moduleKey)) GM.OM.drawChart(data.moduleKey, GM.PM.getPopupBodyDiv(data.moduleKey), GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                } else console.log(`ERROR: key: ${data.moduleKey}. -- HUB -> messageForOutputManager (resize popup event).`);
                break;
            case 'Start Resize Popup Event':
                // If there is a chart in the popup window, clear it while resizing.
                if (data.moduleKey != undefined) {
                    if (GM.OM.popupHasAChart(data.moduleKey)) GM.PM.clearChart(data.moduleKey);
                } else console.log(`ERROR: key: ${data.moduleKey}. -- HUB -> messageForOutputManager (start resize popup event).`);
                break;
            default:
                console.log(`ERROR: Unhandled event ${type}. -- HUB -> #messageForOutputManager`);
                console.log(data);
                break;
        }
    }

    // This function is called when the run button is pressed.
    // The Pipeline must be validated, jsonified, then sent to the next layer for processing.
    run = () => {
        let m = GM.ENV.getModel();
        m = GM.MM.getModulesForPipeline(m);
        GM.PLM.validatePipeline(m);
    };
}