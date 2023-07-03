
const format_mapping = {
    'mag': 3,
    'mag_err': 3,
    'zpmag': 3,
    'zpmagerr': 3,
    'ra-object': 6,
    'dec-object': 7,
    'exposure': 3,
    'mjd_mid': 9,
};

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


export { format_mapping, decimalAlignFormatter }