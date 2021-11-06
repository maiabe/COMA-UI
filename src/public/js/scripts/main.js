import {GlobalManager} from '../managers/managers.js';
import { buildTestChart } from './echartsTest.js';

// Global Manager Instance
export let GM;

export const debug = true;

function init() {
    GM = new GlobalManager();
    GM.startEnvironment();
    buildTestChart();
}

window.addEventListener('DOMContentLoaded', init);