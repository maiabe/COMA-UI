class OutputManager {
    publisher;
    #outputMap;
    #chartBuilder;
    constructor(){
        this.publisher = new Publisher();
        this.#outputMap = new Map();
        this.#chartBuilder = new ChartBuilder();
    };

    storeChartData = (key, data, type) => {
        if (!this.#outputMap.has(key)) {
            this.#outputMap.set(key, {data: data, type: type, outputType: 'plotly'});
        }
    }

    drawChart = (key, div, width, height) => {
        if (this.#outputMap.has(key)) {
            this.#chartBuilder.plotData(this.#outputMap.get(key).data, this.#outputMap.get(key).type, div, width, height);
        }
    }

    popupHasAChart = key => {
        if (this.#outputMap.has(key)) {
            if (this.#outputMap.get(key).outputType === 'plotly') {
                return true;
            }
        }
        return false;
    }

}