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
                if (invalidVariables([varTest(data.module, 'module', 'object'), varTest(data.templateExists, 'templateExists', 'boolean')], 'HUB', '#messageForEnvironment (New Module Created Event)')) return;
                else GM.ENV.insertModule(data.module, data.templateExists);
                break;
            case 'Start Environment Event':
                GM.ENV.setUpEnvironment();
                break;
            case 'Request Module Key Event':
                if (invalidVariables([varTest(data.cb, 'cb', 'function'), varTest(data.name, 'name', 'string'), varTest(data.category, 'category', 'string')], 'HUB', '#messageForEnvironment (Request Module Key Event')) return;
                else data.cb(data.name, data.category, GM.ENV.getNextNodeKey());
                break;
            case 'Partial Pipeline Return Event':
                if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Partial Pipeline Return Event')) return;
                else GM.ENV.updatePipelineProgress(data.value);
                break;
            case 'Gray Out Pipeline Event':
                if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Gray Out Pipeline Event')) return;
                else GM.ENV.grayOutPipeline(data.value);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForEnvironment`);
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
                if (invalidVariables([varTest(data.moduleName, 'moduleName', 'string'), varTest(data.moduleCategory, 'category', 'string')], 'HUB', '#messageForModuleManager (Deploy Module Event)')) return;
                else GM.MM.deployNewModule(data.moduleName, data.moduleCategory);
                break;
            case 'New Data Loaded Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#mesageForModuleManager (New Data Loaded Event)')) return;
                else GM.MM.newDataLoaded(data.moduleKey);
                break;
            case 'Value Change Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.field, 'field', 'string')], 'HUB', '#messageForModuleManager (Value change event)')) return;
                else GM.MM.updateModuleDataTable(data.moduleKey, data.field, data.newValue);
                break;
            case 'Link Drawn Event':
                // TODO: Handle Link Drawn Event.
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForModuleManager`);
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
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInspector (Node Selected Event.)')) return;
                GM.INS.setCurrentModuleKey(data.moduleKey);
                GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
                break;
            case 'Clear Inspector Event':
                GM.INS.clearInspector(true);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForInspector`);
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
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.x, 'x', 'number'), varTest(data.y, 'y', 'number')], 'HUB', '#messageForPopupManager (double click event)'));
                else GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), data.x, data.y);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForPopupManager`);
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
                if (invalidVariables([varTest(data.type, 'type', 'string'), varTest(data.source, 'source', 'string'), varTest(data.path, 'path', 'string'), varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInputManager (Read File Event)')) return;
                else GM.IM.readFile(data.type, data.source, data.path, data.moduleKey);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForInputManager`);
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
                const worker = GM.WM.startWorker();
                const workerIndex = GM.WM.addWorkerToDataTable(worker);
                GM.WM.notifyWorkerOfId(workerIndex)
                    .setStopWorkerFunction(workerIndex)
                    .setHandleReturnFunction(workerIndex)
                    .setWorkerMessageHandler(workerIndex)
                    .sendPipelineToServer(workerIndex, data.value);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForWorkerManager`);
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
                if (invalidVariables([varTest(data.id, 'id', 'number'), varTest(data.val, 'val', 'object')], 'HUB', ' #messageForDataManager. (new data event)')) return;
                else GM.DM.addData(data.id, data.val);
                break;
            case 'Data Request Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.callBackFunction, 'callbackFunction', 'function')], 'HUB', '#messageForDataManager. (data request event)')) return;
                else GM.DM.processDataRequest(data.moduleKey, data.callBackFunction);
                break;
            case 'Pipeline Return Event':
                const keyArray = [];
                data.value.forEach(dataObject => {
                    if (dataObject.id != undefined && dataObject.val != undefined) {
                        // Data Is Pushed to the data manager. Then the datamanager sends a new data loaded event. to the module manager
                        GM.DM.addData(dataObject.id, { type: typeof (dataObject.val), data: dataObject.val });
                        keyArray.push(dataObject.id);
                    } else printErrorMessage(`Parameter Error.`, `id: ${dataObject.id}, value: ${dataObject.val} -- HUB -> Pipeline Return Event`);
                    GM.ENV.highlightChangedNodes(keyArray);
                });
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForDataManager`);
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
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.data, 'data', 'object'), varTest(data.type, 'type', 'string'), varTest(data.div, 'div', 'object')], 'HUB', '#messageForOutputManager (Create New Chart Event)')) return;
                // If successfully able to store chart data, then draw a chart if the popup is open.
                if (GM.OM.storeChartData(data.moduleKey, data.data, data.type)) {
                    if (GM.PM.isPopupOpen(data.moduleKey)) GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                }
                break;
            case 'Resize Popup Event':  // This fires when a popup has finished resizing.
                // If there is a chart in the popup window, redraw it when resizing is finished.
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Resize Popup Event)')) return;
                if (GM.OM.popupHasAChart(data.moduleKey)) GM.OM.drawChart(data.moduleKey, GM.PM.getPopupBodyDiv(data.moduleKey), GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                break;
            case 'Start Resize Popup Event':
                // If there is a chart in the popup window, clear it while resizing.
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Start Resize Popup Event)')) return;
                if (GM.OM.popupHasAChart(data.moduleKey)) GM.PM.clearChart(data.moduleKey);
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForOutputManager`);
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