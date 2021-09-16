class GlobalManager {

    HUB;                // EnvironmentDataTable (Central Message HUB)
    DM;                 // Data Manager (holds all active data)
    ENV;                // The GOJS Environment instance;
    MM;                 // The Module Manager
    MSM;                // The Module Selection Menu

    constructor() {
        this.HUB = new Hub();
        this.DM = new DataManager();
        this.ENV = new Environment('environmentDiv');
        this.MSM = new ModuleSelectionMenu();
        this.MM = new ModuleManager();
    };

    startEnvironment = () => {
        this.HUB.subscribe();
        this.ENV.setUpEnvironment();
    };
}