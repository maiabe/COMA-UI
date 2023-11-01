
const format_mapping = {
    /*'mag': 3,
    'mag_err': 3,
    'zpmag': 3,
    'zpmagerr': 3,*/
    'ra-object': 6,
    'dec-object': 7,
    /*'exposure': 3,*/
    'mjd_mid': 9,
};

function getNumDigits(fieldName) {
    var numDigits = 3;
    if (format_mapping.hasOwnProperty(fieldName)) {
        numDigits = format_mapping[fieldName];
    }
    return numDigits;
}

function decimalAlignFormatter(cell, formatterParams, onRendered) {
    var value = cell.getValue();

    // Check if the value is a number
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
        var decimalCount = (value.toString().split('.')[1] || []).length;

        // Apply CSS class to align the value at the decimal point
        cell.getElement().style.textAlign = "right";
        cell.getElement().style.paddingRight = decimalCount * 10 + "px";
    }
    console.log(value);
    return value;
}

/** Gets the dataType of that column values
*  @param {inputVal} string value of the first item in a column
*  @returns {dataType} of the input value - value, category, or time
* */
function getDataType(inputVal) {
    let dataType = 'category';

    // Check if it's a numeric value
    if (/^[-+]?\d*\.?\d+$/.test(inputVal)) {
        dataType = 'value';
    }
    // Check if it's a date or time
    else if (Date.parse(inputVal)) {
        dataType = "time";
    }
    return dataType;
}


export { format_mapping, decimalAlignFormatter, getNumDigits, getDataType }