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
        }
    };

    subscribe = () => {
        GM.ENV.publisher.subscribe(this.subscriber);
        GM.DM.publisher.subscribe(this.subscriber);
        GM.MSM.publisher.subscribe(this.subscriber);
        GM.MM.publisher.subscribe(this.subscriber);
    };

    #messageForEnvironment = (type, data) => {
        console.log(type, data);
        switch (type) {
            case 'New Module Created Event':
                GM.ENV.insertModule(data.module, data.templateExists);
                break;
        }
    }

    #messageForModelManager = (type, data) => {
        switch(type) {
            case 'Deploy Module Event':
                GM.MM.createNewModule(data.moduleName, data.moduleCategory);
                break;
        }
    };

}