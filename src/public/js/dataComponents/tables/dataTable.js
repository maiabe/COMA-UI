// So Far, all data has been stored as this type of object. Data is encapsulated here and accessed through functions
export class DataTable {

    #data;                // 2D array of data
    #metadata;
    #filteredData;

    constructor(data) {
        this.#data = data;
        this.#metadata = {};
        this.#filteredData = null;
    };

    /** --- PUBLIC ---
     * gets the number of rows
     * @returns the number of rows in the table
     */
    getRows = () => {
        return this.#data.length;
    }

    /** --- PUBLIC ---
     * Gets the number of columns in the table
     * @returns the number of columns in the table
     */
    getColumns = () => {
        return this.#data[0].length;
    }

    /** --- PUBLIC ---
     * Gets the dataset. Applies a filter is necessary. If you want guaranteed unfiltered data, call
     * getCleanData()
     * @returns the data set with any applied filters
     */
    getData = () => {
        return this.#filteredData ? this.#filteredData : this.#data;
    }

    /** --- PUBLIC ---
     * Gets data that is guaranteed to not be filtered
     * @returns array of unfiltered data
     */
    getCleanData = () => {
        return this.#data;
    }

    /** --- PUBLIC ---
     * Stores the filtered dataset
     * @param {2D data table} data 
     */
    setFilteredData = (data) => {
        this.#filteredData = data;
    }

    /** --- PUBLIC ---
     * @returns the total number of elements in the data set
     */
    getNumElements = () => {
        let sum = 0;
        for (let i = 0; i < this.#data.length; i++) {
            for (let j = 0; j < this.#data[i].length; j++) {
                sum++;
            }
        }
        return sum;
    }

    /** --- PUBLIC ---
     * Sets the metadata of the dataset when it does not come with metadata from the server.
     */
    setMetadata() {
        this.#metadata = {};
        const minMaxArray = [];
        this.#setDataTypes(minMaxArray);
        this.#setMinMaxValues(minMaxArray);
        this.#metadata.columnHeaders = [];
        this.#buildMetadataObject(minMaxArray);
    }

    /** --- PRIVATE ---
     * Adds the metadata for each column in the data table.
     * @param {{min (any), max (any), type (string)}[]} minMaxArray array of min, max, type for each column in the set
     */
    #buildMetadataObject(minMaxArray) {
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

    /** --- PRIVATE ---
     * This function will try to set the correct datatype
     * @param {{min (any), max (any), type (string)}[]} minMaxArray 
     */
    #setDataTypes(minMaxArray) {
        for (let i = 0; i < this.getColumns(); i++) {
            // It is a date if it has a dash or a slash and can be parsed as a date (this will fail when the data is in milliseconds format or some other date format)
            if (Date.parse(this.#data[1][i]) < 0 && (this.#data[1][i].includes('-') || this.#data[1][i].includes('/'))) {
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

    /** --- PRIVATE ---
     * Sets the min and max of each column
     * @param {{min (any), max (any), type (string)}[]} minMaxArray 
     */
    #setMinMaxValues(minMaxArray) {
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
    }

    replaceMetadata(metadata) {
        this.#metadata = metadata;
    }

    convertDateToString(milliseconds) {
        const conversion = new Date(milliseconds);
        return `${conversion.getMonth() + 1}/${conversion.getDate()}/${conversion.getFullYear()}`;
    }
    updateTable = () => {
        this.setMetadata();
    }
    getHeaders = () => this.#data[0];
    getMetadata = () => this.#metadata;
}