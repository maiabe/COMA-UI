/**
 * This class represents a message. It is the object that is passed between components by means of publisher/subscriber communication.
 */
export class Message {

    #to;    // An integer constant referring to the recipient component of the message
    #from;  // An integer constant referring to the sender component of the message
    #type;  // A string represting the type of event that has ocurred
    #data;  // An object containing necessary information to process the event. (Can be any Object in any format, message handler 
            // needs to know how to parse this.)

    constructor(to, from, type, data) {
        this.#to = to;
        this.#from = from;
        this.#type = type;
        this.#data = data;
    }

    /**
     * The function is called when a message is received by a component to access private details.
     * This forces methad passing to be consistent.
     */
    readMessage = () => {
        return {
            to: this.#to,
            from: this.#from,
            type: this.#type,
            data: this.#data
        }
    };

    /**
     * 
     * @param {ing} to A constant value representing one of the components in the application 
     *                 (Found in the file constants.js) 
     * @returns 
     */
    updateTo = to => this.#to = to;

    /**
     * When passing the messages along the chain of responsibility, modules will update the from 
     * field of the message.
     * @param {int} from A constant value representing one of the components in the application. 
     *                   (Found in the file constants.js) 
     * @returns 
     */
    updateFrom = from => this.#from = from;
}