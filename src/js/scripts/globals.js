// MODULE TYPE VARIABLES
const SQL_QUERY = 0;
const TEST_QUERY = 1000;

// Main Environment
const ENV = new Environment('mainDiagram');

// Inspector
const INS = new Inspector();

// Model Menu
const MM = new ModuleMenu();

//Module Generator
const MG = new ModuleGenerator();

// Module Popup
const MP = new Popup('30%', '75%', 0, 0, 'modulePopup', true)

// Generates HTML Tables
const HTG = new HTMLTableGenerator();