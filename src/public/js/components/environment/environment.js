/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/

import { Publisher, Message } from '../../communication/index.js';
import { invalidVariables, varTest, printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { ENVIRONMENT, MODULE_MANAGER, POPUP_MANAGER, INSPECTOR, compositIcon, sourceColor, outputColor, processorColor, compositColor, typeColorArray, processedModuleColor } from '../../sharedVariables/index.js';

export class Environment {
    // Communication Variables
    publisher;              // Sends Messages through the HUB

    #divID;        // HTML div for the environment
    #myDiagram;    // The GO JS diagram object
    #model;        // The Gojs Model
    #nodeKey;      // Identifies individual Nodes. Keys are unique and icremented each time a node is added.
    #contextMenu;  // The menu that appears when a node is right clicked.
    #nextGroupKey; // Unique Key (negative number) that is decremented each time a group is created.

    constructor(divID) {
        this.publisher = new Publisher();
        this.#divID = divID;                        // The HTML Div of this environment.
        this.#myDiagram;                            // GOJS diagram.
        this.#model;                                // GOJS Model.
        this.#nodeKey = 1;                          // Initialize the next node key to 1.
        this.#nextGroupKey = -10000;
        this.#contextMenu = this.#createContextMenu();
        this.#setPrintEventListener();
    }

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };

    #setPrintEventListener = () => {
        document.addEventListener('keydown', e => {
            if (e.code === 'KeyK') {
                this.printModel();
            }
        });
    }

    /** Creats the gojs environment objects.
     * Creates the New Model
     * Loads the model into the environment.
     * Adds interaction event listeners. */
    setUpEnvironment = () => {
        this.#startGoJsEnvironment();
        this.#defineGroupTemplate(this.#getGOJSMakeObject());
        this.#createNewModel();
        this.#createValidationRules();
        this.#load(); // Loads the data into the canvas object.
        this.#createInteractionEventListeners(); // Define gojs event handlers
    };

    /** Returns a gojs graph object */
    #getGOJSMakeObject = () => go.GraphObject.make;

    /** --- PRIVATE ---
     * Creates the diagram and sets off a chain of functions that build the environment */
    #startGoJsEnvironment = () => {
        go.licenseKey = '73f944e0b76631b700ca0d2b113f69ee1bb37b319ed01ef65a0541a7ef0e69462b9ded2858d08bc0d4ff4efd1c2fd2c9dacc3921971e5638b533d18b43b78ffdb3627ab0105c408ba40721c29bff7da4f82d26f5c0bd65b2dc2ddcf4ebfa939d4ef8f0d54bc911bb29670e';
        this.#myDiagram = this.#createNewDiagram(this.#getGOJSMakeObject());
        this.#setGridVisibility(true); // Toggles the grid in the background of the environment DOM element
    }

    /** --- PRIVATE ---
     * This template defines a group in gojs. Any time a group of elements is created, this template is called.
     * @param {Gojs Graph Object} gojs 
     */
    #defineGroupTemplate = gojs => {
        // Groups consist of a title in the color given by the group node data
        // above a translucent gray rectangle surrounding the member parts
        this.#myDiagram.groupTemplate =
            gojs(go.Group, "Vertical",
                {
                    selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                    ungroupable: true  // enable Ctrl-Shift-G to ungroup a selected Group
                },
                {
                    layout: gojs(go.LayeredDigraphLayout,
                        { direction: 0 })
                },
                gojs("SubGraphExpanderButton", { row: 0, column: 0, margin: 3 }),
                gojs(go.TextBlock,
                    {

                        font: "bold 16px sans-serif",
                        isMultiline: false,  // don't allow newlines in text
                        editable: true  // allow in-place editing by user
                    },
                    new go.Binding("text", "text").makeTwoWay(),
                    new go.Binding("stroke", "color")),
                gojs(go.Panel, "Table",
                    { name: "PANEL" },
                    gojs(go.Shape, "Rectangle",  // the rectangular shape around the members
                        {
                            fill: compositColor, stroke: compositColor, strokeWidth: 3, minSize: new go.Size(60, 60), maxSize: new go.Size(70, 70),
                            portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                            // allow all kinds of links from and to this port
                            fromLinkable: false, fromLinkableSelfNode: false, fromLinkableDuplicates: false,
                            toLinkable: false, toLinkableSelfNode: false, toLinkableDuplicates: false
                        }),
                    gojs(go.Picture,
                        compositIcon,
                        { width: 40, height: 40 }),
                    gojs(go.Placeholder, { margin: 10, background: compositColor, padding: 10 },
                        new go.Binding("padding", "isSubGraphExpanded",
                            function (exp) { return exp ? 10 : 10; }).ofObject())),
                { // this tooltip Adornment is shared by all groups
                    // the same context menu Adornment is shared by all groups
                    toolTip:
                        gojs("ToolTip",
                            gojs(go.TextBlock, { margin: 4 },
                                // bind to tooltip, not to Group.data, to allow access to Group properties
                                new go.Binding("text", "", this.#groupInfo).ofObject())
                        ),
                    contextMenu: this.#contextMenu
                }
            );
    }

    /** --- PRIVATE ---
     * Creates a Model Object. Binds Data for cetrain categories
     */
    #createNewModel = () => {
        this.#model = { 
            class: "go.GraphLinksModel",
            nodeCategoryProperty: "type",
            linkFromPortIdProperty: "frompid",
            linkToPortIdProperty: "topid",
            nodeDataArray: [], // This can be accessed to see the node data of the graph
            linkDataArray: []  // This can be accessed to see the link data of the graph
        }
    };

    /** --- PRIVATE ---
     * Add All Interaction event listeneres here. Whenever a gojs event is fired, this function should
     * define the event handlers.
     */
    #createInteractionEventListeners = () => {
        this.#myDiagram.addDiagramListener('LinkDrawn', e => {
            console.log(e.subject);
            this.#sendMessage(new Message(MODULE_MANAGER, ENVIRONMENT, 'Link Drawn Event',
                { event: 'LinkDrawn', fromNodeKey: e.subject.fromNode.key, toNodeKey: e.subject.toNode.key }));
        });

        this.#myDiagram.addDiagramListener('SelectionDeleted', e => {
            const deletedKeys = [];
            e.subject.each(node => {
                if (node.data.key) deletedKeys.push(node.data.key);
            });
            this.#sendMessage(new Message(MODULE_MANAGER, ENVIRONMENT, 'Nodes Deleted Event', deletedKeys));
        });

        this.#myDiagram.addDiagramListener('SelectionGrouped', this.#handleNewGroup.bind(this));
        this.#myDiagram.addDiagramListener('SelectionUngrouped', this.#handleUngrouping.bind(this));
    }


    /**
     * Creates a new node template.
     * @param {object (Module)} module The module object that will be represented as a node in the graph */
    #createTemplate = module => {
        if (invalidVariables([varTest(module, 'module', 'object')], 'Environment', '#createTemplate')) return;
        //console.log(module);
        this.#makeTemplate(module.getData('name'), module.getData('image'), module.getData('color'), module.getData('shape'), this.#unpackPortArray(module, 'inports'), this.#unpackPortArray(module, 'outports'), module.getData('inportType'), module.getData('outportType'));
    }

    /** --- PRIVATE ---
     * Creates the menu that appears then user right clicks on a graph element
     * @returns the menu */
    #createContextMenu = () => {
        const gojs = this.#getGOJSMakeObject();
        return gojs("ContextMenu",
            this.#makeButton("Delete",
                function (e, obj) { e.diagram.commandHandler.deleteSelection(); },
                function (o) { return o.diagram.commandHandler.canDeleteSelection(); }),
            this.#makeButton("Undo",
                function (e, obj) { e.diagram.commandHandler.undo(); },
                function (o) { return o.diagram.commandHandler.canUndo(); }),
            this.#makeButton("Redo",
                function (e, obj) { e.diagram.commandHandler.redo(); },
                function (o) { return o.diagram.commandHandler.canRedo(); }),
            this.#makeButton("Group",
                function (e, obj) { e.diagram.commandHandler.groupSelection(); },
                function (o) { return o.diagram.commandHandler.canGroupSelection(); }),
            this.#makeButton("Ungroup",
                function (e, obj) { e.diagram.commandHandler.ungroupSelection(); },
                function (o) { return o.diagram.commandHandler.canUngroupSelection(); })
        );
    }

    /** --- PRIVATE ---
     * When modules are created they pass port information to the environment. This function converts
     * the module representation of the port to the gojs representation.
     * @param {object (Module)} module 
     * @param {string} portType 'inports' or 'outports'
     * @returns array of ports
     */
    #unpackPortArray = (module, portType) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(portType, 'portType', 'string')], 'Environemnt', '#unpackPortArray')) return undefined;
        const ports = [];
        module.getData(portType).forEach(obj => ports.push(this.#makePort(obj.name, obj.leftSide, obj.type)));
        return ports;
    }

    /** --- PRIVATE ---
     * Turns the grid on or off
     * @param {boolean} visibility 
     */
    #setGridVisibility = visibility => this.#myDiagram.grid.visible = visibility;

    /** --- PRIVATE ---
     * Creates a new GOJS diagram object
     * @param {GOJS Graph Object} gojs 
     * @returns the new diagram with initial variables set
     */
    #createNewDiagram = gojs => {
        return gojs(go.Diagram, this.#divID, this.#setInitialDiagramVariables(gojs));
    }

    /** --- PRIVATE ---
     * Sets defaults for the gojs diagram
     * @param {gojs graph object} gojs 
     * @returns object with default settings
     */
    #setInitialDiagramVariables = gojs => {
        console.log(go.Spot);
        return {
            initialContentAlignment: go.Spot.Center,
            initialAutoScale: go.Diagram.UniformToFill,
            layout: gojs(go.LayeredDigraphLayout,
                { direction: 0 }),
            "commandHandler.archetypeGroupData": { text: "Composite", isGroup: true, color: "black", background: compositColor },
            "undoManager.isEnabled": true,
        };
    }

    /** --- PRIVATE ---
     * Builds the gojs node template. 
     * @param {string} typename type of the node
     * @param {string} icon path to the icon
     * @param {string} background background color of the node
     * @param {string} shape shape of the node
     * @param {[] of gojs panel objects} inports array of panels. These were created by the makeport function
     * @param {[] of gojs panel objects} outports array of panels. These were created by the makeport function
     */
    #makeTemplate = (typename, icon, background, shape, inports, outports, inportType, outportType) => {
        const gojs = this.#getGOJSMakeObject();
        const node = this.#createNewNode(gojs, shape, background, typename, icon, inports, outports, outportType, inportType);
        this.#myDiagram.nodeTemplateMap.add(typename, node);
    }

    /** --- PRIVATE ---
     * Creates a new node and adds it to the environment
     * @param {GoJS graph object} gojs used to make gojs elements 
     * @param {string} shape the shape of the node. ie. 'rectangle' 
     * @param {string} background the background color
     * @param {string} typename the type of the node 
     * @param {string} icon the path to the icon image 
     * @param {object[]} inports array of ports on the left side
     * @param {object[]} outports array of ports on the right side
     * @param {Number} outportType constant defining the type of port. Is used for color and link validation 
     * @param {Number} inportType constant defining the type of port. Is used for color and link validation 
     */
    #createNewNode = (gojs, shape, background, typename, icon, inports, outports, outportType, inportType) => {
        return gojs(go.Node,
            this.#setSelectionAdornedVariables(), // Sets the function for when selection is changed and whether to highlight selected node or not.
            this.#setDoubleClickListener(), 
            this.#createNodeBody(gojs, shape, background, typename, icon, inports, outports),
            this.#createMenuAdornment(),
            this.#createNewGOJSBinding('outPortType', 1));
    };

    /** --- PRIVATE ---
     * Sets the context menu. This is the menu that appears when the node is right clicked.
     * @returns content menu settings.
     */
    #createMenuAdornment = () => {
        return {
            contextMenu: this.#contextMenu
        }
    };

    /** --- PRIVATE ---
     * Create the actual node oject that is displayed in the environment.
     * @param {GoJS graph object} gojs used to make gojs elements 
     * @param {string} shape the shape of the node. ie. 'rectangle' 
     * @param {string} background the background color
     * @param {string} typename the type of the node 
     * @param {string} icon the path to the icon image 
     * @param {object[]} inports array of ports on the left side
     * @param {object[]} outports array of ports on the right side
     * @returns The node body
     */
    #createNodeBody = (gojs, shape, background, typename, icon, inports, outports) => {
        return gojs(go.Panel,
            "Auto",
            this.#setNodeWidthAndHeight(80, 80),
            this.#createShapeObject(shape, gojs, background),
            this.#populateNodeBody(gojs, typename, icon),
            this.#createInports(gojs, inports),
            this.#createOutports(gojs, outports));
    }

    /** --- PRIAVTE ---
     * Creates a GOJS shape object. This is likely used for the background of the node. This one attaches animations and bind
     * attributes.
     * @param {string} shape the shape of the element ie. 'rectange', 'circle' 
     * @param {gojs graph object} gojs used to make gojs elements 
     * @param {string} background hex color identifying the background color of the shape 
     * @returns a new shape.
     */
    #createShapeObject = (shape, gojs, background) => {
        return gojs(go.Shape,
            shape,
            this.#setNodeShapeAttributes(background),
            this.#createNewGOJSBinding('stroke', 'stroke'), // Bind stroke and fill so we can set the animation to these atributes.
            this.#createNewGOJSBinding('fill', 'fill'),
            this.#createNewAnimationTrigger('stroke'), // Set the Animations
            this.#createNewAnimationTrigger('fill'));
    };

    /** ---PRIVATE ---
     * Sets an aniamtion trigger. I was using this to fade the background colors of the nodes. They were
     * fading to gray when the pipeline is sent to the server and faded back to color when they were processed.
     * @param {string} attribute string identifying what to animate. i.e. fill or stroke
     * @returns the animation trigger
     */
    #createNewAnimationTrigger = attribute => new go.AnimationTrigger(attribute);

    /** --- PRIVATE ---
     * Creates a an attribute binding. You can bind any of the gojs attributes with a key.
     * @param {string} attribute the attribute to bind, ie. 'stroke'
     * @param {string} identifier the key to identify the attribute, can be the same as the attribute 
     * @returns a new gojs binding
     */
    #createNewGOJSBinding = (attribute, identifier) => new go.Binding(attribute, identifier);

    /** --- PRIVATE ---
     * Populates the body of the gojs node with a type string, an icon and a name
     * @param {gojs graph object} gojs  
     * @param {string} typename the name of the module, like 'CSV File'
     * @param {string} icon the path to the icon
     * @returns an object with the settings for the body.
     */
    #populateNodeBody = (gojs, typename, icon) => {
        return gojs(go.Panel,
            "Table",
            gojs(go.TextBlock,
                typename,
                this.#setNodeTypeAttributes()), // Object with the settings for the string
            gojs(go.Picture,
                icon,
                this.#setNodeIconAttributes(1, 8, 8, 3.0)), // Object with the settings for the icon
            gojs(go.TextBlock,
                this.#setNodeNameAttributes(), // Object with the settings for the name (this is Source, or Processor etc.)
                new go.Binding("text", "name").makeTwoWay())); // User can change the string in the environment by clicking on it
    }

    /** --- PRIVATE ---
     * Sets the width and height in pixels of the node
     * @param {Number} width only number, no 'px'
     * @param {Number} height 
     * @returns object with the settings
     */
    #setNodeWidthAndHeight = (width, height) => {
        return {
            width: width,
            height: height
        };
    }

    /** --- PRIVATE ---
     * Sets the attributes for the node background object. This is the rectangle or circle that makes up the main part of the
     * node that is displayed in the environment. 
     * @param {string} background color in hex
     * @returns settings for the node
     */
    #setNodeShapeAttributes = background => {
        return {
            fill: background, // Background color
            stroke: 'transparent', // This is for the border
            strokeWidth: 5, // Border width
            spot1: go.Spot.TopLeft,
            spot2: go.Spot.BottomRight,
            name: "SHAPE" // Name of the element for access in gojs
        };
    }

    /** --- PRIVATE ---
     * These are the settings for the Type block on the Node. The type refers to 'CSV File' etc. Not Source or processor
     * @returns Object with the settings
     */
    #setNodeTypeAttributes = () => {
        return {
            row: 0, // Top row
            margin: 3,
            maxSize: new go.Size(80, NaN),
            stroke: "white",
            font: "bold 7pt sans-serif"
        };
    }

    /** --- PRIVATE ---
     * Settings for the icon
     * ALL VARIABLES ARE CURRENTLY HARD CODED BUT COULD BE CHANGED
     * @param {*} row 
     * @param {*} width 
     * @param {*} height 
     * @param {*} scale 
     * @returns 
     */
    #setNodeIconAttributes = (row, width, height, scale) => {
        return {
            row: 1, // Middle row
            width: 8,
            height: 8,
            scale: 3.0
        };
    };

    /** --- PRIVATE ---
     * Settings for the Name. Name is 'Procesor' or 'Output' etc.
     */
    #setNodeNameAttributes = () => {
        return {
            row: 2, // Bottom Row
            margin: 3,
            editable: true,
            maxSize: new go.Size(80, 40),
            stroke: "white",
            font: "bold 9pt sans-serif"
        };
    }

    /** --- PRIVATE ---
     * Creates the in ports, left side of the panel
     * @param {gojs graph object} gojs 
     * @param {object[]} inports 
     * @returns Object containing the ports
     */
    #createInports = (gojs, inports) => gojs(go.Panel, "Vertical", this.#alignInports(), inports); // Ports are displayed as a vertical column

    /** --- PRIVATE ---
     * Creates the out ports, right side of the panel.
     * @param {gojs graph object} gojs 
     * @param {object[]} inports 
     * @returns Object containing the ports
     */
    #createOutports = (gojs, outports) => gojs(go.Panel, "Vertical", this.#alignOutports(), outports);// Ports are displayed as a vertical column

    /** --- PRIVATE ---
     * Positions the ports on the left side
     * @returns alignment settings
     */
    #alignInports = () => {
        return { alignment: new go.Spot(0, 0.5, 0, 0) };
    };

    /** --- PRIVATE ---
     * Positions the ports on the right side
     * @returns alignment settings
     */
    #alignOutports = () => {
        return { alignment: new go.Spot(1, 0.5, 0, 0) };
    };

    /** --- PRIVATE ---
     * Set double click handler function here.
     * @returns double click listener object
     */
    #setDoubleClickListener = () => {
        return { doubleClick: (e, node) => this.#handleDoubleClick(e, node.key) };
    }

    /** --- PRIVATE ---
     * Sets the selection adorned. This means is the selected node highlighted with a box when it is clicked.
     * Also sets the function for when the selection is changed.
     */
    #setSelectionAdornedVariables = () => {
        return {
            selectionAdorned: true,
            selectionChanged: this.#onSelectionChanged
        };
    }

    /**
     * Creates a gojs port panel
     * @param {string} name the name of the port. ie. in, out
     * @param {boolean} leftside true if left side, false if right side.
     * @returns a panel object.
     */
    #makePort = (name, leftside, type) => {
        const gojs = this.#getGOJSMakeObject();
        const panel = this.#createPortPanel(gojs);
        panel.add(this.#setupPort(leftside, this.#createPortObject(gojs, name, type), this.#createPortLabel(gojs, name), panel));
        return panel;
    }

    /** --- PRIVATE ---
     * Creates the settings for a port, one at a time.
     * @param {boolean} leftside if true, ports go on the left, false ports go on the right
     * @param {Object} port the port object created by GOJS
     * @param {string} label this is a string that can display in or out if desired
     * @param {Object} panel The panel to attach the ports to.
     * @returns the port object with settings applied
     */
    #setupPort = (leftside, port, label, panel) => {
        this.#placePortLabel(leftside, label); // Sets the location of the label
        this.#placePort(leftside, panel);      // Sets the location fof the port
        this.#alignPort(leftside, port);       // Aligns the port
        this.#setToLinkable(leftside, port);   // Sets whether or not the port to linkable (ie. an in or out port)
        this.#setFromLinkable(leftside, port); // Sets whether or not the port is in or out port
        return port;
    }

    #placePortLabel = (leftside, label) => label.margin === leftside ? new go.Margin(1, 1, 0, 0) : new go.Margin(1, 0, 0, 1);
    #placePort = (leftside, port) => port.toSpot = leftside ? go.Spot.Left : go.Spot.Right;
    #alignPort = (leftside, port) => port.alignment = leftside ? go.Spot.TopLeft : go.Spot.TopRight;
    #setToLinkable = (leftside, port) => port.toLinkable = leftside ? true : false;
    #setFromLinkable = (leftside, port) => port.fromLinkable = leftside ? false : true;

    /** --- PRIVATE ---
     * Creates the GOJS panel object. This is the background box of the port
     * @param {gojs graph object} gojs used to make gojs elements 
     * @returns the panel
     */
    #createPortPanel = gojs => {
        return gojs(go.Panel, "Horizontal",
            { margin: new go.Margin(2, 0) });
    };

    /** --- PRIVATE ---
     * Creates the text block with the port label
     * @param {gojs graph object} gojs used to make gojs elements 
     * @param {string} label the label of the port (most likely IN or OUT)
     * @returns the gojs label object with settings
     */
    #createPortLabel = (gojs, label) => {
        return gojs(go.TextBlock, label, { font: "7pt sans-serif" });
    }
    
    /** --- PRIVATE ---
     * Creates the port object (technically the gojs shape)
     * @param {gojs graph object} gojs 
     * @param {string} name IN or OUT 
     * @param {*} type 
     * @returns 
     */
    #createPortObject = (gojs, name, type) => {
        console.log('PortName: ', name);
        return gojs(go.Shape, "Rectangle",
            {
                fill: typeColorArray[type], stroke: null,
                desiredSize: new go.Size(12, 12),
                portId: name,  // declare this object to be a "port"
                toMaxLinks: 4,
                cursor: "pointer"  // show a different cursor to indicate potential link point
            });
    }

    /** --- Private ---
     * This sets up the context menu for grouped items.
     * @param {GO JS Object} adornment the context menu
     * @returns group info
     */
    #groupInfo = adornment => {  // takes the tooltip or context menu, not a group node data object
        var g = adornment.adornedPart;  // get the Group that the tooltip adorns
        var mems = g.memberParts.count;
        var links = 0;
        g.memberParts.each(function (part) {
            if (part instanceof go.Link) links++;
        });
        return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
    }

    /** When a node is selected, the data for this module is passed to the Inspector
     * @param node -> The newly selected node. 
     */
    #onSelectionChanged = node => {
        if (node) this.#sendMessage(new Message(INSPECTOR, ENVIRONMENT, 'Node Selected Event', { moduleKey: node.key }));
        else console.log(`ERROR: Cannot select undefined node. -- Environment -> onSelectionChanged`);
    }

    /** --- PUBLIC ---
     * Programatically draws a link between two nodes.
     * @param {Number} source key to the source node
     * @param {Number} destination key to the destination node
     */
    drawLinkBetweenNodes(source, destination) {
        this.#myDiagram.startTransaction('make new link');
        this.#myDiagram.model.addLinkData({ from: source, to: destination });
        this.#myDiagram.commitTransaction('make new link');
    }

    /** --- PUBLIC ---
     * Creats a group. This is called when a group is created from a prefab node.
     * @returns the key for the new group node.
     */
    createNewGroupNode() {
        const key = this.#getNextGroupKey();
        this.#myDiagram.startTransaction("make new group");
        this.#myDiagram.model.addNodeData({ key: key, isGroup: true });
        this.#myDiagram.commitTransaction("make new group");
        return key;
    }

    /** --- PRIVATE ---
     * Gets the next available group key and increments. Group Keys are negative numbers.
     * @returns the key.
     */
    #getNextGroupKey() {
        this.#nextGroupKey = this.#nextGroupKey - 100;
        return this.#nextGroupKey;
    }

    /** Removes a node from the diagram. */
    #removeNode = (nodeKey) => {
        const node = this.#myDiagram.findNodeForKey(nodeKey);
        if (node !== null) {
            this.#myDiagram.startTransaction();
            this.#myDiagram.remove(node);
            let i = this.#model.nodeDataArray.forEach((n, index) => {
                if (n.key === nodeKey) {
                    return index;
                }
            });
            this.#model.nodeDataArray.splice(i, 1);
            this.MDT.removeModule(nodeKey, node.data.type);
            this.#myDiagram.commitTransaction("deleted node");
        } else {
            console.log('No Node Found. Cannot Delete.');
        }
    }


    /** Returns the next unique node key and increments the counter. */
    getNextNodeKey = () => {
        this.#nodeKey++;
        return this.#nodeKey - 1;
    }

    /**
     * This function takes a newly created module and generates a graph node for it. If the template does not exist yet, it will be created.
     * @param {Module} mod the module to insert into the graph
     * @param {boolean} templateExists true if a template exists for this node type, false if not.
     */
    insertModule = (mod, templateExists, groupKey) => {
        if (mod && templateExists != undefined) {
            if (!templateExists) this.#createTemplate(mod);
            this.#myDiagram.startTransaction("make new node");
            if (groupKey) this.#myDiagram.model.addNodeData({ "key": this.#nodeKey - 1, "type": mod.getData('name'), "name": mod.getData('type') === 'Composite' ? '' : mod.getData('type'), "group": groupKey });
            else this.#myDiagram.model.addNodeData({ "key": this.#nodeKey - 1, "type": mod.getData('name'), "name": mod.getData('type') === 'Composite' ? '' : mod.getData('type') });
            this.#myDiagram.commitTransaction("make new node");
        } else console.log(`ERROR: parameter error. mod: ${mod}, templateExists: ${templateExists}. -- Environment -> insertModule`);
    }

    // To simplify this code we define a function for creating a context menu button:
    #makeButton = (text, action, visiblePredicate) => {
        const gojs = this.#getGOJSMakeObject();
        return gojs("ContextMenuButton",
            gojs(go.TextBlock, text),
            { click: action },
            // don't bother with binding GraphObject.visible if there's no predicate
            visiblePredicate ? new go.Binding("visible", "", function (o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }



    /** Loads the model to the HTML browser page. */
    #load = () => {
        this.#myDiagram.model = go.Model.fromJson(this.#model);
    };

    /**
     * Handles a double click event
     * @param {gojs event object} event has the click location.
     * @param {number} key the key of the node that was clicked.
     */
    #handleDoubleClick = (event, key) => {
        if (invalidVariables([varTest(event, 'event', 'object'), varTest(key, 'key', 'number')], 'Environment', '#handleDoubleClick')) return false;
        this.clearHighlightedNode(key);
        this.#sendMessage(new Message(POPUP_MANAGER, ENVIRONMENT, 'Double Click Event', { moduleKey: key, x: event.Xr.clientX, y: event.Xr.clientY })); // Open Popup
    }

    printModel = () => {
        console.log(this.#model.nodeDataArray);
        console.log(this.#model.linkDataArray);
    }

    /**
     * Gets the current model.
     * @returns object of links and nodes.
     */
    getModel = () => {
        return { links: JSON.parse(JSON.stringify(this.#model.linkDataArray)), nodes: JSON.parse(JSON.stringify(this.#model.nodeDataArray)) };
    }

    /**
     * Adds a colored outline to nodes.
     * @param {number[]} nodeArray an array of keys for the nodes that were changed and need a colored outline
     */
    highlightChangedNodes = nodeArray => {
        if (invalidVariables([varTest(nodeArray, 'nodeArray', 'object')], 'Environment', 'highlightChangedNodes')) return;
        nodeArray.forEach(key => this.#myDiagram.findNodeForKey(key).findObject('SHAPE').stroke = 'red');
    };

    /**
     * Removes outline around gojs node.
     * @param {number} key node key.
     */
    clearHighlightedNode = key => {
        if (invalidVariables([varTest(key, 'key', 'number')], 'Environment', 'clearHighlightedNode')) return;
        this.#myDiagram.findNodeForKey(key).findObject('SHAPE').stroke = 'transparent';
    }

    /**
     * Colors the nodes whos keys are provided based on their type.
     * @param {number[]} nodeArray 
     */
    updatePipelineProgress = nodeArray => {
        if (invalidVariables([varTest(nodeArray, 'nodeArray', 'object')], 'Environment', 'updatePipelinePrograss')) return;
        nodeArray.forEach(key => {
            const node = this.#myDiagram.findNodeForKey(key);
            this.changeNodeBackgroundColor(node, this.#getNodeColor(node.data.name));
        });
    }

    /** --- PRIVATE ---
     * This function is called when a group is made in the Environmnt by the user highlighting nodes, right clicking, and selecting group.
     * Creates an object representation of the group and sends it to the module manager. */
    #handleNewGroup() {
        // When a new group is made, it should be the only thing selected on the diagram.
        if (this.#myDiagram.selection.count != 1) {
            console.log('More than one module selected error.');
            return;
        }

        let groupKey = Infinity;
        const groupDiagram = { nodes: [], links: [] };
        this.#myDiagram.selection.each(e => {
            if (e.data.isGroup) groupKey = e.data.key;
        });

        if (groupKey != Infinity && groupKey != undefined) {
            const idArray = [];
            this.#model.nodeDataArray.forEach(node => {
                if (node.group === groupKey) {
                    groupDiagram.nodes.push(node);
                    idArray.push(node.key);
                }
            });
            this.#model.linkDataArray.forEach(link => {
                if (idArray.includes(link.to) && idArray.includes(link.from)) groupDiagram.links.push(link);
            });
        }
        this.#sendMessage(new Message(MODULE_MANAGER, ENVIRONMENT, 'New Group Created', { groupDiagram: groupDiagram, groupKey: groupKey }));
    }

    /** --- PRIVATE ---
     * Called when user manually ungroups a group of nodes in the environment. The group node must be deleted.
     * Module Manager is Notified with an array of all effected module keys so that their datatables can be updated.
     * @param {GOJS object} event Gojs event */
    #handleUngrouping(event) {
        const groupKeys = [];
        event.subject.iterator.each(node => groupKeys.push(node.data.key));
        this.#sendMessage(new Message(MODULE_MANAGER, ENVIRONMENT, 'Nodes Deleted Event', groupKeys));
    }

    /**
     * @param {string} type 'Source', 'Processor', or 'Output'
     * @returns the color
     */
    #getNodeColor = type => {
        if (invalidVariables([varTest(type, 'type', 'string')], 'Environment', '#getNodeColor')) return undefined;
        let color = undefined;
        switch (type) {
            case 'Source':
                color = sourceColor;
                break;
            case 'Processor':
                color = processorColor;
                break;
            case 'Output':
                color = outputColor;
                break;
            case 'Composite':
                color = compositColor;
                break;
            default:
                printErrorMessage('unhandled type. Cannot get color.', `type: ${type} -- Environment -> #getnodeColor`);
                break;
        }
        return color;
    }

    #createValidationRules() {
        this.#myDiagram.toolManager.linkingTool.linkValidation = this.#validatePortLinks;
    }

    /** --- PRIVATE ---
     * This function is used to validate the links and make sure that the correct links are allowed. This function will need to be 
     * updated as the program progresses and you find out exactly how the pipeline will be constructed and sent to the user.
     * 
     * Data from the node or port can be used to this validation.
     * 
     * @param {*} fromnode The node sending the link
     * @param {*} fromport the port on the from node sending the link
     * @param {*} tonode the to node receiving the link
     * @param {*} toport the port on the to node receiving the link
     * @returns true if it is allowed
     */
    #validatePortLinks(fromnode, fromport, tonode, toport) {
        return fromport.fill === toport.fill;
    }

    /**
     * Turns all Nodes in the graph gray when run is clicked.
     * @param {number[]} nodeArray Array of keys for the nodes to turn gray.
     */
    grayOutPipeline = nodeArray => {
        if (invalidVariables([varTest(nodeArray, 'nodeArray', 'object')], 'Environment', 'grayOutPipeline')) return;
        nodeArray.forEach(key => {
            console.log(key);
            if (key != undefined) this.changeNodeBackgroundColor(this.#myDiagram.findNodeForKey(key), '#363538');
            else printErrorMessage(`undefined variable`, `key: ${key} -- Environment -> grayOutPipeline`);
        });
    }


    /**
     * Changes the background color of a single node.
     * @param {gojs node} node the node to change background color.
     * @param {string} color the color to fill with
     */
    changeNodeBackgroundColor = (node, color) => {
        if (invalidVariables([varTest(node, 'node', 'object'), varTest(color, 'color', 'string')], 'Environment', 'changeNodeBackgroundColor')) return;
        node.findObject('SHAPE').fill = color;
    }

    toggleNodeColor(moduleKey, processed) {
        if (invalidVariables([varTest(moduleKey, 'moduleKey', 'number'), varTest(processed, 'processed', 'boolean')], 'Environment', 'toggleNodeColor')) return;
        var node = this.#myDiagram.findNodeForKey(moduleKey);
        if (processed) {
            node.findObject('SHAPE').fill = processedModuleColor;
        }
        else {
            node.findObject('SHAPE').fill = sourceColor;
        }

    }

}
