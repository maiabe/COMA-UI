import {ModuleManager, DataManager, PopupManager, InputManager, OutputManager, PipelineManager, WorkerManager} from '../managers/managers.js';
import { HTMLFactory } from '../classes/htmlGeneration/htmlgeneration.js';
import Environment from '../classes/components/environment.js';
import Inspector from '../classes/components/inspector.js';
import ModuleSelectionMenu from "../classes/components/moduleSelectionMenu.js";
import Hub from "../servers/hub.js";

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
    };

    startEnvironment = () => {
        this.HUB.subscribe(this);
        this.ENV.setUpEnvironment();
        this.MSM.initializeMenu();
        this.#setEventListeners();
    };

    #setEventListeners = () => {
        document.getElementById('runButton').addEventListener('click', () => {
            this.HUB.run();
        });
    }
}
