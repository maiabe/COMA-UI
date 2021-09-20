class DataManager {

    publisher;
    constructor() {
        this.publisher = new Publisher();
    };

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}