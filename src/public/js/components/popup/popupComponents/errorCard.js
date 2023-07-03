import { GM } from "../../../main.js";


export class ErrorCard {

    #wrapper;
    #errorType;
    #errorCategory;
    #template;
    #content;

    constructor(type, category, data) {
        this.#errorType = type;
        this.#category = category;
        this.#createElements(type, category, data);
        this.#buildCard();
    }

    #createElements(type, category, data) {
        this.#createWrapper();
        this.#createTemplate(type, category);
        this.#createContent(data);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#template);
        this.#template.appendChild(this.#content);
    }

    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['error-wrapper'], []);
    }

    //-------- create base error display template
    // create error base template
    #createTemplate(type, category, data) {
        var errorHeader = this.HF.createNewDiv('', '', ['error-header'], [{ style: 'height', value: '2rem' }]);
        var errorBody = this.HF.createNewDiv('', '', ['error-body'], [{ style: 'height', value: '70%' }]);
        var errorTitle = this.HF.createNewH1('', '', ['error-title'], [], 'Error');


    }


    //-------- switch error type
    // create query error display & append it to the template





    // get/set error message


    // get/set error component






}