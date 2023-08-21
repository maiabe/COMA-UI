import { GM } from "../../../main.js";

export class SeriesCard {

    #wrapper;
    #seriesHeader;
    #seriesContent;
    #fieldDropdown;
    #traceArea;
    #addTraceButton;
    //#addSeriesAxisOptions;

    constructor(fields, defaultField, errorFields) {
        //this.#addSeriesAxisOptions = addSeriesAxisOptions.bind(this);
        this.#createElements(fields, defaultField, errorFields);
        this.#buildCard();
    }

    #createElements(fields, defaultField, errorFields) {
        this.#createWrapper();
        this.#createHeader();
        this.#createContent(fields, defaultField, errorFields);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#seriesHeader);
        this.#wrapper.appendChild(this.#seriesContent);
    }

    //-- Create Wrapper
    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['series-card-wrapper'], []);
    }

    //-- Create Header
    #createHeader() {
        const seriesCardHeader = GM.HF.createNewDiv('', '', ['series-card-header', 'header'], []);
        seriesCardHeader.innerHTML = 'Series';
        this.#wrapper.appendChild(seriesCardHeader);
        this.#seriesHeader = seriesCardHeader;
    }

    #createContent(fields, defaultField, errorFields) {
        console.log(fields);
        console.log(defaultField);
        try { 
            var contentWrapper = GM.HF.createNewDiv('', '', ['series-content-wrapper'], []);

            var fieldsWrapper = GM.HF.createNewDiv('', '', ['fields-dropdown-wrapper'], []);
            var options = { "---- Select ----": "none" };
            fields.forEach(field => {
                if (field.fieldName) {
                    options[field.fieldName] = field.fieldName;
                }
            });

            this.#fieldDropdown = GM.HF.createNewSelect('', '', ['fields-dropdown'], [{ style: "width", value: "70%" }, { style: "height", value: "25px" }], Object.values(options), Object.keys(options));
            this.#addTraceButton = GM.HF.createNewButton(`series-add-trace-button`, '', ['button', 'add-trace-button'], [{ style: "width", value: "30%" }, { style: "height", value: "25px" }], 'button', 'Add Trace', false);
            fieldsWrapper.appendChild(this.#fieldDropdown);
            fieldsWrapper.appendChild(this.#addTraceButton);

            this.#traceArea = GM.HF.createNewDiv('', '', ['trace-area'], []);

            // add default traceCard
            var field = fields[0];
            if (defaultField) {
                // prepare field value and text for creating a trace card
                field = fields.filter(f => f.fieldName === defaultField.fieldName)[0];
            }
            console.log('defaultField: ', field);

            // find error fields
            //var errorFields = this.#findErrorFields(field, fields);
            var traceCard = this.#createTraceCard(field, errorFields);
            contentWrapper.appendChild(fieldsWrapper);
            contentWrapper.appendChild(this.#traceArea);
            this.#seriesContent = contentWrapper;

            //this.#addSeriesAxisOptions(traceCard);
            this.#addTraceFunction(fields, errorFields);

        } catch(e) {
            // show error display
            console.error(e);
        }
    }

    #addTraceFunction(fields, errorFields) {
        const button = this.#addTraceButton;
        button.addEventListener('click', e => {
            // get dropdown selection
            let dropdown = e.target.previousElementSibling;
            let selected = dropdown.options[dropdown.selectedIndex];
            let selectedField = fields.filter(f => f.fieldName === selected.value)[0];
            //let traceArea = e.target.closest('.series-content-wrapper').querySelector('.trace-area');
            // check if the field is already in there
            // if it is, display error message
            //var exists = traceArea.querySelector(`#${selected.value}`);
            if (selected.value !== 'none') {
                // find error values for this field
                //let errorFields = this.#findErrorFields(selectedField, fields);

                // create card entry
                var traceCard = this.#createTraceCard(selectedField, errorFields);
                this.#addSeriesAxisOptions(traceCard);
            }
        });
    }

    #createTraceCard(field, errorFields) {
        var traceArea = this.#traceArea;

        let traceCard = GM.HF.createNewDiv(field.fieldName, '', ['trace-card-wrapper'], []);

        //-- Create traceCard header
        let header = GM.HF.createNewDiv('', '', ['trace-card-header'], []);
        let fieldName = GM.HF.createNewSpan('', '', ['field-name'], [], field.fieldName);
        let fieldDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', field.dataType);
        let fieldGroup = GM.HF.createNewTextInput('', '', ['field-group'], [], 'hidden', field.fieldGroup);
        let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete_1.png', ['remove-button', 'button'], [], '');
        header.appendChild(fieldName);
        header.appendChild(fieldDataType);
        header.appendChild(fieldGroup);
        header.appendChild(removeBtn);
        traceCard.appendChild(header);
        traceArea.appendChild(traceCard);

        //-- Create removeFunction for this traceCard
        this.#removeTraceFunction(removeBtn);

        let body = GM.HF.createNewDiv('', '', ['trace-card-body'], []);

        //-- Create series label input
        let labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper', 'trace-card-element'], []);
        let labelText = GM.HF.createNewSpan('', '', ['label-text'], [], `Label Name: `);
        let label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
        label.value = field.fieldName;
        labelWrapper.appendChild(labelText);
        labelWrapper.appendChild(label);
        body.appendChild(labelWrapper);

        //-- Create xAxisIndex dropdown
        //let xTraceCards = xTraceArea.querySelect('.trace-card-wrapper');
        let xAxisIndexVals = [];
        let xAxisIndexNames = [];
        /*xTraceCards.forEach((xt, i) => {
            xAxisIndexVals.push(i);
            xAxisIndexNames.push(xt.getAttribute('id'));
        });*/

        let xAxisIndexDDWrapper = GM.HF.createNewDiv('', '', ['xaxis-index-dropdown-wrapper', 'trace-card-element'], []);
        let xAxisIndexLabel = GM.HF.createNewSpan('', '', ['xaxis-index-label'], [], 'X Axis:');
        let xAxisIndexDropdown = GM.HF.createNewSelect('', '', ['xaxis-index-dropdown'], [], xAxisIndexVals, xAxisIndexNames)
        xAxisIndexDDWrapper.appendChild(xAxisIndexLabel);
        xAxisIndexDDWrapper.appendChild(xAxisIndexDropdown);
        body.appendChild(xAxisIndexDDWrapper);


        //-- Create yAxisIndex dropdown
        let yAxisIndexVals = [];
        let yAxisIndexNames = [];
        /*yTraceCards.forEach((yt, i) => {
            yAxisIndexVals.push(i);
            yAxisIndexNames.push(yt.getAttribute('id'));
        });*/

        let yAxisIndexDDWrapper = GM.HF.createNewDiv('', '', ['yaxis-index-dropdown-wrapper', 'trace-card-element'], []);
        let yAxisIndexLabel = GM.HF.createNewSpan('', '', ['yaxis-index-label'], [], 'Y Axis:');
        let yAxisIndexDropdown = GM.HF.createNewSelect('', '', ['yaxis-index-dropdown'], [], yAxisIndexVals, yAxisIndexNames)
        yAxisIndexDDWrapper.appendChild(yAxisIndexLabel);
        yAxisIndexDDWrapper.appendChild(yAxisIndexDropdown);
        body.appendChild(yAxisIndexDDWrapper);


        //-- Create error dropdown (if any)
        errorFields = errorFields.map(e => { return e.fieldName });
        let errorDDWrapper = GM.HF.createNewDiv('', '', ['error-dropdown-wrapper', 'trace-card-element'], []);
        let errorLabel = GM.HF.createNewSpan('', '', ['error-label'], [], 'Error: ')
        let errorDropdown = GM.HF.createNewSelect('', '', ['error-dropdown'], [], errorFields, errorFields)
        errorDDWrapper.appendChild(errorLabel);
        errorDDWrapper.appendChild(errorDropdown);
        body.appendChild(errorDDWrapper);

        //-- Create data point Symbols dropdown
        let datapointSymbolsDDWrapper = GM.HF.createNewDiv('', '', ['datapoint-symbols-dropdown-wrapper', 'trace-card-element'], []);
        let datapointSymbolsOptions = ['none', 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'pin', 'arrow'];
        let datapointSymbolsLabel = GM.HF.createNewSpan('', '', ['datapoint-symbols-label'], [], 'Symbols: ')
        let datapointSymbolsDropdown = GM.HF.createNewSelect('', '', ['datapoint-symbols-dropdown'], [], datapointSymbolsOptions, datapointSymbolsOptions)
        datapointSymbolsDDWrapper.appendChild(datapointSymbolsLabel);
        datapointSymbolsDDWrapper.appendChild(datapointSymbolsDropdown);
        body.appendChild(datapointSymbolsDDWrapper);

        //-- Create data point Size range input (0 - 50)
        let datapointSizeRange = GM.HF.createNewRangeInputComponent('', '', ['datapoint-size-range-wrapper', 'trace-card-element'], [], 'Data Point Size: ', 0, 100, 1, 10);
        body.appendChild(datapointSizeRange);


        //-- Create data point Label options
            // show: checkbox
            // position: dropdown



        traceCard.appendChild(body);
        return traceCard;
    }


    #removeTraceFunction(button) {
        button.addEventListener('click', e => {
            //let seriesCardWrapper = e.target.closest('.series-card-wrapper').getAttribute('id');
            let traceArea = e.target.closest('.trace-area');
            let traceCard = e.target.closest('.trace-card-wrapper');

            traceArea.removeChild(traceCard);
        });
    }

   /* #findErrorFields(field, fields) {
        var errorFields = ['mag_err', 'zpmag_error'];
        let fieldName = field.fieldName;
        console.log(fieldName);
        *//*fields.filter(f => {
            if (f.includes(fieldName)) {

            }
        });*//*
        return errorFields;
    }*/

    #addSeriesAxisOptions(traceCard) {
        console.log(traceCard);
        // get xtraceArea
        var axisWrapper = traceCard.closest('.chart-axis-wrapper');
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
    }

    getCard() {
        return { card: this, wrapper: this.#wrapper, content: this.#seriesContent, fieldDropdown: this.#fieldDropdown, traceArea: this.#traceArea };
    }
}
