import { GM } from "../../../main.js";

export class SeriesCard {

    #wrapper;
    #seriesHeader;
    #seriesContent;
    #seriesDropdowns;
    #seriesArea;
    #addSeriesButton;

    /** 
     *  Creates Series Card instance for the Chart Module Inspector Card
     *  @param { moduleKey } Number key of the module
     *  @param { seriesFields } Array of objects that contains the series information
     *                          (e.g. [{ fieldName: 'object', 
     *                                   series: [{ name: "c-2019-u5", displayName: "C/2019 U5 (PanSTARRS)", dataType: 'category' },..]
     *                                 },..])
     * */
    constructor(moduleKey, seriesFields) {
        //this.#addSeriesAxisOptions = addSeriesAxisOptions.bind(this);
        this.#seriesDropdowns = [];
        this.#createElements(moduleKey, seriesFields);
        this.#buildCard();
    }

    #createElements(moduleKey, seriesFields) {
        this.#createWrapper(moduleKey);
        //this.#createHeader();
        this.#createContent(moduleKey, seriesFields);
    }

    #buildCard() {
        //this.#wrapper.appendChild(this.#seriesHeader);
        this.#wrapper.appendChild(this.#seriesContent);
    }

    //-- Create Wrapper
    #createWrapper(moduleKey) {
        this.#wrapper = GM.HF.createNewDiv(`series-${moduleKey}`, 'series', ['series-tab-content', 'tab-content'], [], [], '');
    }

    //-- Create Header
    /*#createHeader() {
        const seriesInspectorHeader = GM.HF.createNewDiv('', '', ['series-inspector-header', 'header'], [], [], '');
        seriesInspectorHeader.innerHTML = 'Series';
        this.#wrapper.appendChild(seriesInspectorHeader);
        this.#seriesHeader = seriesInspectorHeader;
    }*/

    //-- Create Content
    #createContent(moduleKey, seriesFields) {
        console.log(seriesFields);

        try {
            let contentWrapper = GM.HF.createNewDiv('', '', ['series-content-wrapper'], [], [], '');
            let seriesDropdownArea = GM.HF.createNewDiv('', '', ['series-dropdown-area'], [], [], '');

            //-- Create Dropdown for each seriesField (e.g. telescope, object, etc)
            seriesFields.forEach(fieldData => {
                const fieldName = fieldData.fieldName;
                const series = fieldData.series;

                //-- Dropdown Wrapper for a field
                const seriesDropdownWrapper = GM.HF.createNewDiv('', '', ['series-dropdown-wrapper'], [], [], '');

                const dropdownLabel = GM.HF.createNewLabel(`${fieldName}-${moduleKey}-dropdown`, '', '', ['series-dropdown-label'], [], `${fieldName}: `);

                //-- Create series options for this field
                let options = { "all": "--- Load All ---" };
                series.forEach(s => {
                    if (s.name) {
                        options[s.name] = s.displayName;
                    }
                });

                //-- Create series dropdown
                const dropdown = GM.HF.createNewSelect(`${fieldName}-${moduleKey}-dropdown`, '', ['series-dropdown'], [{ style: "width", value: "70%" }, { style: "height", value: "25px" }], Object.keys(options), Object.values(options));
                const button = GM.HF.createNewButton('', '', ['button', 'add-series-button'], [{ style: "width", value: "30%" }, { style: "height", value: "25px" }], 'button', 'Add Series', false);

                seriesDropdownWrapper.appendChild(dropdownLabel);
                seriesDropdownWrapper.appendChild(dropdown);
                seriesDropdownWrapper.appendChild(button);
                seriesDropdownArea.appendChild(seriesDropdownWrapper);

                this.#createAddSeriesCardFunction(moduleKey, fieldName, series, button);
            });

            //-- Create dropdown options of all possible series
            /*let options = { "none": "---- Select ----" };
            series.forEach(s => {
                if (s.name) {
                    options[s.name] = s.displayName;
                }
            });
            console.log(options);*/

            //-- Create fields dropdown
            /*this.#seriesDropdown = GM.HF.createNewSelect('', '', ['series-dropdown'], [{ style: "width", value: "70%" }, { style: "height", value: "25px" }], Object.keys(options), Object.values(options));
            this.#addSeriesButton = GM.HF.createNewButton('', '', ['button', 'add-series-button'], [{ style: "width", value: "30%" }, { style: "height", value: "25px" }], 'button', 'Add Series', false);
            seriesWrapper.appendChild(this.#seriesDropdown);
            seriesWrapper.appendChild(this.#addSeriesButton);*/

            //-- Create series area where the seriesCard will be loaded
            this.#seriesArea = GM.HF.createNewDiv('', '', ['series-card-area'], [], [], '');

            //-- Append initial content to this series inspector content
            contentWrapper.appendChild(seriesDropdownArea);
            contentWrapper.appendChild(this.#seriesArea);
            this.#seriesContent = contentWrapper;

            //this.#addSeriesAxisOptions(traceCard);
            //this.#createAddSeriesCardFunction(moduleKey, fieldName, series);

        } catch(e) {
            // show error display
            console.error(e);
        }
    }

    /** 
     *  Creates addSeriesCard eventListener to add a seriesCard to seriesArea
     *  @param { fieldName } String Name of the column field from the dataset
     *                              (e.g. "ui_name" (current temporary name for the object name from the dataset))
     *  @param { series } Array of objects that contains the series information
     *                          (e.g. [{ name: "c-2019-u5", displayName: "C/2019 U5 (PanSTARRS)", dataType: 'category' },..])
     * */
    #createAddSeriesCardFunction(moduleKey, fieldName, series, button) {
        button.addEventListener('click', e => {
            //-- Get selected option of a series dropdown
            let dropdown = e.target.previousElementSibling;
            let selected = dropdown.options[dropdown.selectedIndex];
            let selectedSeries = series.filter(s => s.name === selected.value)[0];

            console.log(selectedSeries);

            if (selected.value !== 'all') {
                //-- Get all xAxisRefs and yAxisRefs of currently loaded axisCards in axisAreas
                const chartInspectorWrapper = document.getElementById(`chart-inspector-${moduleKey}`);

                //-- Get xAxisRefs information
                const xTraceArea = chartInspectorWrapper.querySelector(`#xAxis-${moduleKey}`);
                const xAxisElements = xTraceArea.querySelectorAll('.axis-card-wrapper');
                const xAxisRefs = [];
                xAxisElements.forEach((xEl, i) => {
                    const axisName = xEl.getAttribute('id');
                    const dataType = xEl.querySelector('.data-type').value;
                    xAxisRefs.push({ index: i, name: axisName, displayName: axisName, dataType: dataType });
                });
                
                //-- Get yAxisRefs information
                const yTraceArea = chartInspectorWrapper.querySelector(`#yAxis-${moduleKey}`);
                const yAxisElements = yTraceArea.querySelectorAll('.axis-card-wrapper');
                const yAxisRefs = [];
                yAxisElements.forEach((yEl, i) => {
                    const axisName = yEl.getAttribute('id');
                    const dataType = yEl.querySelector('.data-type').value;
                    yAxisRefs.push({ index: i, name: axisName, displayName: axisName, dataType: dataType });
                });

                //-- Create a seriesCard
                var seriesCard = this.#createSeriesCard(fieldName, selectedSeries, xAxisRefs, yAxisRefs);
                //-- Updates axis options for this seriesCard ........................................TODO: revise
                //this.#updateAxisReferenceOptions(seriesCard);
            }
            // else if all, load all the series cards
        });
    }


    /** 
     *  Creates a seriesCard that will be loaded to seriesArea
     *  @param { fieldName } String Name of the column field from the dataset
     *                              (e.g. "ui_name" (current temporary name for the object name from the dataset))
     *  @param { series } Object that contains the series information
     *                          (e.g. { name: "c-2019-u5", displayName: "C/2019 U5 (PanSTARRS)", dataType: 'category' })
     *  @param { xAxisRefs } Object that contains the current xAxis[0] information
     *                          (e.g. { index: 0, name: "iso_date_mid", displayName: 'date' dataType: 'time' })
     *  @param { yAxisRefs } Object that contains the series information
     *                          (e.g. { index: 0, name: "mag", displayName: "magnitude", dataType: 'category', errorName: 'mag_err' })
     * */
    #createSeriesCard(fieldName, selectedSeries, xAxisRefs, yAxisRefs) {
        //-- Load this seriesCard to seriesArea
        let seriesArea = this.#seriesArea;
        const seriesName = selectedSeries.name;
        let seriesCard = GM.HF.createNewDiv(fieldName + '-' + seriesName, '', ['series-card-wrapper'], [], [], '');
        seriesArea.appendChild(seriesCard);

        //-- Create seriesCard header
        let header = GM.HF.createNewDiv('', '', ['series-card-header'], [], [], '');
        let headerText = GM.HF.createNewSpan('', seriesName, ['series-name'], [], selectedSeries.displayName);

        let seriesDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', selectedSeries.dataType);
        let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete_1.png', ['remove-button', 'button'], [], '');
        header.appendChild(headerText);
        header.appendChild(seriesDataType);
        header.appendChild(removeBtn);
        seriesCard.appendChild(header);

        //-- Create removeFunction for this seriesCard
        this.#removeSeriesCardFunction(removeBtn);

        let seriesBody = GM.HF.createNewDiv('', '', ['series-card-body'], [], [], '');

        //-- Create series label input
        let labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper', 'series-card-element'], [], [], '');
        let labelText = GM.HF.createNewSpan('', '', ['label-text'], [], 'Label Name: ');
        let label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
        label.value = selectedSeries.displayName;
        labelWrapper.appendChild(labelText);
        labelWrapper.appendChild(label);
        seriesBody.appendChild(labelWrapper);

        //-- Create xAxisIndex dropdown
        let xAxisIndexVals = xAxisRefs.map(xAxisRef => { return xAxisRef.index });
        let xAxisIndexNames = xAxisRefs.map(xAxisRef => { return xAxisRef.name });

        let xAxisIndexDDWrapper = GM.HF.createNewDiv('', '', ['xaxis-index-dropdown-wrapper', 'series-card-element'], [], [], '');
        let xAxisIndexLabel = GM.HF.createNewSpan('', '', ['xaxis-index-label'], [], 'X Axis:');
        let xAxisIndexDropdown = GM.HF.createNewSelect('', '', ['xaxis-index-dropdown'], [], xAxisIndexVals, xAxisIndexNames);
        xAxisIndexDDWrapper.appendChild(xAxisIndexLabel);
        xAxisIndexDDWrapper.appendChild(xAxisIndexDropdown);
        seriesBody.appendChild(xAxisIndexDDWrapper);

        //-- Create yAxisIndex dropdown
        let yAxisIndexVals = yAxisRefs.map(yAxisRef => { return yAxisRef.index });
        let yAxisIndexNames = yAxisRefs.map(yAxisRef => { return yAxisRef.name });

        let yAxisIndexDDWrapper = GM.HF.createNewDiv('', '', ['yaxis-index-dropdown-wrapper', 'series-card-element'], [], [], '');
        let yAxisIndexLabel = GM.HF.createNewSpan('', '', ['yaxis-index-label'], [], 'Y Axis:');
        let yAxisIndexDropdown = GM.HF.createNewSelect('', '', ['yaxis-index-dropdown'], [], yAxisIndexVals, yAxisIndexNames)
        yAxisIndexDDWrapper.appendChild(yAxisIndexLabel);
        yAxisIndexDDWrapper.appendChild(yAxisIndexDropdown);
        seriesBody.appendChild(yAxisIndexDDWrapper);

        //-- Create error dropdown (if any)
        var errorVals = ['none', yAxisRefs[0].errorName];
        var errorNames = ['-- None --', yAxisRefs[0].errorName];
        let errorDDWrapper = GM.HF.createNewDiv('', '', ['error-dropdown-wrapper', 'series-card-element'], [], [], '');
        let errorLabel = GM.HF.createNewSpan('', '', ['error-label'], [], 'Error: ')
        let errorDropdown = GM.HF.createNewSelect('', '', ['error-dropdown'], [], errorVals, errorNames);
        errorDDWrapper.appendChild(errorLabel);
        errorDDWrapper.appendChild(errorDropdown);
        seriesBody.appendChild(errorDDWrapper);

        //-- Create data point Symbols dropdown
        let datapointSymbolsDDWrapper = GM.HF.createNewDiv('', '', ['symbols-dropdown-wrapper', 'series-card-element'], [], [], '');
        let datapointSymbolsOptions = ['circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'pin', 'arrow'];
        let datapointSymbolsLabel = GM.HF.createNewSpan('', '', ['symbols-label'], [], 'Symbols: ')
        let datapointSymbolsDropdown = GM.HF.createNewSelect('', '', ['symbols-dropdown'], [], datapointSymbolsOptions, datapointSymbolsOptions)
        // select circle as default
        datapointSymbolsDropdown.selectedIndex = 0;
        datapointSymbolsDDWrapper.appendChild(datapointSymbolsLabel);
        datapointSymbolsDDWrapper.appendChild(datapointSymbolsDropdown);
        seriesBody.appendChild(datapointSymbolsDDWrapper);

        //-- Create data point Size range input (0 - 50)
        let datapointSizeRange = GM.HF.createNewRangeInputComponent('', '', ['symbols-size-range-wrapper', 'series-card-element'], [], 'Symbol Size: ', 0, 50, 1, 5);
        seriesBody.appendChild(datapointSizeRange);


        //-- Create data point Label options
        // show: checkbox
        // position: dropdown

        seriesCard.appendChild(seriesBody);
        return seriesCard;
    }


    //-- Removes a seriesCard
    #removeSeriesCardFunction(button) {
        button.addEventListener('click', e => {
            console.log(e.target);
            let seriesArea = e.target.closest('.series-card-area');
            let seriesCard = e.target.closest('.series-card-wrapper');

            seriesArea.removeChild(seriesCard);
        });
    }

/*
    #updateAxisReferenceOptions(traceCard) {
        console.log(traceCard);
        // get xtraceArea
        var axisWrapper = traceCard.closest('.chart-inspector-wrapper');
        console.log(axisWrapper);
        var xAxisTraceArea = axisWrapper.querySelector('#xAxis .trace-area');
        var yAxisTraceArea = axisWrapper.querySelector('#yAxis .trace-area');

        var xTraces = xAxisTraceArea.querySelectorAll('.trace-card-wrapper');
        var yTraces = yAxisTraceArea.querySelectorAll('.trace-card-wrapper');

        var xAxisIndexOptions = [];
        var yAxisIndexOptions = [];
        xTraces.forEach((x, i) => { xAxisIndexOptions.push({ name: x.getAttribute('id'), value: i }) });
        yTraces.forEach((y, i) => { yAxisIndexOptions.push({ name: y.getAttribute('id'), value: i }) });

        var xAxisDD = traceCard.querySelector('.xaxis-index-dropdown-wrapper .xaxis-index-dropdown');
        var yAxisDD = traceCard.querySelector('.yaxis-index-dropdown-wrapper .yaxis-index-dropdown');

        GM.HF.updateSelectOptions(xAxisDD, xAxisIndexOptions);
        GM.HF.updateSelectOptions(yAxisDD, yAxisIndexOptions);
    }*/

    getCard() {
        return { card: this, wrapper: this.#wrapper, content: this.#seriesContent, seriesDropdowns: this.#seriesDropdowns, seriesArea: this.#seriesArea };
    }
}
