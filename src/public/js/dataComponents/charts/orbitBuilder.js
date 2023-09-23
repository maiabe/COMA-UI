import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './CSS2DRenderer.js';
import { GUI } from './lil-gui.module.min.js';
import { LabelGenerator } from '../../htmlGeneration/index.js';
import { PlanetCodes } from '../../sharedVariables/index.js';

export class OrbitBuilder {

    #dataTable; 
    #HF;
    #LayersIndex;
    #axisLines;

    constructor() {
        this.#dataTable = new Map();
        this.#HF = new HTMLFactory();
        this.#LayersIndex = 0;
    };

    plotData(data, div, width, height) {
        var objects = data.objects;
        var orbits = data.orbits;
        return this.#createThree(objects, orbits, div, width, height);
    }

    // Update scene with renderer
    //updatePlotData(renderer, camera, scene, objects) {
    updatePlotData(activeOrbit, data, div, width, height) {
        return this.#updateThree(activeOrbit, data, div, width, height);
    }

    /*plotSphere(x, y, z, color, scene) {
        const geometry = new THREE.SphereGeometry(0.01, 5, 5);
        const material = new THREE.MeshBasicMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        scene.add(sphere);
    }*/

    // Plot the path of the object
    // Needs a better line rendreere because we can't set the line width currently
    #plotWholePath(points, color, group) {
        const datapoints = points.map((point) => {
            return new THREE.Vector3(point.x, point.y, point.z);
        });

        const curve = new THREE.CatmullRomCurve3(datapoints);
        const curvePoints = curve.getPoints(points.length);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 1 });
        const curveLine = new THREE.Line(geometry, material);

        curveLine.layers.set(this.#LayersIndex);
        group.add(curveLine);

        return curveLine;
        //line.curve = curve;
        //scene.add(curveObject);

        /*const group = new THREE.Group();
        scene.add(group);
        group.add(line);*/

        // create label
        /*const label = this.#createLabel(name, curve);
        group.add(label);*/
    }

    // Plot the data points of the object
    #plotDataPoints(points, color, group) {
        // Add small spheres for data points
        const sphereGeometry = new THREE.SphereGeometry(0.03, 8, 8); // Adjust the radius and segments as needed
        const sphereMaterial = new THREE.MeshStandardMaterial({ color });

        for (const point of points) {
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphereMesh.position.set(point.x, point.y, point.z);
            group.add(sphereMesh);
            sphereMesh.layers.set(this.#LayersIndex);
        }
        //group.layers.add(this.#LayerIndex);
        return group;
    }

    /*#createLegend(legendDiv, group) {
        console.log(legendDiv);

        // create CSS2DObject
        const label = new CSS2DObject(legendDiv);
        label.position.set(0, 1, 0);

        console.log(label);
        group.add(label);
    }*/

    /*#addLegend(name, color, legendDiv) {
        // list? use span and set backgroundColor to create color lines?

        const legendItem = this.#HF.createNewDiv('', '', ['orbit-legend-item'], []);

        // get planet code here
        const planetCodeObject = PlanetCodes.filter(p => p.name === name);
        const planetCode = planetCodeObject.length > 0 ? planetCodeObject[0].code : name; 
        const itemName = this.#HF.createNewSpan('', '', ['orbit-legend-item-name'], [{ style: 'color', value: 'white' }], planetCode + ': ');
        const itemColor = this.#HF.createNewSpan('', '', ['orbit-legend-item-color'], [{style: 'font-size', value: '2px'},  { style: 'background-color', value: color },  { style: 'vertical-align', value: 'middle' }], '---------------------------------');
        legendItem.appendChild(itemName);
        legendItem.appendChild(itemColor);
        legendDiv.appendChild(legendItem);
    }*/


    // make the light a child of a camera
    // offset the light
    // attach light to camera (orbit control)
    // offset the light from the camera
    // set params to 0, 0, 0
    // use point light?

    // Search for a good scrollable image viewer

    #createScene() {
        const scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0x404040);
        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(100, 100, 100);
        scene.add(ambientLight);
        scene.add(light);

        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.rotation.x = Math.PI / 2; // Rotate around the X-axis
        axesHelper.layers.set(this.#LayersIndex);
        this.#LayersIndex++;

        //axesHelper.setColors(0xffffff, 0xff4da6, 0x4de7ff);
        scene.add(axesHelper);
        //this.#createAxisLines(scene);

        return scene;
    }

    /** Creates Orbit plot elements 
     * 
     * 
     * */
    #createThree(objects, orbits, div, width, height) {
        // Create the scene, camera and renderer
        const scene = this.#createScene();
        const group = new THREE.Group();
        scene.add(group);

        const camera = new THREE.PerspectiveCamera(
            75, // fov
            width / height,
            0.1, // near clipping plane
            1000 // far clipping plane
        );
        camera.position.set(0, 5, 1);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
        camera.layers.enableAll();

        // create legendDOM
        /*const legendDiv = this.#HF.createNewDiv('', '', ['orbit-legend'],
            [{ style: 'position', value: 'absolute' }, { style: 'z-index', value: '2' }, { style: 'color', value: 'white' }, { style: 'top', value: '50px' }, { style: 'left', value: '50px' }, { style: 'margin', value: '2% 0' }]);
        div.appendChild(legendDiv);
*/

        let objectLayers = {
            'Enable All': function () { camera.layers.enableAll(); },
            'Disable All': function () {
                camera.layers.disableAll();
                camera.layers.toggle(0);
            },
        };
        let objectGui = this.#initGui('Toggle Object', div, 'toggle-object');
        
        let orbitLayers = {
            'Enable All': function () { camera.layers.enableAll(); },
            'Disable All': function () {
                camera.layers.disableAll();
                camera.layers.toggle(0);
            },
        };
        let orbitGui = this.#initGui('Toggle Orbit', div, 'toggle-orbit');

        //------------------- Plot the object datapoints provided in the objects array
        objects.forEach((el) => {
            this.#plotDataPoints(el.vectors, el.color, group);
            this.#addGuiElement(el.name, el.color, objectLayers, objectGui, camera);
        });
        /*objectGui.add(objectLayers, 'Enable All');
        objectGui.add(objectLayers, 'Disable All');*/

        //------------------- Plot the planet orbits provided in the orbits array
        orbits.forEach((el) => {
            this.#plotWholePath(el.vectors, el.color, group);
            this.#addGuiElement(el.name, el.color, orbitLayers, orbitGui, camera);
            // add legend item here
            //this.#addLegend(el.name, el.color, legendDiv);
        });
        /*orbitGui.add(orbitLayers, 'Enable All');
        orbitGui.add(orbitLayers, 'Disable All');*/

        
        // create legend object here, and add it to the group
        //this.#createLegend(legendDiv, group);


        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        // Add the renderer to the div
        div.appendChild(renderer.domElement);

        /*let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.zIndex = '1';
        labelRenderer.domElement.style.top = '0px';
        div.appendChild(labelRenderer.domElement);*/

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 0.1;


        function animate() {
            requestAnimationFrame(animate);

            camera.up.set(0, 0, 1);
            controls.update();
            camera.up.set(0, 0, 1);
            // Check the slider value
            // Remove old spheres
            // Add new spheres depending on the slider value
            // Do every frame,
            // Has the slider value changed?

            renderer.render(scene, camera);
            //labelRenderer.render(scene, camera);
        }

        animate();

        return { camera: camera, renderer: renderer, controls: controls };
    }

    #initGui(title, div, className) {
        let gui = new GUI();
        div.appendChild(gui.domElement);
        gui.domElement.classList.add(className);
        gui.title(title);
        /*gui.add(layers, 'Enable All');
        gui.add(layers, 'Disable All');*/
        gui.open();

        return gui;
    }

    #addGuiElement(name, color, layers, gui, camera) {
        let index = this.#LayersIndex;
        layers[name] = function () {
            
            camera.layers.toggle(index);
            
        };
        gui.add(layers, name);

        let layerDOM = gui.domElement.querySelector(`#lil-gui-name-${this.#LayersIndex}`);
        layerDOM.style.color = 'black';
        layerDOM.style.backgroundColor = color;

        this.#LayersIndex++;
    }

    #updateThree(activeOrbit, data, div) {
        console.log(activeOrbit);
        const scene = this.#createScene();
        //const scene = activeOrbit.scene;

        const camera = activeOrbit.camera;
        //camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const objects = data.objects;
        const orbits = data.orbits;

        objects.forEach((el) => {
            const points = el.vectors;
            //console.log(points);
            this.#plotDataPoints(points, el.color, scene);
        });
        
        orbits.forEach((el) => {
            const points = el.vectors;
            //console.log(points);
            this.#plotWholePath(points, el.color, scene);
        });

        //camera.position.z = 1;

        // get renderer
        var renderer = activeOrbit.renderer;
        //renderer.setSize(width, height);

        //const labelRenderer = activeOrbit.labelRenderer;
        const controls = activeOrbit.controls;

        function animate() {
            requestAnimationFrame(animate);

            //console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);

            camera.up.set(0, 0, 1);
            controls.update();
            camera.up.set(0, 0, 1);

            // Check the slider value
            // Remove old spheres
            // Add new spheres depending on the slider value
            // Do every frame,
            // Has the slider value changed?

            renderer.render(scene, camera);
            //labelRenderer.render(scene, camera);
        }

        animate();
        return { camera: camera, renderer: renderer, controls: controls };
    }

    #createAxisLines(scene) {
        // Define the length of the axis lines
        const axisLength = 100;

        // X-axis
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-axisLength, 0, 0),
            new THREE.Vector3(axisLength, 0, 0),
        ]);
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xfcffc7 });
        const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
        scene.add(xAxis);

        // Y-axis
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -axisLength, 0),
            new THREE.Vector3(0, axisLength, 0),
        ]);
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0xfcffc7 });
        const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
        scene.add(yAxis);

        // Z-axis
        const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -axisLength),
            new THREE.Vector3(0, 0, axisLength),
        ]);
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0xfcffc7 });
        const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
        scene.add(zAxis);

    }


    resizeOrbitChart(activeOrbit, width, height) {
        var orbitObject = activeOrbit.orbitObject;
        var renderer = orbitObject.renderer;
        var camera = orbitObject.camera;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}
