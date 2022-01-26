import { ModuleManager } from '../modules/index.js';
import { PipelineManager, Environment } from '../components/environment/index.js';
import { DataManager, InputManager, OutputManager } from '../dataComponents/index.js';
import { WorkerManager } from '../workers/workerManager.js';
import { PopupManager } from '../components/popup/index.js';
import { HTMLFactory } from '../htmlGeneration/index.js';
import { Inspector } from '../components/inspector/index.js';
import { ModuleSelectionMenu } from "../components/moduleSelectionMenu/index.js";
import Hub from '../servers/hub.js';
import { DomManager } from '../components/domManagement/domManager.js';

export class GlobalManager {

    HUB;                // EnvironmentDataTable (Central Message HUB)
    DM;                 // Data Manager (holds all active data)
    ENV;                // The GOJS Environment instance;
    MM;                 // The Module Manager
    MSM;                // The Module Selection Menu
    INS;                // The Inspector
    HF;                 // The HTML Factory
    PM;                 // The Popup Manager
    IM;                 // The Input Manager
    OM;                 // The Output Manager
    PLM;                // The Pipeline MAnager
    WM;                 // Worker Manager
    DOM;                // DOM Manager

    constructor() {
        this.HF = new HTMLFactory();
        this.HUB = new Hub();
        this.DM = new DataManager();
        this.ENV = new Environment('environmentDiv');
        this.MSM = new ModuleSelectionMenu();
        this.MM = new ModuleManager();
        this.INS = new Inspector();
        this.PM = new PopupManager();
        this.IM = new InputManager();
        this.OM = new OutputManager();
        this.PLM = new PipelineManager();
        this.WM = new WorkerManager();
        this.DOM = new DomManager();
    };

    startEnvironment = () => {
        this.HUB.subscribe(this);
        this.ENV.setUpEnvironment();
        this.#setEventListeners();
        this.#createInspector();
        this.DOM.initializeDomManager();
        this.#initialServerContact();
    };

    #initialServerContact = () => this.HUB.makeInitialContactWithServer();

    #setEventListeners = () => {
        document.getElementById('runButton').addEventListener('click', () => {
            this.HUB.run();
        });
    }

    #createInspector = () => {
        this.INS.createInspectorDomNode();
    }
}
