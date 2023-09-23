import { Publisher, Message, Subscriber } from '../communication/index.js';
import { GM } from '../main.js';
import { InspectorCardMaker } from './components/inspectorCardMaker.js';
import { PopupContentMaker } from './components/popupContentMaker.js';
import { MODULE } from '../sharedVariables/constants.js';
import { HTMLFactory } from '../htmlGeneration/htmlFactory.js';


export class Module {

    #dataTable;
    /*******************************************************************************
     * 
     * All Data is stored in this hash table ( JS Map Object ). 
     * New Data is added through the addData() function.
     * 
     * THE DATA TABLE CAN HAVE THE FOLLOWING FIELDS. NOT ALL MODULES HAVE ALL FIELDS
     * --------------------------------------------------------------------------------------------
     * key (number)                             | Unique Identifier for each module
     * dataKey (Number)                         | Key to Data stored on DataManager
     * inportType (Number)                      | Identifies Allowed links in Environment
     * outportType (Number)                     | Identifies Allowed links in Environment 
     * type (string)                            | Module Type or category, ie. Source
     * color (string)                           | Module color in Environment
     * shape (string)                           | Module shape in Environemnt
     * command (string)                         | Command for server to execute
     * name (string)                            | Module Name ie. CSV File
     * imagePath (string)                       | Path to icon
     * description (string)                     | Module Description
     * chartType (string)                       | ie. bar, scatter
     * coordinateSystem (string)                | ie. cartesian_2d, polar
     * isDataModule (boolean)                   | true if this is a data module (deprecated)
     * linkedToData (boolean)                   | true if connected to a graph with data (deprecated)
     * processed (boolean)                      | true if a module is processed
     * moduleData (Object[])                    | Array of information for module-specific data
     * requestMetadataOnCreation (boolean)      | Some Source models will ping server for metadata
     * popupContent (Object)                    | The HTML to insert into a popup
     * metadata (Object)                        | Headers, min, max etc.
     * conversionCard (Object)                  | Object for the DataConversion Module
     * themeDD (HTML Object)                    | Dropdown for changing echart theme
     * plotDiv (HTML Div Object)                | Div where plots are inserted.
     * inports (Object[])                       | Array of information for building Environment ports
     * outports (Object[])                      | Array of information for building Environment ports
     * getFilterDetailsFunctionArray (Function) | Array of filter functions
     * callOnCreationFunction (Function)        | Request onCreation function to be called
     * onCreationFunction (Function)            | Function to call on creation of module.
     * ----------------------------------------------------------------------------------------------
*/     

    /* The InspectorCardMaker is an object that sits between the Module and the Inspector Card. It
    *  is called by the Module and then calls the InspectorCard */
    inspectorCardMaker;

    /* Works just like the InspectorCardMaker. Module does not directly access the popup. */
    popupContentMaker;

    publisher;

    constructor(type, color, shape, command, name, imagePath, inports, outports, key, description) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.inspectorCardMaker = new InspectorCardMaker(name, color, key);
        this.popupContentMaker = new PopupContentMaker();
        this.setInitialDataValues(type, color, shape, command, name, imagePath, inports, outports, key, description);
        this.HF = new HTMLFactory();
        this.subscriber = new Subscriber(this.messageHandler.bind(this));
        this.inspectorCardMaker.publisher.subscribe(this.subscriber);
        this.popupContentMaker.publisher.subscribe(this.subscriber);
    }

    /**
    * Passes messages from the Modules to the Module Manager
    * @param {Message} msg the message to pass along the chain of command 
    */
    messageHandler = msg => {
        const messageData = msg.readMessage();
        if (messageData.to !== MODULE) {
            msg.updateFrom(MODULE);
            this.sendMessage(msg);
        }
    }

    /** --- PUBLIC ---
     * This data is mostly used by gojs to make the graph node.
     * @param {string} type type of module
     * @param {string} color color of module
     * @param {string} shape shape of module 
     * @param {string} command server command associated with module
     * @param {string} name name of the module
     * @param {string} imagePath path to the image displayed by the module
     * @param {array} inports array of inports
     * @param {array} outports array of outports
     * @param {number} key key of module
     */
    setInitialDataValues = (type, color, shape, command, name, imagePath, inports, outports, key, description) => {
        if (type && color && shape && command && name && imagePath && inports && outports && key) {
            this.addData('type', type);
            this.addData('image', imagePath);
            this.addData('color', color);
            this.addData('shape', shape);
            this.addData('inports', inports);
            this.addData('outports', outports);
            this.addData('name', name);
            this.addData('key', key);
            this.addData('command', command);
            this.addData('description', description);
            this.addData('command', command);
        } else console.log(`ERROR: Missing Parameter. type: ${type}, imagePath: ${imagePath}, color: ${color}, shape: ${shape}, command: ${command}, name: ${name}, inports: ${inports}, outports: ${outports}, key: ${key}. -- Module -> setInitialDataValues`);
    };

    /** --- PUBLIC ---
     * Gets the command that the server will use to identify the action that should be taken for this module in the pipeline.
     * @returns the command associated with this module. */
    getCommand = () => {
        if (this.#dataTable.had('command')) {
            const command = this.#dataTable.get('command');
            if (command !== '') return command;
        } else console.log(`ERROR: command == ${command}. -- Module -> getCommand`);
        return undefined;
    }

    /** --- PUBLIC ---
     * Sets the popup content associated with this module. This is the generic function and will likely be overriden in the child classes. */
    setPopupContent = () => {
        const popupContent = GM.HF.createNewDiv('', '', ['popup-body-wrapper'], []);
        const loadingWrapper = GM.HF.createNewDiv('', '', ['popup-loading-wrapper'], []);
        loadingWrapper.appendChild(GM.HF.createNewIMG('popup-loading-spinner', '', 'images/icons/loading_spinner.gif', [], [{ style: 'width', value: '60px' }], ''));
        popupContent.appendChild(loadingWrapper);
        this.addData('popupContent', popupContent, false, '', false);
    }

    updatePopupContent = (content) => {
        this.addData('popupContent', content, false, '', false);
    }

    /** --- PUBLIC ---
     * Adds data to this modules data hash table.
     * @param {string} key the key for the hash table 
     * @param {any} value to store
     */
    addData = (key, value) => {
        this.#dataTable.set(key, value);
    }

    /** --- PUBLIC ---
     * Removes data of this modules data hash table.
     * @param {string} key the key for the hash table 
     * @param {any} value to store
     */
    removeData = (key) => {
        if (this.getData(key)) {
            this.#dataTable.delete(key);
            return true;
        }
        return false;
    }

    /** --- PUBLIC ---
     * Stores the entire metadata object in the data table. Will overwrite if there is already data there and
     * new data is sent through this function.
     * @param {Object} metadata the metadata object 
     */
    updateMetadata = metadata => {
        this.addData('metadata', metadata);
    }

    /** --- PUBLIC ---
     * Gets a value associated with a key from this module's datatable.
     * @param {string} key 
     * @returns the value if found.*/
    getData = key => {
        if (key != undefined && key !== '') {
            if (this.#dataTable.has(key)) return this.#dataTable.get(key);
            else console.log(`ERROR: No data found for key: ${key}. -- Module -> getData`);
        } else console.log(`ERROR: key: ${key}. -- Module -> getData`);
        return undefined;
    }

    /** --- PUBLIC ---
     * When a module is removed, the inspector card must be deleted.
     * This removes the HTML element from the dom.*/
    deleteInspectorCard = () => this.inspectorCardMaker.deleteInspectorCard();

    /** --- PUBLIC ---
     * Gets the inspector card html element.
     * @returns the HTML Inspector Card*/
    getInspectorCard = () => this.inspectorCardMaker.inspectorCard;

    /** --- PUBLIC ---
     * Gets the content to populate a popup associated with this module.
     * @returns the content to populate the popup associated with this module*/
    getPopupContent = () => {
        return { color: this.getData('color'), content: this.getData('popupContent'), headerText: this.getData('name') };
    }

    onCreation() {
        var moduleKey = this.getData('key');
        console.log(`module-${moduleKey} onCreation`);
    }

    /** --- PUBLIC ---
     * After the old key is used to identify the modules that were part of the saved prefab module, the old
     * keys are removed from the data table.
     */
    destroyOldKey() {
        if (this.#dataTable.has('oldKey')) this.#dataTable.delete('oldKey');
    }

    sendMessage(msg) {
        this.publisher.publishMessage(msg);
    }

}
