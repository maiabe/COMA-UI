function init(divName) {
    const DATATABLE = [];
    const COMPUTETABLE = [];

    var $ = go.GraphObject.make;

    myDiagram =
        $(go.Diagram, divName,
            {
                initialContentAlignment: go.Spot.Left,
                initialAutoScale: go.Diagram.UniformToFill,
                layout: $(go.LayeredDigraphLayout,
                    { direction: 0 }),
                "undoManager.isEnabled": true
            }
        );

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    myDiagram.addModelChangedListener(function (evt) {
        // ignore unimportant Transaction events
        if (!evt.isTransactionFinished) return;
        var txn = evt.object;  // a Transaction
        if (txn === null) return;
        // iterate over all of the actual ChangedEvents of the Transaction
        txn.changes.each(function (e) {
            // record node insertions and removals
            if (e.change === go.ChangedEvent.Property) {
                if (e.modelChange === "linkFromKey") {
                    console.log(evt.propertyName + " changed From key of link: " +
                        e.object + " from: " + e.oldValue + " to: " + e.newValue);
                } else if (e.modelChange === "linkToKey") {
                    console.log(evt.propertyName + " changed To key of link: " +
                        e.object + " from: " + e.oldValue + " to: " + e.newValue);
                }
            } else if (e.change === go.ChangedEvent.Insert && e.modelChange === "linkDataArray") {
                // console.log(evt.propertyName + " added link: " + e.newValue);
                // console.log(e);
                // console.log(e.newValue.from);
                // console.log(e.newValue.to);

                let outNode = myDiagram.findNodeForKey(e.newValue.from);
                // console.log(outNode.data);
                let inNode = myDiagram.findNodeForKey(e.newValue.to);
                // console.log(inNode.data);

                if (outNode.data.type === 'Query' && inNode.data.type === 'Generate') {
                    generateValue(outNode, inNode);
                } else if (inNode.data.type === 'Output') {
                    generateOutput(outNode, inNode);
                } else if (inNode.data.type === 'Computation') {
                    compute(outNode, inNode);
                }

            } else if (e.change === go.ChangedEvent.Remove && e.modelChange === "linkDataArray") {
                console.log(evt.propertyName + " removed link: " + e.oldValue);
            }
        });
    });

    function compute(outNode, inNode) {
        console.log(inNode.data);
        const arr = myDiagram.model.linkDataArray;
        const links = [];
        Object.keys(arr).forEach(key => {

            if (arr[key].to === inNode.key) {
                links.push(arr[key]);
            }
        });
        if (links.length === 2) {
            const values = [];
            links.forEach(l => {
                DATATABLE.forEach(e => {
                    if (e.gid === l.from) {
                        values.push({ 'type': e.type, 'num': e.num });
                    }
                });
            });
            if (values.length == 2) {
                let obj = {};
                switch (inNode.data.name) {
                    case 'Dot Product':
                        if (values[0].type == 'Vector' && values[1].type == 'Vector') {
                            const vectorA = [parseFloat(values[0].num.x), parseFloat(values[0].num.y), parseFloat(values[0].num.z)];
                            const vectorB = [parseFloat(values[1].num.x), parseFloat(values[1].num.y), parseFloat(values[1].num.z)];
                            obj = {
                                'type': 'Scalar',
                                'num': math.dot(vectorA, vectorB),
                                'qid': outNode.data.key,
                                'gid': inNode.data.key
                            }
                        }

                        DATATABLE.push(obj);
                        break;
                    case 'Cross Product':
                        if (values[0].type == 'Vector' && values[1].type == 'Vector') {
                            const vectorA = [parseFloat(values[0].num.x), parseFloat(values[0].num.y), parseFloat(values[0].num.z)];
                            const vectorB = [parseFloat(values[1].num.x), parseFloat(values[1].num.y), parseFloat(values[1].num.z)];
                            const cross = math.cross(vectorA, vectorB);
                            obj = {
                                'type': 'Scalar',
                                'num': {
                                    'x': cross[0].toFixed(2),
                                    'y': cross[1].toFixed(2),
                                    'z': cross[2].toFixed(2)
                                },
                                'qid': outNode.data.key,
                                'gid': inNode.data.key
                            }
                        }

                        DATATABLE.push(obj);
                        break;
                    case 'Multiple':
                        break;
                }
            }
        }
    }
    function generateOutput(outNode, inNode) {
        let nodeId = outNode.data.key;
        DATATABLE.forEach(e => {
            if (e.gid === outNode.data.key) {
                inNode.data.name = JSON.stringify(e.num);
            }
        });
        save();
        //setTimeout(load, 400);
    }


    function generateValue(outNode, inNode) {
        let obj = {};
        switch (outNode.data.name) {
            case 'Vector':
                const v = {
                    'x': (Math.random() * 10).toFixed(2),
                    'y': (Math.random() * 10).toFixed(2),
                    'z': (Math.random() * 10).toFixed(2)
                }
                obj = {
                    'type': 'Vector',
                    'num': v,
                    'qid': outNode.data.key,
                    'gid': inNode.data.key
                }
                DATATABLE.push(obj);
                break;
            case 'Scalar':
                const n = (Math.random() * 100).toFixed(2)
                obj = {
                    'type': 'Scalar',
                    'num': n,
                    'qid': outNode.data.key,
                    'gid': inNode.data.key
                }
                DATATABLE.push(obj);
                break;
        }
        console.log(inNode.data);
        console.log(DATATABLE);
    }

    function makePort(name, leftside) {
        var port = $(go.Shape, "Rectangle",
            {
                fill: "gray", stroke: null,
                desiredSize: new go.Size(8, 8),
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
            lab.margin = new go.Margin(1, 0, 0, 1);
            panel.alignment = go.Spot.TopLeft;
            panel.add(port);
            panel.add(lab);
        } else {
            port.fromSpot = go.Spot.Right;
            port.fromLinkable = true;
            lab.margin = new go.Margin(1, 1, 0, 0);
            panel.alignment = go.Spot.TopRight;
            panel.add(lab);
            panel.add(port);
        }
        return panel;
    }

    function makeTemplate(typename, icon, background, inports, outports) {
        var node = $(go.Node, "Spot",
            $(go.Panel, "Auto",
                { width: 100, height: 120 },
                $(go.Shape, "Rectangle",
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
                            font: "bold 11pt sans-serif"
                        }),
                    $(go.Picture, icon,
                        { row: 1, width: 16, height: 16, scale: 3.0 }),
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
                )
            ),
            $(go.Panel, "Vertical",
                {
                    alignment: go.Spot.Left,
                    alignmentFocus: new go.Spot(0, 0.5, 8, 0)
                },
                inports),
            $(go.Panel, "Vertical",
                {
                    alignment: go.Spot.Right,
                    alignmentFocus: new go.Spot(1, 0.5, -8, 0)
                },
                outports)
        );
        myDiagram.nodeTemplateMap.set(typename, node);
    }

    makeTemplate("Query", "gojs/samples/images/table.svg", "forestgreen",
        [],
        [makePort("OUT", false)]);

    makeTemplate("Computation", "gojs/samples/images/join.svg", "mediumorchid",
        [makePort("A", true), makePort("B", true)],
        [makePort("Out", false)]);

    makeTemplate("Generate", "gojs/samples/images/project.svg", "darkcyan",
        [makePort("IN", true)],
        [makePort("OUT", false), makePort("OUTPUT", false)]);

    makeTemplate("Output", "gojs/samples/images/filter.svg", "cornflowerblue",
        [makePort("IN", true)],
        []);

    makeTemplate("Group", "gojs/samples/images/group.svg", "mediumpurple",
        [makePort("", true)],
        [makePort("OUT", false)]);

    makeTemplate("Sort", "gojs/samples/images/sort.svg", "sienna",
        [makePort("", true)],
        [makePort("OUT", false)]);

    makeTemplate("Export", "gojs/samples/images/upload.svg", "darkred",
        [makePort("", true)],
        []);

    myDiagram.linkTemplate =
        $(go.Link,
            {
                routing: go.Link.Orthogonal, corner: 5,
                relinkableFrom: true, relinkableTo: true
            },
            $(go.Shape, { stroke: "gray", strokeWidth: 2 }),
            $(go.Shape, { stroke: "gray", fill: "gray", toArrow: "Standard" })
        );

    //load();
}

function generateVector() {
    let vector = { 'x': 1, 'y': 2, 'z': 3 };
}

// // Show the diagram's model in JSON format that the user may edit
// function save() {
//     document.getElementById("mySavedModel").value = myDiagram.model.toJson();
//     myDiagram.isModified = false;
// }
// function load() {
//     myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
// }

//window.addEventListener('DOMContentLoaded', init);