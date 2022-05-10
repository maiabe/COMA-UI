/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

export class CsvWriter {
    constructor() {
        this.delimiter = ',';
    }

    /** --- PUBLIC ---
     * Creates a csv file using a comma as delimiter.  
     * @param {string} fileName the name of the file (not including extension)
     * @param {{
     *  key (string): value (1D array of data)
     * }} data the data to write to file
     */
    createCsvFileFromData(fileName, data) {
        console.log(data)
        let csvString = '';
        let maxArrayLength = 0;
        csvString += Object.keys(data.data).join(',') + '\n';

        Object.values(data.data).forEach(array => {
            if (array.length > maxArrayLength) maxArrayLength = array.length;
        });

        for (let i = 0; i < maxArrayLength; i++) {
            const tempArray = [];
            Object.values(data.data).forEach(array => {
                if (array[i]) tempArray.push(array[i]);
                else tempArray.push('undefined');
            });
            csvString += tempArray.join(',') + '\n';
        }

        const csvUrl = URL.createObjectURL(new Blob([csvString], { type: 'text/csv' }));
        const hiddenElement = document.createElement('a');
        hiddenElement.href = csvUrl;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${fileName}.csv`;
        hiddenElement.click();
    }

}