import { sourceColor, outputColor, processorColor, compositColor } from "../../sharedVariables/colors.js";
import {Sql, Fits, Csv, RandomData, NumberSource, Json, Ephemeris, Mjd, CometAll, FunctionProcessor, Gaussian, Laplacian, Sum, Subtract, LineChart, BarChart, ScatterPlot, Value, ImageOutput, Table, Composit} from '../index.js';
export class ModuleGenerator {
    constructor() {
        this.colors = {
            source: sourceColor,
            processor: processorColor,
            output: outputColor,
            composit: compositColor
        };

        this.shapes = {
            source: 'Rectangle',
            processor: 'Circle',
            output: 'RoundedRectangle',
            composit: 'Rectangle'
        }
    }

    /**
     * Generates a new module on demand
     * @param {string} type the type of module (ie. JSON)
     * @param {string} category the category of module (ie. processor, output, source)
     * @param {number} key
     * @returns the new module if successful, undefined if failure
     */
    generateNewModule = (type, category, key) => {
        let mod = undefined;
        if (type && category) {
            if (type != '' && category != '') {
                switch (type) {
                    case 'SQL':
                        mod = new Sql(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'FITS':
                        mod = new Fits(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'CSV':
                        mod = new Csv(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Random':
                        mod = new RandomData(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Number':
                        mod = new NumberSource(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'JSON':
                        mod = new Json(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Ephemeris':
                        mod = new Ephemeris(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'MJD':
                        mod = new Mjd(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'All':
                        mod = new CometAll(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Function':
                        mod = new FunctionProcessor(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Gaussian Filter':
                        mod = new Gaussian(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Laplacian Filter':
                        mod = new Laplacian(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Sum':
                        mod = new Sum(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Subtract':
                        mod = new Subtract(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Scatter Plot':
                        mod = new ScatterPlot(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Bar Chart':
                        mod = new BarChart(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Table':
                        mod = new Table(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Line Chart':
                        mod = new LineChart(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Image':
                        mod = new ImageOutput(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Value':
                        mod = new Value(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key);
                        break;
                    case 'Composit':
                        mod = new Composit(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key, 'Composit', [], false);
                        break;
                    case 'Data':
                        mod = new Composit(category, this.colors[category.toLowerCase()], this.shapes[category.toLowerCase()], key, 'Data', [{ name: 'IN', leftSide: false }], true);
                        break;
                }
            } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        } else console.log(`ERROR: Parameter Error. type: ${type}, category: ${category}. -- ModuleGenerator -> generate new module`);
        return mod;
    }
}