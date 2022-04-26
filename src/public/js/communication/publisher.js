/**
 * Represents a message publisher. Messages send should ALWAYS BE an instance of class Message.
 */
export class Publisher {
    constructor() {
        this.key = 0;              // Subscriber Counter
        this.subscriberList = [];  // List of subscribers (Should always be 1 unless changing design pattern)
    };

    /**
     * Notifies subscribers of a published message.
     * @param {Message} msg 
     */
    publishMessage = msg => {
        this.subscriberList.forEach(s => {
            s.subscriber.receiveMessage(msg);
        });
    };

    /**
     * When components subscribe to this publisher, they will recieve all messages published by this publisher.
     * @param {Subscriber} sub A Subscriber object that can handle messages. 
     */
    subscribe = sub => {
        this.key++;
        this.subscriberList.push({key: this.key, subscriber: sub});
    }

    printSubscriberList = () => {
        console.log(this.subscriberList);
    }
}