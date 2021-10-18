class Message {

    #to;
    #from;
    #type;
    #data;

    constructor(to, from, type, data) {
        this.#to = to;
        this.#from = from;
        this.#type = type;
        this.#data = data;
    }

    readMessage = () => {
        return {
            to: this.#to,
            from: this.#from,
            type: this.#type,
            data: this.#data
        }
    };
}