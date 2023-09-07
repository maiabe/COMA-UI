import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import * as THREE from '/three/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

export class OrbitBuilder {

    #dataTable; 
    #HF;
    //#SCENE;

    constructor() {
        this.#dataTable = new Map();
        this.#HF = new HTMLFactory();
    };

    plotData(data, div, width, height) {
        var objects = data.objects;
        var ephemerides = data.ephemerides;
        return this.#createThree(objects, ephemerides, div, width, height);
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
        const points2 = curve.getPoints(points.length);
        const geometry = new THREE.BufferGeometry().setFromPoints(points2);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        const curveObject = new THREE.Line(geometry, material);

        scene.add(curveObject);
    }

    #createThree(objects, ephemerides, div, width, height) {
        // Create the scene, camera and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75, // fov
            width / height,
            0.1, // near clipping plane
            1000 // far clipping plane
        );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        // Grab the div where we will put the threejs canvas
        //const threeDiv = document.querySelector("#three-obrits");
        // Add the renderer to the div
        div.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);

        // Plot the object datapoints provided in the objects array
        /*objects.forEach((el) => {
            *//*const points = el.map((point) => {
                return { x: point.x, y: point.y, z: point.z };
            });*//*
            const points = el.vectors;
            console.log(points);
            this.#plotWholePath(points, "#20A4F3", scene);
        });*/

        ephemerides.forEach((el) => {
            const points = el.vectors;
            //console.log(points);
            this.#plotWholePath(points, "#20A4F3", scene);
        });

        // Set the cmaera away from center
        camera.position.z = 1;

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
        return { camera: camera, renderer: renderer };
    }

    

    #updateThree(activeOrbit, data, width, height) {
        console.log(activeOrbit);
        var scene = new THREE.Scene();

        // get renderer
        var renderer = activeOrbit.renderer;
        renderer.setSize(width, height);

        var camera = activeOrbit.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        var objects = data.objects;
        var ephemerides = data.ephemerides;

        ephemerides.forEach((el) => {
            const points = el.vectors;
            //console.log(points);
            this.#plotWholePath(points, "#20A4F3", scene);
        });

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
        return { camera: camera, renderer: renderer };
    }


}
