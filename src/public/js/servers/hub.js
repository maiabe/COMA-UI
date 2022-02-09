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
        this.messageHandlerMap = new Map();
        this.buildMessageHandlerMap()

    };

    buildMessageHandlerMap() {
        this.messageForOutputManager = new Map();
        this.buildMessageForOutputManagerMap();
        this.messageForDataManager = new Map();
        this.buildMessageForDataManagerMap();
        this.messageForWorkerManager = new Map();
        this.buildMessageForWorkerManagerMap();
        this.messageForInputManager = new Map();
        this.buildMessageForInputManager();
        this.messageForPopupManager = new Map();
        this.buildMessageForPopupManager();
        this.messageForInspector = new Map();
        this.buildMessageForInspector();
        this.messageForModuleManager = new Map();
        this.buildMessageForModuleManager();
        this.messageForEnvironment = new Map();
        this.buildMessageForEnvironment();
        this.messageHandlerMap.set(ENVIRONMENT, this.messageForEnvironment);
        this.messageHandlerMap.set(MODULE_MANAGER, this.messageForModuleManager);
        this.messageHandlerMap.set(INSPECTOR, this.messageForInspector);
        this.messageHandlerMap.set(POPUP_MANAGER, this.messageForPopupManager);
        this.messageHandlerMap.set(INPUT_MANAGER, this.messageForInputManager);
        this.messageHandlerMap.set(DATA_MANAGER, this.messageForDataManager);
        this.messageHandlerMap.set(WORKER_MANAGER, this.messageForWorkerManager);
        this.messageHandlerMap.set(OUTPUT_MANAGER, this.messageForOutputManager);

    }

    /* All Messages from one component to another are handled here. The proper manager is notified through
    the Global Manager. */
    messageHandler = msg => {
        const msgContents = msg.readMessage();
        console.log(msgContents.type);   // Console Log All Events for Debugging.
        if (this.messageHandlerMap.has(msgContents.to)) {
            if (this.messageHandlerMap.get(msgContents.to).has(msgContents.type)) {
                this.messageHandlerMap.get(msgContents.to).get(msgContents.type)(msgContents.data)
            }
        } else console('Cannot Read Message to ' + msgContents.to);

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

    buildMessageForEnvironment() {
        this.messageForEnvironment.set('Create Composite Group Event', this.createCompositeGroupEvent.bind(this));
        this.messageForEnvironment.set('Draw Link Event', this.drawLinkEvent.bind(this));
        this.messageForEnvironment.set('Gray Out Pipeline Event', this.grayOutPipelineEvent.bind(this));
        this.messageForEnvironment.set('Partial Pipeline Return Event', this.partialPipelineReturnEvent.bind(this));
        this.messageForEnvironment.set('Request Module Key Event', this.requestModuleKeyEvent.bind(this));
        this.messageForEnvironment.set('Start Environment Event', this.startEnvironmentEvent.bind(this));
        this.messageForEnvironment.set('New Module Created Event', this.newModuleCreatedEvent.bind(this));
    }

    newModuleCreatedEvent(data) {
        if (invalidVariables([varTest(data.module, 'module', 'object'), varTest(data.templateExists, 'templateExists', 'boolean')], 'HUB', '#messageForEnvironment (New Module Created Event)')) return;
        else GM.ENV.insertModule(data.module, data.templateExists, data.groupKey);
    }

    startEnvironmentEvent(data) {
        GM.ENV.setUpEnvironment();
    }

    requestModuleKeyEvent(data) {
        if (invalidVariables([varTest(data.cb, 'cb', 'function'), varTest(data.name, 'name', 'string'), varTest(data.category, 'category', 'string')], 'HUB', '#messageForEnvironment (Request Module Key Event')) return;
        else data.cb(data.name, data.category, GM.ENV.getNextNodeKey(), data.oldKey, data.groupKey);
    }

    partialPipelineReturnEvent(data) {
        if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Partial Pipeline Return Event')) return;
        else GM.ENV.updatePipelineProgress(data.value);
    }

    grayOutPipelineEvent(data) {
        if (invalidVariables([varTest(data.value, 'value', 'object')], 'HUB', '#messageForEnvironment (Gray Out Pipeline Event')) return;
        else GM.ENV.grayOutPipeline(data.value);
    }

    drawLinkEvent(data) {
        if (invalidVariables([varTest(data.from, 'from', 'number'), varTest(data.to, 'to', 'number')], 'HUB', '#messageForEnvironment (Draw Link Event')) return;
        GM.ENV.drawLinkBetweenNodes(data.from, data.to);
    }

    createCompositeGroupEvent(data) {
        if (invalidVariables([varTest(data.callback, 'callback', 'function')], 'HUB', '#messageForEnivonment (Create Composite Group Event')) return;
        data.callback(GM.ENV.createNewGroupNode(), data.name);
    }

    buildMessageForModuleManager() {
        this.messageForModuleManager.set('Composite Module Creation Event', this.compositeModuleCreationEvent.bind(this));
        this.messageForModuleManager.set('Saved Modules Loaded Event', this.savedModulesLoadedEvent.bind(this));
        this.messageForModuleManager.set('New Group Created', this.newGroupCreated.bind(this));
        this.messageForModuleManager.set('Nodes Deleted Event', this.nodesDeletedEvent.bind(this));
        this.messageForModuleManager.set('Link Drawn Event', this.linkDrawnEvent.bind(this));
        this.messageForModuleManager.set('Value Change Event', this.valueChangeEvent.bind(this));
        this.messageForModuleManager.set('New Data Loaded Event', this.newDataEvent.bind(this));
        this.messageForModuleManager.set('Deploy Module Event', this.deployModuleEvent.bind(this));
    }

    deployModuleEvent(data) {
        if (invalidVariables([varTest(data.moduleName, 'moduleName', 'string'), varTest(data.moduleCategory, 'category', 'string')], 'HUB', '#messageForModuleManager (Deploy Module Event)')) return;
        else GM.MM.deployNewModule(data.moduleName, data.moduleCategory);
    }

    newDataLoadedEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#mesageForModuleManager (New Data Loaded Event)')) return;
        else GM.MM.newDataLoaded(data.moduleKey);
    }

    valueChangeEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.field, 'field', 'string')], 'HUB', '#messageForModuleManager (Value change event)')) return;
        else GM.MM.updateModuleDataTable(data.moduleKey, data.field, data.newValue);
    }

    linkDrawnEvent(data) {
        if (GM.MM.checkForNewDataLink(data.toNodeKey, data.fromNodeKey)) {
            if (GM.MM.getModule(data.toNodeKey).getData('type') === 'Output')
                GM.MM.updateDynamicInspectorCardField(data.toNodeKey, 'Data Linked', true);
            GM.MM.getModule(data.toNodeKey).updateInspectorCardWithNewData(GM.MM.getModule(data.fromNodeKey), GM.DM.getData(data.fromNodeKey));
            GM.MM.getModule(data.toNodeKey).setLinkedDataKey(data.fromNodeKey);
            if (GM.MM.getModule(data.toNodeKey).storeTableHeaders) GM.MM.getModule(data.toNodeKey).storeTableHeaders(GM.DM.getData(data.fromNodeKey).data.getHeaders());
        }
    }

    nodesDeletedEvent(data) {
        if (invalidVariables([varTest(data, 'data', 'object')], 'HUB', 'Nodes Deleted Event')) return;
        data.forEach(key => {
            GM.MM.removeModule(key);
            GM.OM.removeOutputData(key);
        });
    }
    newGroupCreated(data) {
        if (invalidVariables([varTest(data.groupDiagram, 'groupDiagram', 'object'), varTest(data.groupKey, 'groupKey', 'number')], 'HUB', '#messageForModuleManager (New Group Created)')) return;
        let module = GM.MM.createNewCompositeModule(data.groupKey, data.groupDiagram);
        module.createInspectorCompositeDetailCard(data.groupDiagram, module.saveModule.bind(module));
    }
    savedModulesLoadedEvent(data) {
        if (data.data !== 'No Saved Modules Found') {
            Object.entries(data.data).forEach(module => {
                GM.MM.storeCompositePrefabData(module[0], module[1]);
                GM.MSM.addCompositeSubMenuItem(module[0]);
            });
        }
        GM.MSM.initializeMenu();
    }

    compositeModuleCreationEvent(data) {
        if (invalidVariables([varTest(data.moduleName, 'moduleName', 'string')], 'HUB', '#messageForModuleManager (Composite Module Creation Event)')) return;
        GM.MM.deployCompositeComponents(data.moduleName);
    }

    buildMessageForInspector() {
        this.messageForInspector.set('Publish Module Inspector Card Event', this.publishModuleInspectorCardEvent.bind(this));
        this.messageForInspector.set('Clear Inspector Event', this.clearInspectorEvent.bind(this));
        this.messageForInspector.set('Node Selected Event', this.nodeSelectedEvent.bind(this));
    }

    nodeSelectedEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInspector (Node Selected Event.)')) return;
        // Temporarily removed as I update the Inspector Interface.
        //GM.INS.setCurrentModuleKey(data.moduleKey);
        //GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
    }

    clearInspectorEvent() {
        GM.INS.clearInspector(true);
    }

    publishModuleInspectorCardEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.card, 'card', 'object')], 'HUB', '#messageForInspector (publish Module Card Event')) return;
        GM.INS.addModuleCard(data.moduleKey, data.card);
    }

    buildMessageForPopupManager() {
        this.messageForPopupManager.set('Create Save Composite Popup Event', this.createSaveCompositePopupEvent.bind(this));
        this.messageForPopupManager.set('Double Click Event', this.doubleClickEvent.bind(this));
    }

    doubleClickEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.x, 'x', 'number'), varTest(data.y, 'y', 'number')], 'HUB', '#messageForPopupManager (double click event)'));
        else GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), data.x, data.y);
    }

    createSaveCompositePopupEvent(data) {
        if (invalidVariables([varTest(data.content, 'content', 'object'), varTest(data.color, 'color', 'string'), varTest(data.headerText, 'headerText', 'string')], 'HUB', '#messageForPopupManager (Create Save Composite Popup Event)')) return;
        else GM.PM.createOtherPopup(data);
    }
    buildMessageForInputManager() {
        this.messageForInputManager.set('Request List Of Objects Event', this.requestListOfObjectsEvent.bind(this));
        this.messageForInputManager.set('Objects Loaded Event', this.objectsLoadedEvent.bind(this));
        this.messageForInputManager.set('Routes Loaded Event', this.routesLoadedEvent.bind(this));
        this.messageForInputManager.set('Read File Event', this.readFileEvent.bind(this));
    }
    readFileEvent(data) {
        if (invalidVariables([varTest(data.type, 'type', 'string'), varTest(data.source, 'source', 'string'), varTest(data.path, 'path', 'string'), varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForInputManager (Read File Event)')) return;
        else GM.IM.readFile(data.type, data.source, data.path, data.moduleKey);
    }

    routesLoadedEvent(data) {
        if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Routes Loaded Event')) return;
        GM.IM.addRoutes(data.data);
        GM.DOM.populateRoutesDiv(data.data);
    }

    objectsLoadedEvent(data) {
        if (invalidVariables([varTest(data.data, 'data', 'object')], 'HUB', '#messageForInputManager (Objects Loaded Event')) return;
        GM.IM.addObjects(data.data);
        GM.DOM.populateObjectsDiv(data.data);
    }

    requestListOfObjectsEvent(data) {
        if (invalidVariables([varTest(data.callbackFunction, 'callbackFunction', 'function')], 'HUB', '#messageForInputManager (Request List Of Objects Event)')) return;
        let objects = GM.IM.getObjects();
        if (objects === undefined) objects = { '9P': 'Temple 1', '10P': 'Temple 2' };
        data.callbackFunction(objects);
    }

    buildMessageForWorkerManagerMap() {
        this.messageForWorkerManager.set('Transmit Pipeline Event', this.transmitPipelineEvent.bind(this));
        this.messageForWorkerManager.set('Save Composite Module Event', this.saveCompositeModuleEvent.bind(this));
    }

    saveCompositeModuleEvent(data) {
        if (invalidVariables([varTest(data.groupInfo, 'groupInfo', 'object'), varTest(data.name, 'name', 'string'), varTest(data.description, 'description', 'string')], 'HUB', '#messageForWorkerManager (Save Composite Module Event)')) return;
        let worker = null;
        let workerIndex = null;
        worker = GM.WM.startWorker();
        workerIndex = GM.WM.addWorkerToDataTable(worker);
        GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex)
            .setWorkerMessageHandler(workerIndex)
            .sendCompositeModuleInfoToServer(workerIndex, data);
    }

    transmitPipelineEvent(data) {
        let worker = null;
        let workerIndex = null;
        worker = GM.WM.startWorker();
        workerIndex = GM.WM.addWorkerToDataTable(worker);
        GM.WM.notifyWorkerOfId(workerIndex)
            .setStopWorkerFunction(workerIndex)
            .setHandleReturnFunction(workerIndex)
            .setWorkerMessageHandler(workerIndex)
            .sendPipelineToServer(workerIndex, data.value);
    }

    buildMessageForDataManagerMap() {
        this.messageForDataManager.set('Pipeline Return Event', this.pipelineReturnEvent.bind(this));
        this.messageForDataManager.set('Data Request Event', this.dataRequestEvent.bind(this));
        this.messageForDataManager.set('New Data Event', this.newDataEvent.bind(this));
    }

    newDataEvent(data) {
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
    }

    dataRequestEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.callBackFunction, 'callbackFunction', 'function')], 'HUB', '#messageForDataManager. (data request event)')) return;
        else GM.DM.processDataRequest(data.moduleKey, data.callBackFunction);
    }

    pipelineReturnEvent(data) {
        const keyArray = [];
        data.value.forEach(dataObject => {
            if (dataObject.id != undefined && dataObject.val != undefined) {
                // Data Is Pushed to the data manager. Then the datamanager sends a new data loaded event. to the module manager
                GM.DM.addData(dataObject.id, { type: typeof (dataObject.val), data: dataObject.val });
                keyArray.push(dataObject.id);
            } else printErrorMessage(`Parameter Error.`, `id: ${dataObject.id}, value: ${dataObject.val} -- HUB -> Pipeline Return Event`);
            GM.ENV.highlightChangedNodes(keyArray);
        });
    }

    buildMessageForOutputManagerMap() {
        this.messageForOutputManager.set('Create New CSV File Event', this.createNewCSVFileEvent.bind(this));
        this.messageForOutputManager.set('Create New Local Table Event', this.createNewLocalTableEvent.bind(this));
        this.messageForOutputManager.set('Create New Local Chart Event', this.createNewLocalChartEvent.bind(this));
        this.messageForOutputManager.set('Change EChart Theme Event', this.createEChartThemeEvent.bind(this));
        this.messageForOutputManager.set('Popup Closed Event', this.createPopupClosedEvent.bind(this));
        this.messageForOutputManager.set('Resize Popup Event', this.createResizePopupEvent.bind(this));
        this.messageForOutputManager.set('Create New Chart Event', this.createNewChartEvent.bind(this));
    }

    createNewChartEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.data, 'data', 'object'), varTest(data.type, 'type', 'string'), varTest(data.div, 'div', 'object')], 'HUB', '#messageForOutputManager (Create New Chart Event)')) return;
        // If successfully able to store chart data, then draw a chart if the popup is open.
        if (GM.OM.storeChartData(data.moduleKey, data.data, data.div, data.type)) {
            // If not chart is opened yet, open one.
            if (!GM.PM.isPopupOpen(data.moduleKey)) GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), 0, 0);
            GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
        }
    }
    createResizePopupEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Resize Popup Event)')) return;
        if (GM.OM.popupHasAChart(data.moduleKey)) GM.OM.resizeChart(data.moduleKey, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
    }

    createPopupClosedEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number')], 'HUB', '#messageForOutputManager (Popup Closed Event)')) return;
        if (GM.OM.popupHasActiveChart(data.moduleKey)) GM.OM.removeChart(data.moduleKey);
    }

    createEChartThemeEvent(data) {
        if (invalidVariables([varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.theme, 'theme', 'string')], 'HUB', '#messageForOutputManager (Change EChart Theme Event)')) return;
        if (GM.OM.popupHasAChart(data.moduleKey)) {
            if (GM.OM.changeEchartTheme(data.moduleKey, data.theme)) {
                if (GM.OM.popupHasActiveChart(data.moduleKey)) GM.OM.redrawEChart(data.moduleKey, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
            }
        }
    }
    createNewLocalChartEvent(data) {
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
    }
    createNewCSVFileEvent(data) {
        if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
        if (GM.DM.hasData(data.datasetKey)) {
            const tableData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
            GM.OM.generateCsvFile(tableData);
        }
    }

    createNewLocalTableEvent(data) {
        if (invalidVariables([varTest(data.datasetKey, 'datasetKey', 'number'), varTest(data.moduleKey, 'moduleKey', 'number'), varTest(data.fieldData, 'fieldData', 'object'), varTest(data.div, 'div', 'object'), varTest(data.type, 'type', 'string')], 'HUB', '#messageForOutputManager (Create Local Chart Event)')) return;
        if (GM.DM.hasData(data.datasetKey)) {
            const chartData = GM.DM.getTableDataWithFields(data.datasetKey, data.fieldData);
            if (GM.OM.storeChartData(data.moduleKey, chartData, data.div, data.type, '', '')) {
                if (GM.PM.isPopupOpen(data.moduleKey)) GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
            }
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