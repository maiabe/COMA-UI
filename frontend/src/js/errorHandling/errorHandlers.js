import { debug } from "../main.js";
import { HTMLFactory } from "../htmlGeneration/htmlFactory.js";

const typeCheck = (variable, type) => (typeof (variable) === type) ? true : false;
const isNullOrUndefined = variable => (variable == undefined || variable == null) ? true : false;

export const invalidVariables = (variables, fileName, functionName) => {
    let foundError = false;
    variables.forEach(variableInfo => {
        if (!isNullOrUndefined(variableInfo.value)) {
            if (variableInfo.expectedType !== 'any') {
                if (!typeCheck(variableInfo.value, variableInfo.expectedType)) {
                    // add error message display to current div

                    printErrorMessage('typecheck', `${variableInfo.name}: ${typeof(variableInfo.value)} - expected ${variableInfo.expectedType} -- ${fileName} -> ${functionName}`);
                    foundError = true;
                }
            }
        } else {
            foundError = true;
            // add error message display to current div

            printErrorMessage('undefined or null variable', `${variableInfo.name}: ${variableInfo.value} -- ${fileName} -> ${functionName}`)
        }
    });
    return foundError;
}

export const printErrorMessage = (type, msg) => {
    if (debug) console.log(`ERROR: ${type} <> ${msg}`);
}

// create HTML objects to display the error messages
export const displayErrorMessage = (type, msg, div) => {
    // div.append();
    const HF = HTMLFactory();
    let errorMessageDiv = HF.createNewDiv('', '', ['errorMessage'], [], [], '');
    div.appendChild(errorMessageDiv);
}

export const varTest = (value, name, expectedType) => {
    return {value: value, name: name, expectedType: expectedType};
}
