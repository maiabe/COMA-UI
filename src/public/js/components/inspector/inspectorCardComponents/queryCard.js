import { GM } from "../../../main.js";

// experimental class
export class QueryCard {
    //dataTable;
    constructor(metadata) {
        //this.dataTable = new Map();
        this.card = GM.HF.createNewDiv('', '', ['query-wrapper'], []);
        //this.#createWrapperElement();
        this.#createInspectorCardContent();
    }

    // data range -> minmaxFilter
    // object dropdown
    // button

    /*#createWrapperElement() {

    }*/

    // Build Card
    #createInspectorCardContent() {
        this.#createLayout();

    }

    // Create Layout
    #createLayout() {
        //const wrapper = GM.HF.createNewDiv('', '', ['sql-query-wrapper'], []);

        const dateRangeWrapper = GM.HF.createNewDiv('', '', ['query-date-range-wrapper'], []);
        const cometWrapper = GM.HF.createNewDiv('', '', ['query-comet-wrapper'], []);
        const buttonsWrapper = GM.HF.createNewDiv('', '', ['query-buttons-wrapper'], []);

        const dateRangeLabel = GM.HF.createNewLabel('', '', 'date-range-label', [], [], ['Dates Between: ']);
        const cometLabel = GM.HF.createNewLabel('', '', 'comet-label', [], [], ['Comet: ']);

        //const dateRange = GM.HF.createNewDiv('query-date-range', '', ['range-slider-wrapper'], [], []);
        // create minMaxFilter here 

        const cometDropdown = GM.HF.createNewSelect('cometDD', '', [], [], ['objects', 'objecttypelink', 'objectname', 'tnos', 'centaurs' ], ['objects', 'objecttypelink', 'objectnames', 'tnos', 'centaurs']);
        const queryButton = GM.HF.createNewButton('queryBtn', [], ['query-button'], ['border-radius: 3px'], 'submit', 'Query', '');

        /*const rangeSliderBar = GM.HF.createNewDiv('', '', ['range-slider-background-bar'], [], []);
        const rangeSliderBall_left = GM.HF.createNewDiv('', '', ['range-slider-ball'], [], []);
        const rangeSliderBall_right = GM.HF.createNewDiv('', '', ['range-slider-ball-right'], [], []);*/

        // Create Section Wrappers
        this.card.appendChild(dateRangeWrapper);
        this.card.appendChild(cometWrapper);
        this.card.appendChild(buttonsWrapper);

        // Create Labels for each section
        dateRangeWrapper.appendChild(dateRangeLabel);
        cometWrapper.appendChild(cometLabel);

        // Append Elements to each section
        //dateRangeWrapper.appendChild(dateRange);
        cometWrapper.appendChild(cometDropdown);
        buttonsWrapper.appendChild(queryButton);

        // Range Input Elements


        // Range Slider Elements
        /*dateRange.appendChild(rangeSliderBar);
        dateRange.appendChild(rangeSliderBall_left);
        dateRange.appendChild(rangeSliderBall_right);*/
    }


    // -- data
        // Field Values
        // Table values
        // Conditions
        // Join, UNION, SELET, INNER JOIN, etc


    getHTML = () => this.dataTable.get('wrapper');

    getData = () => this.dataTable;

    getCard = () => this.card;

}

