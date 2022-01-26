import { Publisher, Subscriber } from "../communication/index.js";
import { GM } from '../main.js';
import { ENVIRONMENT, MODULE_MANAGER, INSPECTOR, POPUP_MANAGER, INPUT_MANAGER, DATA_MANAGER, WORKER_MANAGER, OUTPUT_MANAGER, DOM_MANAGER } from '../sharedVariables/constants.js';
import { invalidVariables, printErrorMessage, varTest } from "../errorHandling/errorHandlers.js";
/* Envionment Data Table is the central communication hub of the application. All Messages
are routed through this singleton class. */
export default class Hub {

    publisher;  // publisher. Emits messages to subscribers.
    subscriber; // subscriber variable
    GM;

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
    subscribe = (globalManager) => {
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
        GM.DOM.publisher.subscribe(this.subscriber);
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
                else GM.ENV.insertModule(data.module, data.templateExists, data.groupKey);
                break;
            case 'Start Environment Event':
                GM.ENV.setUpEnvironment();
                break;
            case 'Request Module Key Event':
                if (invalidVariables([varTest(data.cb, 'cb', 'function'), varTest(data.name, 'name', 'string'), varTest(data.category, 'category', 'string')], 'HUB', '#messageForEnvironment (Request Module Key Event')) return;
                else data.cb(data.name, data.category, GM.ENV.getNextNodeKey(), data.oldKey, data.groupKey);
                break;
            case 'Partial Pipeline Return Event':
                if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Partial Pipeline Return Event')) return;
                else GM.ENV.updatePipelineProgress(data.value);
                break;
            case 'Gray Out Pipeline Event':
                if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Gray Out Pipeline Event')) return;
                else GM.ENV.grayOutPipeline(data.value);
                break;
            case 'Draw Link Event':
                console.log(data);
                if (invalidVariables([varTest(data.from, 'from', 'number'), varTest(data.to, 'to', 'number')], 'HUB', '#messageForEnvironment (Draw Link Event')) return;
                GM.ENV.drawLinkBetweenNodes(data.from, data.to);
                break;
            case 'Create Composite Group Event':
                if (invalidVariables([varTest(data.callback, 'callback', 'function')], 'HUB', '#messageForEnivonment (Create Composite Group Event')) return;
                data.callback(GM.ENV.createNewGroupNode(), data.name);
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
                if (GM.MM.checkForNewDataLink(data.toNodeKey, data.fromNodeKey)) {
                    if (GM.MM.getModule(data.toNodeKey).getData('type') === 'Output')
                        GM.MM.updateDynamicInspectorCardField(data.toNodeKey, 'Data Linked', true);
                    GM.MM.getModule(data.toNodeKey).updateInspectorCardWithNewData(GM.MM.getModule(data.fromNodeKey), GM.DM.getData(data.fromNodeKey));
                    GM.MM.getModule(data.toNodeKey).setLinkedDataKey(data.fromNodeKey);
                    if (GM.MM.getModule(data.toNodeKey).storeTableHeaders) GM.MM.getModule(data.toNodeKey).storeTableHeaders(GM.DM.getData(data.fromNodeKey).data.getHeaders());
                }
                break;
            case 'Nodes Deleted Event':
                if (invalidVariables([varTest(data, 'data', 'object')], 'HUB', 'Nodes Deleted Event')) return;
                data.forEach(key => {
                    GM.MM.removeModule(key);
                    GM.OM.removeOutputData(key);
                });
                break;
            case 'New Group Created':
                if (invalidVariables([varTest(data.groupDiagram, 'groupDiagram', 'object'), varTest(data.groupKey, 'groupKey', 'number')], 'HUB', '#messageForModuleManager (New Group Created)')) return;
                let module = GM.MM.createNewCompositeModule(data.groupKey, data.groupDiagram);
                module.createInspectorCompositeDetailCard(data.groupDiagram, module.saveModule.bind(module));
                break;
            case 'Saved Modules Loaded Event':
                if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForModuleManager (Saved Modules Loaded Event)')) return;
                Object.entries(data.data).forEach(module => {
                    GM.MM.storeCompositePrefabData(module[0], module[1]);
                    GM.MSM.addCompositeSubMenuItem(module[0]);
                    GM.MSM.initializeMenu();
                });
                break;
            case 'Composite Module Creation Event':
                if (invalidVariables([varTest(data.moduleName, 'moduleName', 'string')], 'HUB', '#messageForModuleManager (Composite Module Creation Event)')) return;
                    GM.MM.deployCompositeComponents(data.moduleName);
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
                // Temporarily removed as I update the Inspector Interface.
                //GM.INS.setCurrentModuleKey(data.moduleKey);
                //GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
                break;
            case 'Clear Inspector Event':
                GM.INS.clearInspector(true);
                break;
            case 'Publish Module Inspector Card Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.card, 'card', 'object')], 'HUB', '#messageForInspector (publish Module Card Event')) return;
                GM.INS.addModuleCard(data.moduleKey, data.card);
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
            case 'Routes Loaded Event':
                if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Routes Loaded Event')) return;
                GM.IM.addRoutes(data.data);
                GM.DOM.populateRoutesDiv(data.data);
                console.log(data.data);
                break;
            case 'Objects Loaded Event':
                if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Objects Loaded Event')) return;
                GM.IM.addObjects(data.data);
                GM.DOM.populateObjectsDiv(data.data);
                break;
            case 'Request List Of Objects Event':
                if (invalidVariables([varTest(data.callbackFunction, 'callbackFunction', 'function')], 'HUB', '#messageForInputManager (Request List Of Objects Event)')) return;
                let objects = GM.IM.getObjects();
                if (objects === undefined) objects = { '9P': 'Temple 1', '10P': 'Temple 2' };
                data.callbackFunction(objects);
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
        let worker = null;
        let workerIndex = null;
        switch (type) {
            case 'Transmit Pipeline Event':
                worker = GM.WM.startWorker();
                workerIndex = GM.WM.addWorkerToDataTable(worker);
                GM.WM.notifyWorkerOfId(workerIndex)
                    .setStopWorkerFunction(workerIndex)
                    .setHandleReturnFunction(workerIndex)
                    .setWorkerMessageHandler(workerIndex)
                    .sendPipelineToServer(workerIndex, data.value);
                break;
            case 'Save Composite Module Event':
                if (invalidVariables([varTest(data.groupInfo, 'groupInfo', 'object')], 'HUB', '#messageForWorkerManager (Save Composite Module Event)')) return;
                worker = GM.WM.startWorker();
                workerIndex = GM.WM.addWorkerToDataTable(worker);
                GM.WM.notifyWorkerOfId(workerIndex)
                    .setStopWorkerFunction(workerIndex)
                    .setHandleReturnFunction(workerIndex)
                    .setWorkerMessageHandler(workerIndex)
                    .sendCompositeModuleInfoToServer(workerIndex, data.groupInfo);
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
                if (invalidVariables([varTest(data.id, 'id', 'number'), varTest(data.val, 'val', 'object'), varTest(data.linkDataNode, 'linkDataNode', 'boolean')], 'HUB', ' #messageForDataManager. (new data event)')) return;
                else if (GM.DM.addData(data.id, data.val)) {
                    GM.MM.deployNewModule('Data', 'Composite');
                    const module = GM.MM.connectDataModule(data.id);
                    // TODO: If necessary create a link to the pipeline that called the data
                    if (module && data.linkDataNode) {
                        // TODO: Get The correct data and notify the environment.
                        GM.ENV.drawLinkBetweenNodes(module.getData('link'), module.getData('key'));
                        GM.DM.swapDataKeys(module.getData('link'), module.getData('key'));
                    }
                }
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
                if (GM.OM.storeChartData(data.moduleKey, data.data, data.div, data.type)) {
                    // If not chart is opened yet, open one.
                    if (!GM.PM.isPopupOpen(data.moduleKey)) GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), 0, 0);
                    GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                }
                break;
            case 'Resize Popup Event':  // This fires when a popup has finished resizing.
                // If there is a chart in the popup window, redraw it when resizing is finished.
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Resize Popup Event)')) return;
                if (GM.OM.popupHasAChart(data.moduleKey)) GM.OM.resizeChart(data.moduleKey, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                break;
            case 'Start Resize Popup Event':
                //if (GM.OM.popupHasActiveChart(data.moduleKey)) 
                break;
            case 'Popup Closed Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Popup Closed Event)')) return;
                if (GM.OM.popupHasActiveChart(data.moduleKey)) GM.OM.removeChart(data.moduleKey);
                break;
            case 'Change EChart Theme Event':
                if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.theme, 'theme', 'string')], 'HUB', '#messageForOutputManager (Change EChart Theme Event)')) return;
                if (GM.OM.popupHasAChart(data.moduleKey)) {
                    if (GM.OM.changeEchartTheme(data.moduleKey, data.theme)) {
                        if (GM.OM.popupHasActiveChart(data.moduleKey)) GM.OM.redrawEChart(data.moduleKey, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                    }
                }
                break;
            case 'Create New Local Chart Event':
                if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object'), varTest(data.div, 'div', 'object'), varTest(data.type, 'type', 'string')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
                if (GM.DM.hasData(data.datasetKey)) {
                    const chartData = GM.DM.getXYDataWithFields(data.datasetKey, data.fieldData);
                    console.log(data.fieldData);
                    if (GM.OM.storeChartData(data.moduleKey,
                        chartData,
                        data.div,
                        data.type,
                        data.fieldData.xAxisLabel,
                        data.fieldData.yAxisLabel,
                        data.fieldData.xAxisGrid,
                        data.fieldData.yAxisGrid,
                        data.fieldData.xAxisTick,
                        data.fieldData.yAxisTick)) {
                        if (!GM.PM.isPopupOpen(data.moduleKey)) GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), 0, 0);
                        GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                    }
                }
                break;
            case 'Create New Local Table Event':
                if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object'), varTest(data.div, 'div', 'object'), varTest(data.type, 'type', 'string')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
                if (GM.DM.hasData(data.datasetKey)) {
                    const chartData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
                    if (GM.OM.storeChartData(data.moduleKey, chartData, data.div, data.type, '', '')) {
                        if (GM.PM.isPopupOpen(data.moduleKey)) GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                    }
                }
                break;
            case 'Create New CSV File Event':
                if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
                if (GM.DM.hasData(data.datasetKey)) {
                    const tableData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
                    GM.OM.generateCsvFile(tableData);
                }
                break;
            default:
                printErrorMessage(`unhandled switch case`, `type: ${type}. -- HUB -> #messageForOutputManager`);
                break;
        }
    }

    /** 
     * At application start, server is pinged to get routes and available objects.
     */
    makeInitialContactWithServer() {
        this.getRoutes();
        this.getObjects();
        this.getSavedModules();
    }

    getRoutes() {
        const workerIndex = this.getNewWorkerIndex();
        GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex)
            .setWorkerMessageHandler(workerIndex)
            .setWorkerReturnMessageRecipient(workerIndex, INPUT_MANAGER)
            .setWorkerReturnMessage(workerIndex, 'Routes Loaded Event')
            .getRoutesFromServer(workerIndex);
    }

    getObjects() {
        const workerIndex = this.getNewWorkerIndex();
        GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex)
            .setWorkerMessageHandler(workerIndex)
            .setWorkerReturnMessageRecipient(workerIndex, INPUT_MANAGER)
            .setWorkerReturnMessage(workerIndex, 'Objects Loaded Event')
            .getObjectsFromServer(workerIndex);
    }

    getSavedModules() {
        const workerIndex = this.getNewWorkerIndex();
        this.prepWorker(workerIndex, MODULE_MANAGER, 'Saved Modules Loaded Event')
        .getSavedModulesFromServer(workerIndex);
    }

    prepWorker(workerIndex, messageRecipient, returnMessage) {
        return GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex)
            .setWorkerMessageHandler(workerIndex)
            .setWorkerReturnMessageRecipient(workerIndex, messageRecipient)
            .setWorkerReturnMessage(workerIndex, returnMessage)
    }

    getNewWorkerIndex() {
        const worker = GM.WM.startWorker();
        return GM.WM.addWorkerToDataTable(worker);
    }

    // This function is called when the run button is pressed.
    // The Pipeline must be validated, jsonified, then sent to the next layer for processing.
    run = () => {
        let m = GM.ENV.getModel();
        GM.PLM.validatePipeline(GM.MM.getModulesForPipeline(m));
    };
}