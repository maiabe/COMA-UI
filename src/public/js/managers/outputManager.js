class OutputManager {
    publisher;
    #outputMap;
    #chartBuilder;
    constructor() {
        this.publisher = new Publisher();
        this.#outputMap = new Map();
        this.#chartBuilder = new ChartBuilder();
    };

    /**
     * Stores the chart information and data into the outputmap hash table.
     * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this chart.
     * @param {*} data the data that is used for the chart
     * @param {string} type the type of chart. ie. 'bar', 'scatter'
     */
    storeChartData = (key, data, type) => {
        if (key && data && type) {
            if (!this.#outputMap.has(key)) {
                this.#outputMap.set(key, { data: data, type: type, outputType: 'plotly' });
            } else console.log(`ERROR: chart data already exists for key ${key}. -- Output Manager -> storeChartData`);
        } else console.log(`ERROR: parameter error. key ${key}, data: ${data}, type: ${type}. -- OutputManager -> storeChartData`);

    }

    /**
     * Generates data for a chart and calls the chart builder.
     * @param {number} key the key to the chart data.
     * @param {HTML element} div the html element that we will place the chart
     * @param {number} width width of the div in pixels. (number only)
     * @param {number} height height of the div in pixels. (number only)
     */
    drawChart = (key, div, width, height) => {
        if (typeof (width) === 'number' && typeof (height) === 'number') {
            if (key && div) {
                if (this.#outputMap.has(key)) this.#chartBuilder.plotData(this.#outputMap.get(key).data, this.#outputMap.get(key).type, div, width, height);
            } else console.log(`ERROR: missing parameter. key: ${key}, div: ${div}. -- OutputManager -> drawChart`);
        } else console.log(`ERROR: width type = ${typeof (width)} and height type = ${typeof (height)} must be be numbers. -- Output Manager -> drawChart.`);

    }
    /**
     * Checks to see if chart data exists for a specific module.
     * @param {number} key key into the hash table/
     * @returns true if there is a chart for this module, false if not.
     */
    popupHasAChart = key => {
        if (key) {
            if (this.#outputMap.has(key)) {
                if (this.#outputMap.get(key).outputType === 'plotly') return true;
            }
        } else console.log(`ERROR: key: ${key}. -- OutputManager -> popupHasAChart`);
        return false;
    }

}