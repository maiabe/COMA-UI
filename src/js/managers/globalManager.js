class GlobalManager {

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
    };

    startEnvironment = () => {
        this.HUB.subscribe();
        this.ENV.setUpEnvironment();
        this.MSM.initializeMenu();
    };
}