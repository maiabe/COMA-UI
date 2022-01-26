import { GM } from "../../../main.js";

export class DataInfoCard {
    #wrapper;
    constructor() {
        this.#wrapper = GM.HF.createNewDiv('', '', ['include-column-card'], []);
    }

    getCard = () => this.#wrapper;
}