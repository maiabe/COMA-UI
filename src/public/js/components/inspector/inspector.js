/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { Publisher } from '../../communication/index.js';
import { GM } from '../../main.js';
import { HTMLFactory } from '../../htmlGeneration/index.js';

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
        this.HF = new HTMLFactory();
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

    /** --- PUBLIC ---
     * Sets remote dropedown options for a field dropdown */
    setRemoteDropdownOptions(moduleKey, fieldWrapperId, options) {
        console.log(fieldWrapperId);
        const fieldWrapper = document.querySelector(`#search-form-${moduleKey} #${fieldWrapperId}`);
        console.log(fieldWrapper);
        var dropdown = fieldWrapper.querySelector('select');
        if (dropdown) {
            this.HF.updateSelectOptions(dropdown, options);
            return true;
        }
        return false;
    }

    /** --- PUBLIC ---
     * Sets remote objects suggestions for the search form object field */
    setRemoteObjectsSuggestions(moduleKey, fieldWrapperId, data) {
        var success = false;
        try {
            // moduleKey, result
            const fieldWrapper = document.getElementById(fieldWrapperId);            var resultContainer = fieldWrapper.querySelector('.typeahead-result-container');
            resultContainer.innerHTML = '';
            // get responseContainer
            resultContainer.style.display = 'block';

            // append suggestions elements to the resultContainer
            data.forEach(suggestion => {
                console.log(suggestion);
                var suggestionElement = this.HF.createNewDiv('', '', ['object-suggestion'], []);
                suggestionElement.textContent = suggestion.ui_name;
                suggestionElement.addEventListener('click', () => {
                    // When a suggestion is clicked, populate the input with the suggestion
                    fieldWrapper.querySelector('input').setAttribute("object-id", suggestion.id);
                    fieldWrapper.querySelector('input').value = suggestion.ui_name;
                    resultContainer.style.display = 'none';
                });
                resultContainer.appendChild(suggestionElement);
            });

            success = true;
        }
        catch (e) {
            console.log(e);
            console.log('ERROR Setting Remote Objects Suggestions -- inspector 91');
        }

        // append result list to resultContainer
        return success;
    }
    
    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };
}