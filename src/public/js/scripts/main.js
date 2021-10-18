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
const PIPELINE_MANAGER = 10;
const WORKER_MANAGER = 11;

const rubyRed = '#931621';
const slateGray = '#28464B';
const ming = '#326771';
const blueMunsell = '#2C8C99';
const turquoise = '#42D9C8';
const darkLiver = '#52414C';
const ebony = '#596157';
const middleGreen = '#3f743e';

const darkRed = '#ac232f';
// Viz Pallete
const darkGreen = '#003f5c';
const blue = '#1a3c77';
const darkPurple = '#665191';
const lightPurple = '#a05195';
const pink = '#d45087';
const salmon = '#f95d61';
const darkOrange = '#ff7c42';
const lightOrange = 'ffa600';

const sourceColor = middleGreen;
const processorColor = darkRed;
const outputColor = blue;
// Global Manager Instance
let GM;

function init() {
    GM = new GlobalManager();
    GM.startEnvironment();
}

window.addEventListener('DOMContentLoaded', init);