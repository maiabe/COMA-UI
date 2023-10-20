import { GM } from "../../../main.js";
export class ObjectSearchCard {

    #wrapper;
    #searchBar;
    #text;
    #dropdown;

    constructor(objects){
        this.#createElements(objects);
        this.#buildCard();
    }

    #createElements(objects) {
        this.#createWrapper();
        this.#createTextArea();
        this.#createSearchBar();
        this.#createDropdown(objects);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#text);
        this.#wrapper.appendChild(this.#searchBar);
        this.#wrapper.appendChild(this.#dropdown);
    }

    #createTextArea() {
        this.#text = GM.HF.createNewParagraph('','',[], [], 'Select Object');
    }
    #createWrapper() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['inspector-card-objects-search-wrapper'], [], [], '');
    }

    #createSearchBar() {
        this.#searchBar = GM.HF.createNewTextInput('', '', ['inspector-card-objects-search-bar'], []);
    }

    #createDropdown(objects) {
        this.#dropdown = GM.HF.createNewSelect('', '', ['inspector-card-objects-search-dropdown'], [], Object.keys(objects), Object.values(objects));
    }

    getCard() {
        return {wrapper: this.#wrapper, searchbar: this.#searchBar, dropdown: this.#dropdown};
    }
}