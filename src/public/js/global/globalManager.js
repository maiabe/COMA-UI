/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { ModuleManager } from '../modules/index.js';
import { PipelineManager, Environment } from '../components/environment/index.js';
import { InputManager, OutputManager, ProcessorManager } from '../dataComponents/index.js';
import { WorkerManager } from '../workers/workerManager.js';
import { PopupManager } from '../components/popup/index.js';
import { HTMLFactory } from '../htmlGeneration/index.js';
import { Inspector } from '../components/inspector/index.js';
import { ModuleSelectionMenu } from "../components/moduleSelectionMenu/index.js";
import Hub from '../servers/hub.js';
import { DomManager } from '../components/domManagement/domManager.js';

/** The Global Manager has direct access to all Manager Instances. It should only be used
 * by the HUB to call functions directly on the managers.
 */
export class GlobalManager {

    HUB;                // EnvironmentDataTable (Central Message HUB)
    //DM;                 // Data Manager (holds all active data)
    ENV;                // The GOJS Environment instance;
    MM;                 // The Module Manager
    MSM;                // The Module Selection Menu
    INS;                // The Inspector
    HF;                 // The HTML Factory
    PM;                 // The Popup Manager
    IM;                 // The Input Manager
    OM;                 // The Output Manager
    PSM;                 // The Processor Manager
    PLM;                // The Pipeline MAnager
    WM;                 // Worker Manager
    DOM;                // DOM Manager

    constructor() {
        this.HF = new HTMLFactory();
        this.HUB = new Hub();
        this.ENV = new Environment('environmentDiv');
        this.MSM = new ModuleSelectionMenu();
        this.MM = new ModuleManager();
        this.INS = new Inspector();
        this.PM = new PopupManager();
        this.IM = new InputManager();
        this.OM = new OutputManager();
        this.PSM = new ProcessorManager();
        this.PLM = new PipelineManager();
        this.WM = new WorkerManager();
        this.DOM = new DomManager();
    };

    /** --- PUBLIC ---
     * Initializes the Environment by subscribing to the HUB publisher, creating the GOjs Environemnt,
     * creating the inspector, initializing initial DOM elements, and initializing contact with the 
     * server to get any necessary information for startup.
     */
    startEnvironment = () => {
        this.HUB.subscribe(this);
        this.ENV.setUpEnvironment();
        this.#setEventListeners();
        this.#createInspector();
        this.DOM.initializeDomManager();
        this.#initialServerContact();
    };

    /** --- PRIVATE ---
     * Contacts the server to get any data necessary to start client environment.
     */
    #initialServerContact = () => this.HUB.makeInitialContactWithServer();

    /** --- PRIVATE ---
     * Sets any event listeners, such as the run button.
     */
    #setEventListeners = () => {
        document.getElementById('runButton').addEventListener('click', () => {
            this.HUB.run();
        });
    }

    /** --- PRIVATE ---
     * Creates the inspector DOM Node.
     */
    #createInspector = () => {
        this.INS.createInspectorDomNode();
    }
}
