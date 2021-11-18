
import { debug } from "../main.js";

const typeCheck = (variable, type) => (typeof(variable) === type) ? true : false;
const isNullOrUndefined = variable => (variable == undefined || variable == null) ? true: false;

export const invalidVariables = (variables, fileName, functionName) => {
    let foundError = false;
    variables.forEach(variableInfo => {
        if (!isNullOrUndefined(variableInfo.value)) {
            if (variableInfo.expectedType !== 'any') {
                if (!typeCheck(variableInfo.value, variableInfo.expectedType)) {
                    printErrorMessage('typecheck', `${variableInfo.name}: ${typeof(variableInfo.value)} - expected ${variableInfo.expectedType} -- ${fileName} -> ${functionName}`);
                    foundError = true;
                }
            }
        } else {
            foundError = true;
            printErrorMessage('undefined or null variable', `${variableInfo.name}: ${variableInfo.value} -- ${fileName} -> ${functionName}`)
        }
    });
    return foundError;
}

export const printErrorMessage = (type, msg) => {
    if (debug) console.log(`ERROR: ${type} <> ${msg}`);
}

export const varTest = (value, name, expectedType) => {
    return {value: value, name: name, expectedType: expectedType};
}
