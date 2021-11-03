class ModuleGenerator {
    constructor() {
        this.colors = {
            source: sourceColor,
            processor: processorColor,
            output: outputColor
        };

        this.shapes = {
            source: 'Rectangle',
            processor: 'Circle',
            output: 'RoundedRectangle'
        }
    }

    /**
     * Generates a new module on demand
     * @param {string} type the type of module (ie. JSON)
     * @param {string} category the category of module (ie. processor, output, source)
     * @returns the new module if successful, undefined if failure
     */
    generateNewModule = (type, category) => {
        let mod = undefined;
        console.log(category);
        if (type && category) {
            if (type != '' && category != '') {
                switch (type) {
                    case 'SQL':
                        mod = new Sql(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'FITS':
                        mod = new Fits(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'CSV':
                        mod = new Csv(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Random':
                        mod = new RandomData(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Number':
                        mod = new NumberSource(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'JSON':
                        mod = new Json(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Ephemeris':
                        mod = new Ephemeris(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'MJD':
                        mod = new Mjd(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'All':
                        mod = new CometAll(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Function':
                        mod = new FunctionProcessor(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Gaussian Filter':
                        mod = new Gaussian(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Laplacian Filter':
                        mod = new Laplacian(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Sum':
                        mod = new Sum(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Subtract':
                        mod = new Subtract(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Scatter Plot':
                        mod = new ScatterPlot(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Bar Chart':
                        mod = new BarChart(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Table':
                        mod = new Table(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Line Chart':
                        mod = new LineChart(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Image':
                        mod = new ImageOutput(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                    case 'Value':
                        mod = new Value(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()]);
                        break;
                }
            } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        return mod;
    }
}