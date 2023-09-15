import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

export class OrbitBuilder {

    #dataTable; 
    #HF;
    #axisLines;

    constructor() {
        this.#dataTable = new Map();
        this.#HF = new HTMLFactory();

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
    #plotWholePath(points, color, scene) {
        const datapoints = points.map((point) => {
            return new THREE.Vector3(point.x, point.y, point.z);
        });

        const curve = new THREE.CatmullRomCurve3(datapoints);
        const curvePoints = curve.getPoints(points.length);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 1 });
        const curveObject = new THREE.Line(geometry, material);

        scene.add(curveObject);
    }

    // Plot the data points of the object
    #plotDataPoints(points, color, scene) {
        // Add small spheres for data points
        const sphereGeometry = new THREE.SphereGeometry(0.03, 8, 8); // Adjust the radius and segments as needed
        const sphereMaterial = new THREE.MeshStandardMaterial({ color });

        for (const point of points) {
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphereMesh.position.set(point.x, point.y, point.z);
            scene.add(sphereMesh);
        }
    }

    #getRGB(hexColor) {
        // Convert the hex color to a vec4 format in GLSL
        const r = parseInt(hexColor.slice(1, 3), 16) / 255.0;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255.0;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255.0;
        const a = 1.0; // Alpha value, set to 1.0 for full opacity

        // Use the vec4 format in GLSL
        return { r: r, g: g, b: g, a: a };
    }

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

        /*const axesHelper = new THREE.AxesHelper(10);
        axesHelper.rotation.x = Math.PI / 2; // Rotate around the X-axis

        axesHelper.setColors(0xffffff, 0xff4da6, 0x4de7ff);
        scene.add(axesHelper);*/
        this.#createAxisLines(scene);

        return scene;
    }

    #createThree(objects, orbits, div, width, height) {
        // Create the scene, camera and renderer
        const scene = this.#createScene();

        const camera = new THREE.PerspectiveCamera(
            75, // fov
            width / height,
            0.1, // near clipping plane
            1000 // far clipping plane
        );
        camera.position.set(0, 5, 0);
        camera.up.set(0, -1, 0);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        // Grab the div where we will put the threejs canvas
        //const threeDiv = document.querySelector("#three-obrits");
        // Add the renderer to the div
        div.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);

/*        // Modify OrbitControls to restrict rotation to the Z-axis only
        controls.enabled = true;
        controls.rotateSpeed = 1; // Adjust the rotation speed as needed

        controls.minPolarAngle = Math.PI / 2; // Limit rotation to the upper hemisphere
        controls.maxPolarAngle = Math.PI / 2;

        controls.minDistance = 3; // Set minimum zoom distance
        controls.maxDistance = 10; // Set maximum zoom distance
*/

        //------------------- Plot the object datapoints provided in the objects array
        objects.forEach((el) => {
            this.#plotDataPoints(el.vectors, el.color, scene);
        });

        orbits.forEach((el) => {
            const points = el.vectors;
            //console.log(points);
            this.#plotWholePath(points, el.color, scene);
        });


        // Set up custom controls
        /*const controls = new THREE.EventDispatcher();

        // Store initial mouse position
        let mouse = new THREE.Vector2();
        let initialCameraRotation = new THREE.Euler();

        // Add mouse events
        document.addEventListener('mousedown', (event) => {
            event.preventDefault();
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            initialCameraRotation.copy(camera.rotation.clone());
            renderer.domElement.addEventListener('mousemove', onMouseMove);
            renderer.domElement.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(event) {
            event.preventDefault();
            const rect = renderer.domElement.getBoundingClientRect();
            const currentMouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );

            const delta = currentMouse.clone().sub(mouse);
            const rotationSpeed = 0.01; // Adjust rotation speed as needed
            camera.rotation.y = initialCameraRotation.y - delta.x * rotationSpeed;
        }

        function onMouseUp() {
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('mouseup', onMouseUp);
        }*/

        // Set the cmaera away from center
        //camera.position.z = 1;

        function animate() {
            requestAnimationFrame(animate);
            //controls.update();

            // Check the slider value
            // Remove old spheres
            // Add new spheres depending on the slider value
            // Do every frame,
            // Has the slider value changed?

            renderer.render(scene, camera);
        }

        animate();

        //this.#createAxisLines(scene);

        return { camera: camera, renderer: renderer };
    }

    

    #updateThree(activeOrbit, data, width, height) {
        console.log(activeOrbit);
        var scene = this.#createScene();

        // get renderer
        var renderer = activeOrbit.renderer;
        renderer.setSize(width, height);

        var camera = activeOrbit.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        var objects = data.objects;
        var orbits = data.orbits;

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

        function animate() {
            requestAnimationFrame(animate);

            //console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);

            //controls.update();

            // Check the slider value
            // Remove old spheres
            // Add new spheres depending on the slider value
            // Do every frame,
            // Has the slider value changed?

            renderer.render(scene, camera);
        }

        animate();
        return { camera: camera, renderer: renderer };
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
}
