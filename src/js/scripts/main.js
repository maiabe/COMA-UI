// These values identify message recepients.
const ENVIRONMENT_DATA_TABLE = 0;
const DATA_MANAGER = 1;
const MODULE_MANAGER = 2;
const ENVIRONMENT = 3;
const MODULE_SELECTION_MENU = 4;
const INSPECTOR = 5;
const POPUP_MANAGER = 6;
const POPUP = 7;
const INPUT_MANAGER = 8;
const OUTPUT_MANAGER = 9;

// Global Manager Instance
let GM;

function init () {
    GM = new GlobalManager();
    GM.startEnvironment();
}

window.addEventListener('DOMContentLoaded', init);