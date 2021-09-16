class Subscriber {
    constructor(msgHandler){
        this.messageHandler = msgHandler;
        this.publisher;
    };

    receiveMessage = msg => {
        this.messageHandler(msg);
    }
}