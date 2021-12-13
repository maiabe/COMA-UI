export class ChartDataStorage {

    #dataTable;

    constructor(chartType) {
        this.#dataTable = new Map();
        this.#setData('chartType', chartType);
    }

    listenToXAxisDataChanges(element) {element.addEventListener('change', this.updateXAxisFieldName.bind(this)); }
    listenToYAxisDataChanges(element) {element.addEventListener('change', this.updateYAxisFieldName.bind(this)); }
    listenToXAxisLabelChanges(element) {element.addEventListener('change', this.updateXAxisLabel.bind(this)); }
    listenToYAxisLabelChanges(element) {element.addEventListener('change', this.updateYAxisLabel.bind(this)); }

    updateXAxisFieldName = event => this.#setData('xAxisField', event.target.value);
    updateYAxisFieldName = event => this.#setData('yAxisField', event.target.value);
    updateXAxisLabel = event => this.#setData('xAxisLabel', event.target.value);
    updateYAxisLabel = event => this.#setData('yAxisLabel', event.target.value);

    setInitialValues(xAxisField, yAxisField, xAxisLabel, yAxisLabel) {
       this.#setData('xAxisField', xAxisField);
       this.#setData('yAxisField', yAxisField);
       this.#setData('xAxisLabel', xAxisLabel);
       this.#setData('yAxisLabel', yAxisLabel);
    }

    getChartData() {
        return {xAxisField: this.#dataTable.get('xAxisField'), yAxisField: this.#dataTable.get('yAxisField'), xAxisLabel: this.#dataTable.get('xAxisLabel'), yAxisLabel: this.#dataTable.get('yAxisLabel')};
    }

    #setData(key, value) {
        this.#dataTable.set(key, value);
    }
}