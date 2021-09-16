class Environment {
    constructor(divName) {
        this.publisher = new Publisher();
        this.MDT = new ModuleDataTable();          // Stores the modules in arrays separated by type.               // Is this the main Environment or staging environment.
        this.divName = divName;                    // The HTML Div of this environment.
        this.myDiagram;                            // GOJS diagram.
        this.startGoJsEnvironment();               // Initialize the GOJS environment
        this.model = this.createNewModel();        // Create A new GOJS model object.
        this.load();                               // Load the model and display it to the environemnt in browser.
        this.nodeKey = 1;                          // Initialize the next node key to 1.
        this.createEventListeners();
    }

    createEventListeners = () => {
        this.myDiagram.addDiagramListener('LinkDrawn', (e) => {
            this.publisher.publishMessage(
                {
                    tag: 'Link Drawn',
                    data: {
                        fromNodeKey: e.subject.fromNode.key,
                        toNodeKey: e.subject.toNode.key
                    }
                });
        });
    }

    createNewModel = () => {
        const model =
        {
            class: "go.GraphLinksModel",
            nodeCategoryProperty: "type",
            linkFromPortIdProperty: "frompid",
            linkToPortIdProperty: "topid",
            nodeDataArray: [
            ],
            linkDataArray: [
            ]
        }
        return model;
    };

    createTemplate = mod => {
        const inports = [];
        const outports = [];
        mod.getInPorts().forEach(obj => {
            inports.push(this.makePort(obj.name, obj.leftSide));
        });
        mod.getOutPorts().forEach(obj => {
            outports.push(this.makePort(obj.name, obj.leftSide));
        });
        this.makeTemplate(mod.getName(), mod.getImage(), mod.getColor(), mod.getShape(), inports, outports);
    }

    startGoJsEnvironment = () => {
        const $ = go.GraphObject.make;
        this.myDiagram =
            $(go.Diagram, this.divName,
                {
                    initialContentAlignment: go.Spot.TopLeft,
                    initialAutoScale: go.Diagram.UniformToFill,
                    layout: $(go.LayeredDigraphLayout,
                        { direction: 0 }),
                    "undoManager.isEnabled": true
                }
            );
        this.myDiagram.grid.visible = true;
    }

    makeTemplate = (typename, icon, background, shape, inports, outports) => {
        const $ = go.GraphObject.make;
        var node = $(go.Node, {
            selectionAdorned: true,  // don't bother with any selection adornment
            selectionChanged: this.onSelectionChanged
        },
            {
                doubleClick: (e, node) => {
                    this.MDT.handleDoubleClick(e, node.key, node.data.type);
                }
            },

            // executed when Part.isSelected has changed"Spot",
            $(go.Panel, "Auto",
                { width: 80, height: 80 },
                $(go.Shape, shape,
                    {
                        fill: background, stroke: null, strokeWidth: 0,
                        spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
                    }),
                $(go.Panel, "Table",
                    $(go.TextBlock, typename,
                        {
                            row: 0,
                            margin: 3,
                            maxSize: new go.Size(80, NaN),
                            stroke: "white",
                            font: "bold 7pt sans-serif"
                        }),
                    $(go.Picture, icon,
                        { row: 1, width: 8, height: 8, scale: 3.0 }),
                    $(go.TextBlock,
                        {
                            row: 2,
                            margin: 3,
                            editable: true,
                            maxSize: new go.Size(80, 40),
                            stroke: "white",
                            font: "bold 9pt sans-serif"
                        },
                        new go.Binding("text", "name").makeTwoWay())
                ),
                $(go.Panel, "Vertical",
                    {
                        alignment: new go.Spot(0, 0.5, 0, 0)
                    },
                    inports),
                $(go.Panel, "Vertical",
                    {
                        alignment: new go.Spot(1, 0.5, 0, 0)
                    },
                    outports)
            )
        );
        this.myDiagram.nodeTemplateMap.add(typename, node);
    }

    makePort = (name, leftside) => {
        const $ = go.GraphObject.make;
        var port = $(go.Shape, "Rectangle",
            {
                fill: "gray", stroke: null,
                desiredSize: new go.Size(12, 12),
                portId: name,  // declare this object to be a "port"
                toMaxLinks: 1,  // don't allow more than one link into a port
                cursor: "pointer"  // show a different cursor to indicate potential link point
            });

        var lab = $(go.TextBlock, name,  // the name of the port
            { font: "7pt sans-serif" });

        var panel = $(go.Panel, "Horizontal",
            { margin: new go.Margin(2, 0) });

        // set up the port/panel based on which side of the node it will be on
        if (leftside) {
            port.toSpot = go.Spot.Left;
            port.toLinkable = true;
            lab.margin = new go.Margin(1, 1, 0, 0);
            panel.alignment = go.Spot.TopLeft;
            //panel.add(lab);
            panel.add(port);
        } else {
            port.fromSpot = go.Spot.Right;
            port.fromLinkable = true;
            lab.margin = new go.Margin(1, 0, 0, 1);
            panel.alignment = go.Spot.TopRight;
            panel.add(port);
            //panel.add(lab);
        }
        return panel;
    }

    /** When a node is selected, the data for this module is passed to the Inspector
     * @param node -> The newly selected node. 
     */
    onSelectionChanged = node => {
        INS.setCurrentModule(this.MDT.getModule(node.key, node.data.type));
    }

    /** PUBLIC API */

    /** Removes a node from the diagram. */
    removeNode = (nodeKey) => {
        const node = this.myDiagram.findNodeForKey(nodeKey);
        if (node !== null) {
            this.myDiagram.startTransaction();
            this.myDiagram.remove(node);
            let i = this.model.nodeDataArray.forEach((n, index) => {
                if (n.key === nodeKey) {
                    return index;
                }
            });
            this.model.nodeDataArray.splice(i, 1);
            this.MDT.removeModule(nodeKey, node.data.type);
            this.myDiagram.commitTransaction("deleted node");
        } else {
            console.log('No Node Found. Cannot Delete.');
        }
    }

    /** Returns the next unique node key and increments the counter. */
    getNextNodeKey = () => {
        this.nodeKey++;
        return this.nodeKey - 1;
    }

    /** Deploys a new module to the environment
     * @param mod -> The module to deploy.
     */
    deployNewModule = (type, category) => {
        const mod = MG.generateNewModule(type, category);
        mod.setKey(this.getNextNodeKey());
        if (this.MDT.doesTemplateExist(type)) {
            this.createTemplate(mod);
        }
        this.MDT.addModule(mod); // Add The module to the data table.
        this.model.nodeDataArray.push({ "key": mod.getKey(), "type": mod.getName(), "name": mod.getType() });
        this.load();
    }

    /** Loads the model to the HTML browser page. */
    load = () => {
        this.myDiagram.model = go.Model.fromJson(this.model);
    };

    /** Runs the diagram */
    run = () => { };
}