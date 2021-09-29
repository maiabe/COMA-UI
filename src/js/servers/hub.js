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
    };

    #messageForEnvironment = (type, data) => {
        console.log(type);
        switch (type) {
            case 'New Module Created Event':
                GM.ENV.insertModule(data.module, data.templateExists);
                break;
            case 'Start Environment Event':
                GM.ENV.setUpEnvironment();
                break;
            case 'Request Module Key Event':
                const key = GM.ENV.getNextNodeKey();
                console.log(key);
                data.cb(data.name, data.category, key);
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
        }
    };

    #messageForInspector = (type, data) => {
        switch (type) {
            case 'Node Selected Event':
                GM.INS.setCurrentModuleKey(data.moduleKey);
                GM.INS.updateContent(data.moduleKey, GM.MM.getInspectorContentForModule(data.moduleKey));
                break;
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
        switch(type) {
            case 'Read File Event':
                GM.IM.readFile(data.type, data.source, data.path, data.moduleKey);
                break;
        }
    }

    #messageForDataManager = (type, data) => {
        switch(type) {
            case 'New Data Event':
                GM.DM.addData(data.id, data.val);
                break;
            case 'Data Request Event':
                GM.DM.processDataRequest(data.moduleKey, data.cb);
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