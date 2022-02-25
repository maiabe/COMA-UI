export class DataTable {

    #data;                // 2D array of data
    #metadata;

    constructor(data) {
        this.#data = data;
        this.#metadata = {};
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

    setMetadata() {
        const minMaxArray = [];
        this.setDataTypes(minMaxArray);
        this.setMinMaxValues(minMaxArray);
        this.#metadata.columnHeaders = [];
        this.buildMetadataObject(minMaxArray);
    }

    buildMetadataObject(minMaxArray) {
        const headers = this.getHeaders();
        for (let i = 0; i < minMaxArray.length; i++) {
            this.#metadata.columnHeaders.push({
                name: headers[i],
                dataType: minMaxArray[i].type,
                dataFormat: minMaxArray[i].type,
                min: minMaxArray[i].min,
                max: minMaxArray[i].max
            });
        }
    }

    // {
    //     "metadata": {
    //         "columnHeaders": [
    //             {
    //                 "name": "Date",
    //                 "dataType": "date",
    //                 "dataFormat": "dd/mm/yyyy",
    //                 "min": "19/08/1854",
    //                 "max":"29/09/1854"
    //             },
    //             {
    //                 "name": "Attack",
    //                 "dataType": "int",
    //                 "dataFormat": "int",
    //                 "min": "0",
    //                 "max": "143"
    //             },
    //             {
    //                 "name":"Death",
    //                 "dataType": "int",
    //                 "dataFormat":"int",
    //                 "min":"0",
    //                 "max":"127"
    //             }
    //         ]
    //     },

    setDataTypes(minMaxArray) {
        for (let i = 0; i < this.getColumns(); i++) {
            if (Date.parse(this.#data[1][i]) < 0) {
                minMaxArray.push({ min: Infinity, max: -Infinity, type: 'date' });
            } else if (parseFloat(this.#data[1][i])) {
                minMaxArray.push({ min: Infinity, max: -Infinity, type: 'number' });
            } else if (this.#data[1][0].toString()) {
                minMaxArray.push({ min: Infinity, max: -Infinity, type: 'string' });
            } else {
                minMaxArray.push({min: Infinity, max: Infinity, type: 'unknown'})
            }
        }
    }

    setMinMaxValues(minMaxArray) {
        for (let i = 0; i < this.#data.length; i++) {
            for (let j = 0; j < this.#data[i].length; j++) {
                let val = this.#data[i][j]
                if (minMaxArray[j].type === 'date') {
                    const date = new Date(val);
                    val = date.getTime();
                }
                if (minMaxArray[j].type === 'number') val = parseFloat(val);
                if (minMaxArray[j].min > val) minMaxArray[j].min = val;
                if (minMaxArray[j].max < val) minMaxArray[j].max = val;
            }
        }
        minMaxArray.forEach(element => {
            if (element.type === 'date') {
                element.min = this.convertDateToString(element.min);
                element.max = this.convertDateToString(element.max);
            }
        });

        console.log(minMaxArray)
    }

    convertDateToString(milliseconds) {
        const conversion = new Date(milliseconds);
        return `${conversion.getMonth() + 1}/${conversion.getDate()}/${conversion.getFullYear()}`;
    }

    getHeaders = () => this.#data[0];
    getMetadata = () => this.#metadata;
}