
import { moduleDataObject } from "../../sharedVariables/moduleData.js";

export class ModuleGenerator {
    constructor() {
        this.generationMap = new Map();
        this.populateGenerationMap();
    }

    populateGenerationMap() {
        moduleDataObject.forEach(module => {
            this.generationMap.set(module.key, module.moduleCreationFunction);
        });
        console.log(this.generationMap);
    }
    /**
     * Generates a new module on demand
     * @param {string} type the type of module (ie. JSON)
     * @param {string} category the category of module (ie. processor, output, source)
     * @param {number} key
     * @returns the new module if successful, undefined if failure
     */
    generateNewModule = (type, category, key) => {
        console.log(type)
        if (category) {
            if (category != '') {
                return this.generationMap.get(type)(category, key);
            } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        return undefined;
    }
}