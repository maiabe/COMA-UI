export class ChartDataStorage {

    xAxisField;
    xAxisLabel;
    yAxisField;
    yAxisLabel;
    chartType;
    #dataTable;

    constructor(chartType) {
        this.#dataTable = new Map();
        this.#setData('chartType', chartType);
    }

    listenToXAxisDataChanges(element) {element.addEventListener('change', this.updateXAxisFieldName.bind(this)); }
    listenToYAxisDataChanges(element) {element.addEventListener('change', this.updateYAxisFieldName.bind(this)); }
    listenToXAxisLabelChanges(element) {element.addEventListener('change', this.updateXAxisLabelName.bind(this)); }
    listenToYAxisLabelChanges(element) {element.addEventListener('change', this.updateXAxisLabelName.bind(this)); }

    updateXAxisFieldName = event => this.#setData('xAxisField', event.target.value);
    updateYAxisFieldName = event => this.#setData('yAxisField', event.target.value);
    updateXAxisLabelName = event => console.log(event);
    updateYAxisLabelName = event => console.log(event);

    setInitialValues(xAxisField, yAxisField) {
       this.#setData('xAxisField', xAxisField);
       this.#setData('yAxisField', yAxisField);
    }

    getChartData() {
        return {xAxisField: this.#dataTable.get('xAxisField'), yAxisField: this.#dataTable.get('yAxisField')};
    }

    #setData(key, value) {
        this.#dataTable.set(key, value);
    }
}