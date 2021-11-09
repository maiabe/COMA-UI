import { DivGenerator, ParagraphGenerator, ImgGenerator, InputGenerator, HTMLTableGenerator, SelectGenerator } from "./htmlgeneration.js";
/* This Class has shortcuts for creating and modifying HTML elements in more readable code */
export class HTMLFactory {

    /* These modules build the specific HTML elements. Do not call them directly, but only through this HTML
    factory class */
    #tableGenerator;          // Class that builds HTML Tables with various features.
    #divGenerator;            // Class that builds HTML divs with various features;
    #imgGenerator;            // Class that builds HTML imgs with various features;
    #paragraphGenerator;      // Class that builds HTML p with various features;
    #inputGenerator;          // Class that builds HTML inputs with various features;
    #selectGenerator;

    constructor() {
        this.#tableGenerator = new HTMLTableGenerator();
        this.#divGenerator = new DivGenerator();
        this.#imgGenerator = new ImgGenerator();
        this.#paragraphGenerator = new ParagraphGenerator();
        this.#inputGenerator = new InputGenerator();
        this.#selectGenerator = new SelectGenerator();
    };

    createNewTable(dataTable, rowLimit) {
        return this.#tableGenerator.generateTableFromData(dataTable, rowLimit);
    }

    /** Creates a new HTML div element
     * @param id -> the id of the element (if not adding id, use empty string '')
     * @param name -> the name of the element (if not adding name, use empty string '')
     * @param classlist -> Array of strings, each string is a css classname
     * @param customStyles -> array of objects in the following format
     *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
     *                         value: 'green;}
     * @return the new div
     */
    createNewDiv(id, name, classlist, customStyles) {
        return this.#divGenerator.generateSimpleDiv(id, name, classlist, customStyles);
    }

    /** Creates a new HTML img element
     * @param id -> the id of the element (if not adding id, use empty string '')
     * @param name -> the name of the element (if not adding name, use empty string '')
     * @param src -> the path to the image.
     * @param classlist -> Array of strings, each string is a css classname
     * @param customStyles -> array of objects in the following format
     *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
     *                         value: 'green;}
     * @param alt -> a string for the alt field.
     * @return the new img
     */
    createNewIMG(id, name, src, classlist, customStyles, alt) {
        return this.#imgGenerator.generateNewIMG(id, name, src, classlist, customStyles, alt);
    }

    /** Creates a new HTML p element
     * @param id -> the id of the element (if not adding id, use empty string '')
     * @param name -> the name of the element (if not adding name, use empty string '')
     * @param classlist -> Array of strings, each string is a css classname
     * @param customStyles -> array of objects in the following format
     *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
     *                         value: 'green;}
     * @param text -> a string to display in the p element.
     * @return the new p
     */
    createNewParagraph(id, name, classlist, customStyles, text) {
        return this.#paragraphGenerator.generateNewParagraph(id, name, classlist, customStyles, text);
    }

    /** Creates a new HTML button (input) element
         * @param id -> the id of the element (if not adding id, use empty string '')
         * @param name -> the name of the element (if not adding name, use empty string '')
         * @param classlist -> Array of strings, each string is a css classname
         * @param customStyles -> array of objects in the following format
         *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
         *                         value: 'green;}
         * @param type -> must be 'button' (string)
         * @param value -> Text of the button (string)
         * @param disabeled -> boolean (true = disabeled, false = enabeled )
         * @return the new button
         */
    createNewButton(id, name, classlist, customStyles, type, value, disabled) {
        return this.#inputGenerator.generateButton(id, name, classlist, customStyles, type, value, disabled);
    }

    /** Creates a new HTML file input element
         * @param id -> the id of the element (if not adding id, use empty string '')
         * @param name -> the name of the element (if not adding name, use empty string '')
         * @param classlist -> Array of strings, each string is a css classname
         * @param customStyles -> array of objects in the following format
         *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
         *                         value: 'green;}
         * @param type -> must be 'file' (string)
         * @param disabeled -> boolean (true = disabeled, false = enabeled )
         * @return the new button
         */
    createNewFileInput(id, name, classlist, customStyles, type, disabled) {
        return this.#inputGenerator.generateFileInput(id, name, classlist, customStyles, type, disabled);
    }
    /** Creates a new HTML text input element
             * @param id -> the id of the element (if not adding id, use empty string '')
             * @param name -> the name of the element (if not adding name, use empty string '')
             * @param classlist -> Array of strings, each string is a css classname
             * @param customStyles -> array of objects in the following format
             *                        {style: string (in camelCase)}  ex style: 'backgroundColor',
             *                         value: 'green;}
             * @param type -> must be 'file' (string)
             * @param disabled -> boolean (true = disabeled, false = enabeled )
             * @return the new button
             */
    createNewTextInput(id, name, classlist, customStyles, type, disabled) {
        return this.#inputGenerator.generateFileInput(id, name, classlist, customStyles, type, disabled);
    }

    createNewSelect(id, name, classlist, customStyles, options, optionText) {
        return this.#selectGenerator.generateNewSelect(id, name, classlist, customStyles, options, optionText);
    }

    /** Takes an array of style objects and applies them to an element
     * @param e -> the html element to be styled.
     * @param styleList -> array of objects in the following format
     *                     {style: string (in camelCase)}  ex style: 'backgroundColor',
     *                      value: 'green;}
     */
    static setCustomStyles(e, styleList) {
        styleList.forEach(s => {
            e.style[s.style] = s.value;
        });
    }

    /** Converts a css vh value to pixels
     * @param vh -> a string in the format '10vh'
     * @return the equivalent value in pixels (float)
     */
    static convertVHtoPX = vh => {
        const val = vh.split('vh');
        const n = parseFloat(val);
        return window.innerHeight / 100 * n;
    }

    /** Converts a css vw value to pixels
    * @param vw -> a string in the format '10vw'
    * @return the equivalent value in pixels (float)
    */
    static convertVWtoPX = vw => {
        const val = vw.split('vw');
        const n = parseFloat(val);
        return window.innerWidth / 100 * n;
    }

}