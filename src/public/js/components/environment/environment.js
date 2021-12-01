import { Publisher, Message } from '../../communication/index.js';
import { invalidVariables, varTest, printErrorMessage } from '../../errorHandling/errorHandlers.js';
import { ENVIRONMENT, MODULE_MANAGER, POPUP_MANAGER, INSPECTOR, compositIcon, sourceColor, outputColor, processorColor, compositColor } from '../../sharedVariables/index.js';

export class Environment {
    // Communication Variables
    publisher;              // Sends Messages through the HUB

    #divID;     // HTML div for the environment
    #myDiagram; // The GO JS diagram object
    #model;     // The Gojs Model
    #nodeKey;   // Identifies individual Nodes. Keys are unique and icremented each time a node is added.
    #contextMenu;

    constructor(divID) {
        this.publisher = new Publisher();
        this.#divID = divID;                        // The HTML Div of this environment.
        this.#myDiagram;                            // GOJS diagram.
        this.#model;                                // GOJS Model.
        this.#nodeKey = 1;                          // Initialize the next node key to 1.
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
    /**
     * Creats the gojs environment objects.
     * Creates the New Model
     * Loads the model into the environment.
     * Adds interaction event listeners.
     */
    setUpEnvironment = () => {
        this.#startGoJsEnvironment();
        this.#defineGroupTemplate(this.#getGOJSMakeObject());
        this.#createNewModel();
        this.#load();
        this.#createInteractionEventListeners();
    };

    #createInteractionEventListeners = () => {
        this.#myDiagram.addDiagramListener('LinkDrawn', e => {
            this.#sendMessage(new Message(MODULE_MANAGER, ENVIRONMENT, 'Link Drawn Event', { event: 'LinkDrawn', fromNodeKey: e.subject.fromNode.key, toNodeKey: e.subject.toNode.key }));
        });
    }

    #createNewModel = () => {
        this.#model = { class: "go.GraphLinksModel", nodeCategoryProperty: "type", linkFromPortIdProperty: "frompid", linkToPortIdProperty: "topid", nodeDataArray: [], linkDataArray: [] }
    };

    /**
     * Creates a new node template.
     * @param {object (Module)} module The module object that will be represented as a node in the graph
     */
    #createTemplate = module => {
        if (invalidVariables([varTest(module, 'module', 'object')], 'Environment', '#createTemplate')) return;
        this.#makeTemplate(module.getData('name'), module.getData('image'), module.getData('color'), module.getData('shape'), this.#unpackPortArray(module, 'inports'), this.#unpackPortArray(module, 'outports'));
    }

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

    /**
     * 
     * @param {object (Module)} module 
     * @param {string} portType 'inports' or 'outports'
     * @returns array of ports
     */
    #unpackPortArray = (module, portType) => {
        if (invalidVariables([varTest(module, 'module', 'object'), varTest(portType, 'portType', 'string')], 'Environemnt', '#unpackPortArray')) return undefined;
        const ports = [];
        module.getData(portType).forEach(obj => ports.push(this.#makePort(obj.name, obj.leftSide)));
        return ports;
    }

    #getGOJSMakeObject = () => go.GraphObject.make;

    #startGoJsEnvironment = () => {
        this.#myDiagram = this.#createNewDiagram(this.#getGOJSMakeObject());
        this.#setGridVisibility(true);
    }

    #setGridVisibility = visibility => this.#myDiagram.grid.visible = visibility;

    #createNewDiagram = gojs => {
        return gojs(go.Diagram, this.#divID, this.#setInitialDiagramVariables(gojs));
    }

    #setInitialDiagramVariables = gojs => {
        return {
            initialContentAlignment: go.Spot.TopLeft,
            initialAutoScale: go.Diagram.UniformToFill,
            layout: gojs(go.LayeredDigraphLayout,
                { direction: 0 }),
            "commandHandler.archetypeGroupData": { text: "Composit", isGroup: true, color: "black", background: compositColor },
            "undoManager.isEnabled": true
        };
    }

    // This function is temporarily removed due to changing the inspector interface.
    // #setDiagramInsteractions = () => { return { backgroundSingleClicked: this.#clearInspector } };

    /**
     * Builds the gojs node template. 
     * @param {string} typename type of the node
     * @param {string} icon path to the icon
     * @param {string} background background color of the node
     * @param {string} shape shape of the node
     * @param {[] of gojs panel objects} inports array of panels. These were created by the makeport function
     * @param {[] of gojs panel objects} outports array of panels. These were created by the makeport function
     */
    #makeTemplate = (typename, icon, background, shape, inports, outports) => {
        const gojs = this.#getGOJSMakeObject();
        const node = this.#createNewNode(gojs, shape, background, typename, icon, inports, outports);
        this.#myDiagram.nodeTemplateMap.add(typename, node);
    }

    #createNewNode = (gojs, shape, background, typename, icon, inports, outports) => {
        return gojs(go.Node,
            this.#setSelectionAdornedVariables(),
            this.#setDoubleClickListener(),
            this.#createNodeBody(gojs, shape, background, typename, icon, inports, outports),
            this.#createMenuAdornment(gojs));
    };

    #createMenuAdornment = gojs => {
        return {
            contextMenu: this.#contextMenu
        }
    };

    #createNodeBody = (gojs, shape, background, typename, icon, inports, outports) => {
        return gojs(go.Panel,
            "Auto",
            this.#setNodeWidthAndHeight(80, 80),
            this.#createShapeObject(shape, gojs, background),
            this.#populateNodeBody(gojs, typename, icon),
            this.#createInports(gojs, inports),
            this.#createOutports(gojs, outports));
    }

    #createShapeObject = (shape, gojs, background) => {
        return gojs(go.Shape,
            shape,
            this.#setNodeShapeAttributes(background),
            this.#createNewGOJSBinding('stroke', 'stroke'),
            this.#createNewGOJSBinding('fill', 'fill'),
            this.#createNewAnimationTrigger('stroke'),
            this.#createNewAnimationTrigger('fill'));
    };
    #createNewAnimationTrigger = attribute => new go.AnimationTrigger(attribute);
    #createNewGOJSBinding = (attribute, identifier) => new go.Binding(attribute, identifier);

    #populateNodeBody = (gojs, typename, icon) => {
        return gojs(go.Panel,
            "Table",
            gojs(go.TextBlock,
                typename,
                this.#setNodeTypeAttributes()),
            gojs(go.Picture,
                icon,
                this.#setNodeIconAttributes(1, 8, 8, 3.0)),
            gojs(go.TextBlock,
                this.#setNodeNameAttributes(),
                new go.Binding("text", "name").makeTwoWay()));
    }

    #setNodeWidthAndHeight = (width, height) => {
        return {
            width: width,
            height: height
        };
    }

    #setNodeShapeAttributes = background => {
        return {
            fill: background,
            stroke: 'transparent',
            strokeWidth: 5,
            spot1: go.Spot.TopLeft,
            spot2: go.Spot.BottomRight,
            name: "SHAPE"
        };
    }

    #setNodeTypeAttributes = () => {
        return {
            row: 0,
            margin: 3,
            maxSize: new go.Size(80, NaN),
            stroke: "white",
            font: "bold 7pt sans-serif"
        };
    }

    #setNodeIconAttributes = (row, width, height, scale) => {
        return {
            row: 1,
            width: 8,
            height: 8,
            scale: 3.0
        };
    };

    #setNodeNameAttributes = () => {
        return {
            row: 2,
            margin: 3,
            editable: true,
            maxSize: new go.Size(80, 40),
            stroke: "white",
            font: "bold 9pt sans-serif"
        };
    }

    #createInports = (gojs, inports) => gojs(go.Panel, "Vertical", this.#alignInports(), inports);

    #createOutports = (gojs, outports) => gojs(go.Panel, "Vertical", this.#alignOutports(), outports);

    #alignInports = () => {
        return { alignment: new go.Spot(0, 0.5, 0, 0) };
    };

    #alignOutports = () => {
        return { alignment: new go.Spot(1, 0.5, 0, 0) };
    };

    #setDoubleClickListener = () => {
        return { doubleClick: (e, node) => this.#handleDoubleClick(e, node.key) };
    }

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
    #makePort = (name, leftside) => {
        const gojs = this.#getGOJSMakeObject();
        const panel = this.#createPortPanel(gojs);
        panel.add(this.#setupPort(leftside, this.#createPortObject(gojs, name), this.#createPortLabel(gojs, name), panel));
        return panel;
    }

    #setupPort = (leftside, port, label, panel) => {
        this.#placePortLabel(leftside, label);
        this.#placePort(leftside, panel);
        this.#alignPort(leftside, port);
        this.#setToLinkable(leftside, port);
        this.#setFromLinkable(leftside, port);
        return port;
    }

    #placePortLabel = (leftside, label) => label.margin === leftside ? new go.Margin(1, 1, 0, 0) : new go.Margin(1, 0, 0, 1);
    #placePort = (leftside, port) => port.toSpot = leftside ? go.Spot.Left : go.Spot.Right;
    #alignPort = (leftside, port) => port.alignment = leftside ? go.Spot.TopLeft : go.Spot.TopRight;
    #setToLinkable = (leftside, port) => port.toLinkable = leftside ? true : false;
    #setFromLinkable = (leftside, port) => port.fromLinkable = leftside ? false : true;

    #createPortPanel = gojs => {
        return gojs(go.Panel, "Horizontal",
            { margin: new go.Margin(2, 0) });
    };

    #createPortLabel = (gojs, name) => {
        return gojs(go.TextBlock, name, { font: "7pt sans-serif" });
    }
    #createPortObject = (gojs, name) => {
        return gojs(go.Shape, "Rectangle",
            {
                fill: "gray", stroke: null,
                desiredSize: new go.Size(12, 12),
                portId: name,  // declare this object to be a "port"
                toMaxLinks: 4,
                cursor: "pointer"  // show a different cursor to indicate potential link point
            });
    }

    #defineGroupTemplate = gojs => {
        // Groups consist of a title in the color given by the group node data
        // above a translucent gray rectangle surrounding the member parts
        this.#myDiagram.groupTemplate =
            gojs(go.Group, "Vertical",
                {
                    selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                    ungroupable: true  // enable Ctrl-Shift-G to ungroup a selected Group
                }, gojs("SubGraphExpanderButton", { row: 0, column: 0, margin: 3 }),
                gojs(go.TextBlock,
                    {
                        //alignment: go.Spot.Right,
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

    // gojs(go.Panel,
    //     "Table",

    //     gojs(go.Picture,
    //         icon,
    //         this.#setNodeIconAttributes()),
    //     gojs(go.TextBlock,
    //         this.#setNodeNameAttributes(),
    // new go.Binding("text", "name").makeTwoWay()))
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

    drawLinkBetweenNodes(source, destination) {
        this.#myDiagram.startTransaction('make new link');
        this.#myDiagram.model.addLinkData({ from: source, to: destination });
        this.#myDiagram.commitTransaction('make new link');
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
    insertModule = (mod, templateExists) => {
        if (mod && templateExists != undefined) {
            if (!templateExists) this.#createTemplate(mod);
            this.#myDiagram.startTransaction("make new node");
            this.#myDiagram.model.addNodeData({ "key": this.#nodeKey - 1, "type": mod.getData('name'), "name": mod.getData('type') });
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
            case 'Composit':
                color = compositColor;
                break;
            default:
                printErrorMessage('unhandled type. Cannot get color.', `type: ${type} -- Environment -> #getnodeColor`);
                break;
        }
        return color;
    }

    /**
     * Turns all Nodes in the graph gray when run is clicked.
     * @param {number[]} nodeArray Array of keys for the nodes to turn gray.
     */
    grayOutPipeline = nodeArray => {
        if (invalidVariables([varTest(nodeArray, 'nodeArray', 'object')], 'Environment', 'grayOutPipeline')) return;
        nodeArray.forEach(key => {
            if (key != undefined) this.changeNodeBackgroundColor(this.#myDiagram.findNodeForKey(key), 'gray');
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
        else node.findObject('SHAPE').fill = color;
    }

    #clearInspector = () => {
        this.#sendMessage(new Message(INSPECTOR, ENVIRONMENT, 'Clear Inspector Event', {}));
    }

}
