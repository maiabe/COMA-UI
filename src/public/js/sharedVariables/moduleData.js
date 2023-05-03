import { Cholera, Search, Csv, Filter, DataConversion, LineChart, BarChart, ScatterPlot, OrbitalPlot, Table, ToCSV, Composite, CompositePrefab, Data } from '../modules/index.js';
import { sourceColor, outputColor, processorColor, compositColor } from './colors.js';
import { LOCAL_DATA_SOURCE } from "./constants.js";

const colors = {
    source: sourceColor,
    processor: processorColor,
    output: outputColor,
    composite: compositColor
};

const shapes = {
    source: 'Rectangle',
    processor: 'Circle',
    output: 'RoundedRectangle',
    composite: 'Rectangle'
}

/** This Object Stores the data for creating new modules
 *  key: (string) used to index into the hash table that stores the moduleCreation function
 *  moduleCreationFunction: (function) used to create a new instance of the module class
 *  menuData: (object) icon, text, and category information used to populate the module selection menu. 
 */
const moduleDataObject = [
    {
        key: 'Search',
        moduleCreationFunction: (category, key) => new Search(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/sql-open-file-format.png', text: 'Search', category: 'Source' }
    },
    {
        key: 'CSV File',
        moduleCreationFunction: (category, key) => new Csv(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/csv-file-format-extension.png', text: 'CSV File', category: 'Source' }
    },
    {
        key: 'Cholera',
        moduleCreationFunction: (category, key) => new Cholera(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/skull.png', text: 'Cholera', category: 'Source' }
    },
    {
        key: 'Filter',
        moduleCreationFunction: (category, key) => new Filter(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/filter.png', text: 'Filter', category: 'Processor' }
    },
    {
        key: 'Data Conversion',
        moduleCreationFunction: (category, key) => new DataConversion(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/convert.png', text: 'Data Conversion', category: 'Processor' }
    },
    {
        key: 'Scatter Plot',
        moduleCreationFunction: (category, key) => new ScatterPlot(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/scatter-graph-black.png', text: 'Scatter Plot', category: 'Output' }
    },
    {
        key: 'Bar Chart',
        moduleCreationFunction: (category, key) => new BarChart(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/bar-chart.png', text: 'Bar Chart', category: 'Output' }
    },
    {
        key: 'Table',
        moduleCreationFunction: (category, key) => new Table(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/table.png', text: 'Table', category: 'Output' }
    },
    {
        key: 'Line Chart',
        moduleCreationFunction: (category, key) => new LineChart(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/line-chart.png', text: 'Line Chart', category: 'Output' }
    },
    {
        key: 'Orbital Plot',
        moduleCreationFunction: (category, key) => new OrbitalPlot(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key),
        menuData: { icon: 'images/icons/orbital-plot.png', text: 'Orbital Plot', category: 'Output' }
    },
    {
        key: 'To Csv',
        moduleCreationFunction: (category, key) => new ToCSV(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key, 'Data', [{ name: 'IN', leftSide: false }], true),
        menuData: { icon: 'images/icons/csv-file-format-extension.png', text: 'To Csv', category: 'Output' }
    },
    {
        key: 'Data',
        moduleCreationFunction: (category, key) => new Data(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key, 'Data', [{ name: 'IN', leftSide: false, type: LOCAL_DATA_SOURCE }], true)
    },
    {
        key: 'Composite',
        moduleCreationFunction: (category, key) => new Composite(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key, 'Composite', [], false)
    },
    {
        key: 'CompositePrefab',
        moduleCreationFunction: (category, key) => new CompositePrefab(category, colors[category.toLowerCase()], shapes[category.toLowerCase()], key, 'Composite', [], false)
    },
]

/** This Object Stores the data for search module fields
 *  type: (array) list of strings that describes the types of a query
 *  field: (array) list of strings that describtes the form field options
 *  data-representation: (object) list of objects that stores the query data representation options
 *                          type: (string) type of query operation
 *                          data: (string) type of data representation to configure
 *                          option: (array) list of numbers to represent the data with
 */
const SearchFields = {
    "types": [
        "lightcurve",
        "geometry",
        "photometry",
        "objects"
    ],
    "fields": {
        object: "Object",
        date: "Date",
        begin: "Begin",
        end: "End",
        JDbegin: "JD begin",
        JDend: "JD end",
        filter: "Filter",
        telescope: "Telescope"
    },
    "fieldsDict": [
        {
            "type": "lightcurve",
            "fields": ["object", "date", "begin", "end", "JDbegin", "JDend", "filter", "telescope"]
        },
        {
            "type": "geometry",
            "fields": ["object", "date", "begin", "end", "JDbegin", "JDend", "filter", "telescope"]
        },
        {
            "type": "photometry",
            "fields": ["object", "date", "begin", "end", "JDbegin", "JDend", "filter", "telescope"]
        },
        {
            "type": "objects",
            "fields": ["date", "begin", "end", "JDbegin", "JDend", "filter", "telescope"]
        }
    ],
    "data-representation": [
        {
            "type": "photometry",
            "data": "radius aperture",
            "option": [5, 10, 20]
        },
        {
            "type": "objects",
            "data": "au",
            "option": [5, 10, 20]
        }
    ]
}

export { moduleDataObject }
export { SearchFields }