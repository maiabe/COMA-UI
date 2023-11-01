import { Output } from "../index.js";
import { LT_OUTPUT, LT_PROCESSOR, LT_SOURCE, MODULE, MODULE_MANAGER, OUTPUT_MANAGER, INPUT_MANAGER, WORKER_MANAGER } from "../../sharedVariables/constants.js";
import { Message } from "../../communication/message.js";



export class ObjectImages extends Output {
    constructor(category, color, shape, key) {
        super(category, color, shape, 'output', 'Object Images', 'images/icons/image_light.png',
            [{ name: 'IN', leftSide: true, type: LT_SOURCE }, { name: 'OUT', leftSide: true, type: LT_OUTPUT }], [], key);
        //this.addData('callOnCreationFunction', true);
        this.addData('inportType', [LT_SOURCE, LT_PROCESSOR]);
        this.addData('outportType', [-1]);
        this.addData('popupWidth', 500);
        this.addData('popupHeight', 500);
    }

    /** --- PUBLIC ---
     * Creates the HTML content to be inserted into the Popup in the DOM. */
    /*#setPopupContent = () => {
        this.addData('popupContent', this.popupContentMaker.getPopupContentWrapper());
        this.addData('imageDiv', this.popupContentMaker.addPlotDiv(this.getData('key')));
    }*/

    // on creation, set the elliptical moduleData in browser's localStorage
    /*getPlanetOrbits = () => {
        // check if localStorage already has the Planet Orbits data
        if (!localStorage.getItem('Planet Orbits')) {
            let moduleKey = this.getData('key');
            //console.log(moduleKey);
            this.sendMessage(new Message(INPUT_MANAGER, MODULE, 'Get Planet Orbits Event', { moduleKey: moduleKey }));
            console.log(moduleKey);
        }
    }*/

    renderObjectImages(moduleKey) {
        const moduleData = this.getData('moduleData');
        console.log(moduleData);
        this.popupContentMaker.createObjectImagesPopup(moduleKey, moduleData.objectName, moduleData.imageDates, moduleData.imagesToRender);
        // PCM create image module popup
    }


    prepInspectorCardData(toModuleKey, fromModuleData, fromKey) {
        console.log(fromModuleData);
        this.sendMessage(new Message(INPUT_MANAGER, MODULE, 'Prep Object Images Event', { moduleKey: toModuleKey, sourceModuleData: fromModuleData, sourceModuleKey: fromKey}));
    }

    /** --- PUBLIC ---  rename to createInspectorCardContent() ?
     * Called by the Hub when an output module is connected to a flow with data.
     * Updates the inspector card and sets up the chartData object.
     * @param {Number} moduleKey key of the module
     * @param {object} moduleData module data for data headers, data, etc
     * */
    updateInspectorCard() {
        var moduleKey = this.getData('key');
        var moduleData = this.getData('moduleData');
        console.log(moduleData);
        if (moduleData) {
            this.inspectorCardMaker.updateImageModuleInspectorCard(moduleKey, moduleData);
        }
    }

    onCreation() {
        //localStorage.clear();
        /*if (!localStorage.getItem('Planet Orbits')) {
            this.sendMessage(new Message(WORKER_MANAGER, MODULE, 'Get Planet Orbits Event'));
        }*/
    }
}