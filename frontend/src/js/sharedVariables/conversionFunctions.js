/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
const conversionFunctions = [
    {
        name: 'JD to MJD',
        fn: function (dataArray) {
            const converted = [];
            dataArray.forEach(element => {
                converted.push(element - 2400000.5);
            });
            return converted;
        },
        outputFieldName: 'MJD',
        description: 'This function will convert Julian Date to Modified Julian Data according to the function: MJD = JD - 244000.5. The values will be stored in the data table in a new field called MJD.'
    },
    {
        name: 'JD to UTC Date',
        fn: function (dataArray) {
            const converted = [];
            dataArray.forEach(element => {
                var millis = (element - 2440587.5) * 86400000;
                converted.push(millis);
            });
            return converted;
        },
        outputFieldName: 'UTC',
        description: 'This function will convert Julian Date to Modified Julian Data according to the function: MJD = JD - 244000.5. The values will be stored in the data table in a new field called MJD.'
    }
]

export { conversionFunctions }