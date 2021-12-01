export class DataTable {

    #data;                // 2D array of data
    
    constructor(data) {
        this.#data = data;
    };

    getRows = () => {
        return this.#data.length;
    }

    getColumns = () => {
        return this.#data[0].length;
    }

    getData = () => {
        return this.#data;
    }

    getNumElements = () => {
        let sum = 0;
        for (let i = 0; i < this.#data.length; i++) {
            for (let j = 0; j < this.#data[i].length; j++) {
                sum++;
            }
        }
        return sum;
    }

    getHeaders = () => this.#data[0];
}