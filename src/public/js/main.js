import { GlobalManager } from './global/index.js';

// Global Manager Instance
export let GM;

export const debug = true;

function init() {
    GM = new GlobalManager();
    GM.startEnvironment();
    GM.MM.addPublisher(GM.MSM.publisher);
}

window.addEventListener('DOMContentLoaded', init);