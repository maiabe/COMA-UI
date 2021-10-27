/* Envionment Data Table is the central communication hub of the application. All Messages
are routed through this singleton class. */
class Hub {

    publisher;   // Public publisher. Emits messages to subscribers.
    subscriber; // Private Subscriber variable

    constructor() {
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler);
    };

    /* All Messages from one component to another are handled here. The proper manager is notified through
    the Global Manager. */
    messageHandler = msg => {
        const msgContents = msg.readMessage();
        console.log(msgContents.type);
        switch (msgContents.to) {
            case ENVIRONMENT:
                this.#messageForEnvironment(msgContents.type, msgContents.data);
                break;
            case MODULE_MANAGER:
                this.#messageForModelManager(msgContents.type, msgContents.data);
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

    #messageForEnvironment = (type, data) => {
        switch (type) {
            case 'New Module Created Event':
                GM.ENV.insertModule(data.module, data.templateExists);
                break;
            case 'Start Environment Event':
                GM.ENV.setUpEnvironment();
                break;
            case 'Request Module Key Event':
                const key = GM.ENV.getNextNodeKey();
                data.cb(data.name, data.category, key);
                break;
            case 'Partial Pipeline Return Event':
                GM.ENV.updatePipelineProgress(data.value);
                break;
            case 'Gray Out Pipeline Event':
                GM.ENV.grayOutPipeline(data.value);
                break;
        }
    }

    #messageForModelManager = (type, data) => {
        switch (type) {
            case 'Deploy Module Event':
                GM.MM.deployNewModule(data.moduleName, data.moduleCategory);
                break;
            case 'New Data Loaded Event':
                GM.MM.newDataLoaded(data.moduleKey);
                break;
            case 'Value Change Event':
                GM.MM.updateModuleDataTable(data.moduleKey, data.field, data.newValue);
                break;
        }
    };

    #messageForInspector = (type, data) => {
        switch (type) {
            case 'Node Selected Event':
                GM.INS.setCurrentModuleKey(data.moduleKey);
                GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
                break;
            case 'Clear Inspector Event':
                GM.INS.clearInspector(true);
        }
    }

    #messageForPopupManager = (type, data) => {
        switch (type) {
            case 'Double Click Event':
                // Module Manager provides the content for the popup.
                GM.PM.createModulePopup(data.moduleKey, GM.MM.getPopupContentForModule(data.moduleKey), data.x, data.y);
                break;
        }
    };

    #messageForInputManager = (type, data) => {
        switch (type) {
            case 'Read File Event':
                GM.IM.readFile(data.type, data.source, data.path, data.moduleKey);
                break;
        }
    }
    #messageForWorkerManager = (type, data) => {
        switch (type) {
            case 'Transmit Pipeline Event':
                GM.WM.startWorker(data.value, GM.WM.handleReturn, GM.WM.stopWorker);
                break;
        }
    }

    #messageForDataManager = (type, data) => {
        switch (type) {
            case 'New Data Event':
                GM.DM.addData(data.id, data.val);
                break;
            case 'Data Request Event':
                GM.DM.processDataRequest(data.moduleKey, data.cb);
                break;
            case 'Pipeline Return Event':
                const keyArray = [];
                data.value.forEach(d => {
                    // Data Is Pushed to the data manager. Then the datamanager sends a new data loaded event. to the module manager
                    GM.DM.addData(d.id, { type: typeof (d.val), data: d.val });
                    keyArray.push(d.id);
                    GM.ENV.highlightChangedNodes(keyArray);
                });
                break;
        }
    }

    #messageForOutputManager = (type, data) => {
        console.log(type);
        switch (type) {
            case 'Create New Chart Event':
                GM.OM.storeChartData(data.moduleKey, data.data, data.type);
                if (GM.PM.isPopupOpen(data.moduleKey)) {
                    GM.OM.drawChart(data.moduleKey, data.div, GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                }
                break;
            case 'Resize Popup Event':
                if (GM.OM.popupHasAChart(data.moduleKey)) {
                    console.log('yup');
                    GM.OM.drawChart(data.moduleKey, GM.PM.getPopupBodyDiv(data.moduleKey), GM.PM.getPopupWidth(data.moduleKey), GM.PM.getPopupHeight(data.moduleKey));
                } else {
                    console.log('oops');
                }
                break
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