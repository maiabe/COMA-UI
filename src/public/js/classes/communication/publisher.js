export class Publisher {
    constructor() {
        this.key = 0;
        this.subscriberList = [];
    };

    publishMessage = msg => {
        this.subscriberList.forEach(s => {
            s.subscriber.receiveMessage(msg);
        });
    };

    subscribe = sub => {
        this.key++;
        this.subscriberList.push({key: this.key, subscriber: sub});
    }

    printSubscriberList = () => {
        console.log(this.subscriberList);
    }
}