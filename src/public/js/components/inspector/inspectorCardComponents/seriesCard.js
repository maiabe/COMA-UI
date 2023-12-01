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

            //-- Create Series Dropdown
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
                const dropdown = GM.HF.createNewSelect(`${fieldName}-${moduleKey}-dropdown`, '', ['series-dropdown'], [], Object.keys(options), Object.values(options));
                const buttonWrapper = GM.HF.createNewDiv('', '', ['add-series-button-wrapper'], [], [], '');
                const button = GM.HF.createNewButton('', '', ['button', 'add-series-button'], [], 'button', 'Add Series', false);

                seriesDropdownWrapper.appendChild(dropdownLabel);
                seriesDropdownWrapper.appendChild(dropdown);
                buttonWrapper.appendChild(button);
                seriesDropdownWrapper.appendChild(buttonWrapper);
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

            //-- Create clear all series button
            const clearAllWrapper = GM.HF.createNewDiv('', '', ['clear-all-wrapper'], [], [], '');
            const clearAll = GM.HF.createNewSpan('', '', ['clear-all', 'button'], [], 'clear');
            clearAllWrapper.appendChild(clearAll);
            this.#createClearSeriesCardFunction(moduleKey, clearAll);

            //-- Create series area where the seriesCard will be loaded
            this.#seriesArea = GM.HF.createNewDiv('', '', ['series-card-area'], [], [], '');

            //-- Append initial content to this series inspector content
            contentWrapper.appendChild(seriesDropdownArea);
            contentWrapper.appendChild(clearAllWrapper);
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
     *  @param { button } HTMLObject of the button that was clicked
     * */
    #createAddSeriesCardFunction(moduleKey, fieldName, series, button) {
        button.addEventListener('click', e => {
            //-- Get selected option of a series dropdown
            let dropdown = e.target.closest('.series-dropdown-wrapper').querySelector('select');
            let selected = dropdown.options[dropdown.selectedIndex];
            let selectedSeries = series.filter(s => s.name === selected.value)[0];

            /*console.log(series);
            console.log(selected.value);*/

            //-- Get xAxisRef and all yAxisRefs of currently loaded axisCards in axisAreas
            const chartInspectorWrapper = document.getElementById(`chart-inspector-${moduleKey}`);

            //-- Get xAxisRef information
            const xAxisArea = chartInspectorWrapper.querySelector(`#xAxis-${moduleKey} .axis-area`);
            const xAxisCard = xAxisArea.querySelector('.axis-card-wrapper.primary');
            const xAxisIndex = Array.from(xAxisArea.children).indexOf(xAxisCard);
            const xAxisName = xAxisCard.getAttribute('id');
            const xDataType = xAxisCard.querySelector('.data-type').value;
            const xAxisRef = { index: xAxisIndex, name: xAxisName, displayName: xAxisName, dataType: xDataType };

            //-- Get yAxisRefs information
            const yAxisArea = chartInspectorWrapper.querySelector(`#yAxis-${moduleKey}`);
            const yAxisCards = yAxisArea.querySelectorAll('.axis-card-wrapper');
            const yAxisRefs = [];
            yAxisCards.forEach((card, i) => {
                const yAxisName = card.getAttribute('id');
                const yDataType = card.querySelector('.data-type').value;
                yAxisRefs.push({ index: i, name: yAxisName, displayName: yAxisName, dataType: yDataType });
            });

            if (selected.value === 'all') {
                series.forEach(s => {
                    this.#createSeriesCard(moduleKey, fieldName, s, xAxisRef, yAxisRefs);
                });
            }
            else {
                //-- Create a seriesCard
                this.#createSeriesCard(moduleKey, fieldName, selectedSeries, xAxisRef, yAxisRefs);
            }
                //-- Create a seriesCard
                //-- Updates axis options for this seriesCard ........................................TODO: revise
                //this.#updateAxisReferenceOptions(seriesCard);
            
        });
    }

    #createClearSeriesCardFunction(moduleKey, button) {
        button.addEventListener('click', e => {
            let seriesArea = e.target.closest('.clear-all-wrapper').nextSibling;
            while (seriesArea.firstElementChild) {
                seriesArea.removeChild(seriesArea.firstElementChild);
            }
        });
    }

    /** 
     *  Creates a seriesCard that will be loaded to seriesArea
     *  @param { moduleKey } Number key of the module
     *                              (e.g. "ui_name" (current temporary name for the object name from the dataset))
     *  @param { fieldName } String Name of the column field from the dataset
     *                              (e.g. "ui_name" (current temporary name for the object name from the dataset))
     *  @param { series } Object that contains the series information
     *                          (e.g. { name: "c-2019-u5", displayName: "C/2019 U5 (PanSTARRS)", dataType: 'category' })
     *  @param { xAxisRef } Object that contains the current primary xAxis information
     *                          (e.g. { index: 0, name: "iso_date_mid", displayName: 'date' dataType: 'time' })
     *  @param { yAxisRefs } Array of objects that contains the series information
     *                          (e.g. { index: 0, name: "mag", displayName: "magnitude", dataType: 'category' })
     * */
    #createSeriesCard(moduleKey, fieldName, selectedSeries, xAxisRef, yAxisRefs) {
        //-- Load this seriesCard to seriesArea if it doesn't exist in the series area already
        let seriesArea = this.#seriesArea;
        const seriesName = selectedSeries.name;
        
        const currentSeriesArea = document.getElementById(`series-${moduleKey}`).querySelector('.series-card-area');
        const seriesExists = currentSeriesArea.querySelector(`#${fieldName}-${seriesName}`);

        if (seriesExists === null) { // Only create series card if the selected series doesn't exist already'
            let seriesCard = GM.HF.createNewDiv(fieldName + '-' + seriesName, '', ['series-card-wrapper'], [], [], '');
            seriesArea.appendChild(seriesCard);

            console.log(seriesArea);
            

            //-- Create seriesCard header
            let header = GM.HF.createNewDiv('', '', ['series-card-header'], [], [], '');
            let headerText = GM.HF.createNewSpan('', seriesName, ['series-name'], [], selectedSeries.displayName);

            let seriesDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', selectedSeries.dataType);
            let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete-icon.png', ['remove-button', 'button'], [], '');
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
            /*let xAxisIndexVals = xAxisRefs.map(xAxisRef => { return xAxisRef.index });
            let xAxisIndexNames = xAxisRefs.map(xAxisRef => { return xAxisRef.name });

            let xAxisIndexDDWrapper = GM.HF.createNewDiv('', '', ['xaxis-index-dropdown-wrapper', 'series-card-element'], [], [], '');
            let xAxisIndexLabel = GM.HF.createNewSpan('', '', ['xaxis-index-label'], [], 'X Axis:');
            let xAxisIndexDropdown = GM.HF.createNewSelect('', '', ['xaxis-index-dropdown'], [], xAxisIndexVals, xAxisIndexNames);
            xAxisIndexDDWrapper.appendChild(xAxisIndexLabel);
            xAxisIndexDDWrapper.appendChild(xAxisIndexDropdown);
            seriesBody.appendChild(xAxisIndexDDWrapper);*/
            let xAxisIndexRefWrapper = GM.HF.createNewDiv('', '', ['xaxis-index-ref-wrapper', 'series-card-element'], [], [], '');
            let xAxisIndexLabel = GM.HF.createNewSpan('', '', ['xaxis-index-label'], [], 'X Axis:');
            let xAxisIndexRef = GM.HF.createNewSpan('', '', ['xaxis-index-ref'], [], xAxisRef.name);
            let xAxisIndexInput = GM.HF.createNewTextInput('', '', ['xaxis-index-input'], [], 'hidden', xAxisRef.index)
            xAxisIndexRefWrapper.appendChild(xAxisIndexLabel);
            xAxisIndexRefWrapper.appendChild(xAxisIndexRef);
            xAxisIndexRefWrapper.appendChild(xAxisIndexInput);
            seriesBody.appendChild(xAxisIndexRefWrapper);


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
            /*var errorVals = ['none', yAxisRefs[0].errorName];
            var errorNames = ['-- None --', yAxisRefs[0].errorName];
            let errorDDWrapper = GM.HF.createNewDiv('', '', ['error-dropdown-wrapper', 'series-card-element'], [], [], '');
            let errorLabel = GM.HF.createNewSpan('', '', ['error-label'], [], 'Error: ')
            let errorDropdown = GM.HF.createNewSelect('', '', ['error-dropdown'], [], errorVals, errorNames);
            errorDDWrapper.appendChild(errorLabel);
            errorDDWrapper.appendChild(errorDropdown);
            seriesBody.appendChild(errorDDWrapper);*/

            //-- Create data point Symbol shape dropdown
            let symbolShapeDDWrapper = GM.HF.createNewDiv('', '', ['symbol-shape-dropdown-wrapper', 'series-card-element'], [], [], '');
            let symbolShapeOptions = ['circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'pin', 'arrow'];
            let symbolShapeLabel = GM.HF.createNewSpan('', '', ['symbol-shape-label'], [], 'Shape: ');
            let symbolShapeDropdown = GM.HF.createNewSelect('', '', ['symbol-shape-dropdown'], [], symbolShapeOptions, symbolShapeOptions);
            // select circle as default
            symbolShapeDropdown.selectedIndex = 0;
            symbolShapeDDWrapper.appendChild(symbolShapeLabel);
            symbolShapeDDWrapper.appendChild(symbolShapeDropdown);
            seriesBody.appendChild(symbolShapeDDWrapper);

            //-- Create data point Symbol color dropdown
            let symbolColorDDWrapper = GM.HF.createNewDiv('', '', ['symbol-color-dropdown-wrapper', 'series-card-element'], [], [], '');
            let symbolColorOptions = { red: '#dd6b66', blue: '#9dc7c8', yellow: '#ffcb77', purple: '#f2d5f8' };
            let symbolColorLabel = GM.HF.createNewSpan('', '', ['symbol-color-label'], [], 'Color: ');
            let symbolColorDropdown = GM.HF.createNewSelect('', '', ['symbol-color-dropdown'], [], Object.values(symbolColorOptions), Object.keys(symbolColorOptions));
            // get index of the seriesCard
            let index = Array.from(seriesArea.children).indexOf(seriesCard);
            let symbolColorOptionsCount = Object.keys(symbolColorOptions).length;
            let symbolColorIndex = index % symbolColorOptionsCount;

            // select red as default
            symbolColorDropdown.selectedIndex = symbolColorIndex;
            symbolColorDDWrapper.appendChild(symbolColorLabel);
            symbolColorDDWrapper.appendChild(symbolColorDropdown);
            seriesBody.appendChild(symbolColorDDWrapper);


            //-- Create data point Size range input (0 - 50)
            let datapointSizeRange = GM.HF.createNewRangeInputComponent('', '', ['symbols-size-range-wrapper', 'series-card-element'], [], 'Symbol Size: ', 0, 50, 1, 5);
            seriesBody.appendChild(datapointSizeRange);


            //-- Create data point Label options
            // show: checkbox
            // position: dropdown

            seriesCard.appendChild(seriesBody);
            return seriesCard;
        }

        // series exists already error
        console.log('ERR_MESSAGE ------------------- series card already exists');
        return null;
    }


    //-- Removes a seriesCard
    #removeSeriesCardFunction(button) {
        button.addEventListener('click', e => {
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