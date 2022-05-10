/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Publisher } from '../../communication/index.js';
import { GM } from '../../main.js';

export class Inspector {

    publisher;                  // Message Publisher
    subscriber;                 // Message Subscriber
    #currentModuleKey;          // Key identifying the Highlighted Module
    #moduleCards;

    constructor() {
        this.domNodes = {};
        this.domNodes.container = document.querySelector('#inspector');
        this.publisher = new Publisher();
        this.#currentModuleKey;
        this.contentArea;
        this.#moduleCards = new Map();
    }

    /** --- PUBLIC ---
     * This function is called by the global manager when the application starts. */
    createInspectorDomNode() {
        this.#createInspectorModuleCardContainer();
    }

    /** --- PRIVATE ---
     * Creates the HTML element and stores it in the domNodes object. */
    #createInspectorModuleCardContainer() {
        this.domNodes.moduleCardContainer = GM.HF.createNewDiv('inspector-module-card-container', 'inspector-card-container', ['inspector-card-container'], []);
        this.domNodes.container.appendChild(this.domNodes.moduleCardContainer);
    }

    /** --- PUBLIC ---
     * Gets an inspector card linked to the module whos id is passed
     * @param {Number} id the key of the module linked to the inspector card
     * @returns a module card from the map
     */
    getCard(id) {
        return this.#moduleCards.get(id);
    }

    /** --- PUBLIC ---
     * Called by the Hub when a new module is generated and added to the environment
     * @param {Number} key The id of the module
     * @param {HTML element} card the HTML element of the inspector card
     */
    addModuleCard(key, card) {
        console.log(card)
        this.domNodes.moduleCardContainer.append(card);
        this.#moduleCards.set(key, card);
    }

    /** --- PUBLIC ---
     * Maximizes a single card that matches the key, hides all other elements
     * @param {Number} cardId the module mey to identify the inspector card 
     */
    maximizeCard(cardId) {
        this.#moduleCards.forEach((card, key) => {
            if (key !== cardId) card.style.display = 'none';
            else card.style.display = 'flex';
        });
    }

    /** --- PUBLIC ---
     * Minimizes all Cards */
    minimizeCards() {
        this.#moduleCards.forEach(card => card.style.display = 'flex');
    }
    
    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };
}