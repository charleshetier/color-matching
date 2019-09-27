import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDragBehavior } from 'core/hooks';

// Temp...
const size = 8;
const range = (size: number) => Array.from(Array(size).keys());
const neutralCube = range(size).map(b => range(size).map(g => range(size)
    .map(r => [r, g, b]))).flatMap(o => o.flatMap(o => o))
    .map(rgb => rgb.map(c => c / (size - 1)) as [number, number, number]);

export const Lut3d = () => {

    /** The HTML element hosting the 3d lut preview. */
    const mountRef = useRef<HTMLDivElement>();

    /** Shared scene data object references. */
    const { current: sceneData } = useRef({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, undefined, 0.1, 100),
        renderer: new THREE.WebGLRenderer({ alpha: true }),
        cube: new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
            new THREE.LineBasicMaterial({
                color: 0x666666,
                linewidth: 1
            }))
    });

    // Scene mouse drag interactions
    useDragBehavior(mountRef, {
        onDrag: e => {
            const { camera, scene, renderer, cube: cubeObject } = sceneData;
            cubeObject.rotation.x += e.moveEvent.movementY * 0.01;
            cubeObject.rotation.y += e.moveEvent.movementX * 0.01;
            renderer.render(scene, camera);
        }
    });


    // Building 3D scene
    useEffect(() => {
        const { camera, scene, renderer, cube: cubeObject } = sceneData;
        const mountElement = mountRef.current!;
        const width = mountElement.clientWidth;
        const height = width;
        camera.aspect = width / height;
        renderer.setSize(width, height);
        mountElement.appendChild(renderer.domElement);
        scene.add(cubeObject);

        const g = new THREE.SphereGeometry(0.02, 3, 3);
        neutralCube.forEach((rgb, i) => {
            const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb) });
            const sphereObject = new THREE.Mesh(g, m);
            sphereObject.position.set(
                (i % size) / (size - 1) - 0.5,
                (Math.floor(i / (size)) % size) / (size - 1) - 0.5,
                Math.floor(i / (size * size)) / (size - 1) - 0.5);
            scene.add(sphereObject);
            sphereObject.parent = cubeObject;
        });

        camera.position.z = 1.5;
        cubeObject.rotation.x = 0.57;
        cubeObject.rotation.y = 1;

        renderer.render(scene, camera);
    }, [sceneData]);

    return <div ref={mountRef as any} className="lut-3d"></div>
};