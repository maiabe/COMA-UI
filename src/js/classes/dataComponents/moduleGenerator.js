class ModuleGenerator {
    constructor() {
        this.colors = {
            source: '#1abd1a',
            processor: '#d60606',
            output: '#2e77ff'
        };

        this.shapes = {
            source: 'Rectangle',
            processor: 'Circle',
            output: 'RoundedRectangle'
        }
    }

    generateNewModule = (type, category) => {
        let mod = undefined;
        switch (type) {
            case 'SQL':
                mod = new Sql(category, this.colors.source, this.shapes.source);
                break;
            case 'FITS':
                mod = new Fits(category, this.colors.source, this.shapes.source);
                break;
            case 'CSV':
                mod = new Csv(category, this.colors.source, this.shapes.source);
                break;
            case 'Random':
                mod = new RandomData(category, this.colors.source, this.shapes.source);
                break;
            case 'JSON':
                mod = new Json(category, this.colors.source, this.shapes.source);
                break;
            case 'Ephemeris':
                mod = new Ephemeris(category, this.colors.source, this.shapes.source);
                break;
            case 'MJD':
                mod = new Mjd(category, this.colors.source, this.shapes.source);
                break;
            case 'All':
                mod = new CometAll(category, this.colors.source, this.shapes.source);
                break;
            case 'Function':
                mod = new FunctionProcessor(category, this.colors.processor, this.shapes.processor);
                break;
            case 'Gaussian Filter':
                mod = new Gaussian(category, this.colors.processor, this.shapes.processor);
                break;
            case 'Laplacian Filter':
                mod = new Laplacian(category, this.colors.processor, this.shapes.processor);
                break;
            case 'Scatter Plot':
                mod = new ScatterPlot(category, this.colors.output, this.shapes.output);
                break;
            case 'Bar Chart':
                mod = new BarChart(category, this.colors.output, this.shapes.output);
                break;
            case 'Table':
                mod = new Table(category, this.colors.output, this.shapes.output);
                break;
            case 'Line Chart':
                mod = new LineChart(category, this.colors.output, this.shapes.output);
                break;
            case 'Image':
                mod = new ImageOutput(category, this.colors.output, this.shapes.output);
                break;
        }
        return mod;
    }
}