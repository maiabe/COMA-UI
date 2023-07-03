
export class RangeInput {
    dataTable;

    constructor(double, min, max, step, dataType, dataUnits, dataFormat) {
        this.dataTable = new Map();
        this.#createWrapperElement();
        this.dataTable.set('isFlipped', false);         // If true, max goes on the left, min goes on the right
        this.dataTable.set('dataType', dataType);       // String identifying the data type
        this.dataTable.set('dataFormat', dataFormat);   // String identifying the data format (ie dd/mm/yyyy or int or float etc)
        this.dataTable.set('min', min);                 // Min value (set by the metadata on creation)
        this.dataTable.set('max', max);                 // Max value (set by the metadata on creation)
        this.dataTable.set('lastValidLeft', min);       // The current minimum (set by the user in the text inputs or the range slider)
        this.dataTable.set('lastValidRight', max);      // The current max (set by the user in the text inputs or range slider)
        this.#buildCard();
    }

    // build card


    // Create Wrapper
    #createWrapperElement() {
        const wrapper = GM.HF.createNewDiv('', '', ['double-range-input-wrapper'], []);
        this.dataTable.set('wrapper', wrapper);
    }


    // Create Range Slider


    // Create dynamical value input


    // Create data unit dropdown (if count > 1)


    // Update Range Slider


    // Update Units


}
