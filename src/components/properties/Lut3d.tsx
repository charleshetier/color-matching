import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useDragBehavior } from 'core/hooks';
import { ColorCube } from 'core/lut/cube';
import { useCurrentColorCheckerReference, useCurrentColorCheckerSnapshot } from 'store';

const size = 8;
export const Lut3d = () => {

    /** The HTML element hosting the 3d lut preview. */
    const mountRef = useRef<HTMLDivElement>();

    /** Shared scene data object references. */
    const sceneData = useMemo(() => ({
        colorCube: new ColorCube(size),
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, undefined, 0.1, 100),
        renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
        cube: new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
            new THREE.LineBasicMaterial({
                color: 0x666666,
                linewidth: 1
            }))
    }), []);

    // Scene mouse drag interactions
    useDragBehavior(mountRef, {
        onDrag: e => {
            const { camera, scene, renderer, cube: cubeObject } = sceneData;
            cubeObject.rotation.x += e.moveEvent.movementY * 0.01;
            cubeObject.rotation.y += e.moveEvent.movementX * 0.01;
            renderer.render(scene, camera);
        }
    });

    // const colorCheckerReference = useCurrentColorCheckerReference();
    // const colorCheckerSnapshot = useCurrentColorCheckerSnapshot();
    // useMemo(() => {
    //     sceneData.colorCube.projectWith(colorCheckerReference.grid.flatMap(o => o)
    //         .map((reference, i) => ({
    //             reference,
    //             projection: colorCheckerSnapshot[i]
    //         })));
    // }, [colorCheckerReference, colorCheckerSnapshot])


    // Building 3D scene
    useEffect(() => {
        const { camera, scene, renderer, cube: cubeObject, colorCube } = sceneData;
        const mountElement = mountRef.current!;
        const width = mountElement.clientWidth;
        const height = width;
        camera.aspect = width / height;
        renderer.setSize(width, height);
        mountElement.appendChild(renderer.domElement);
        scene.add(cubeObject);

        const g = new THREE.SphereGeometry(0.025, 4, 4);
        const colorCubeNodeObjects = colorCube.colors.map((rgb, i) => {
            const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb) });
            const nodeObject = new THREE.Mesh(g, m);
            nodeObject.position.set(
                (i % size) / (size - 1) - 0.5,
                (Math.floor(i / (size)) % size) / (size - 1) - 0.5,
                Math.floor(i / (size * size)) / (size - 1) - 0.5);
            scene.add(nodeObject);
            nodeObject.parent = cubeObject;
            return nodeObject;
        });

        camera.position.z = 1.5;
        cubeObject.rotation.x = 0.57;
        cubeObject.rotation.y = 1;

        renderer.render(scene, camera);

        // function frame() {
        //     sceneData.colorCube.colors.forEach((color, i) => {
        //         const nodeObject = colorCubeNodeObjects[i];
        //         const position = color.map(c => c - 0.5) as [number, number, number];
        //         nodeObject.position.set(...position);
        //         renderer.render(scene, camera);
        //     });
        //     window.setTimeout(() => window.requestAnimationFrame(frame), 500);
        // }
        // window.requestAnimationFrame(frame);
    }, [sceneData]);

    return <div ref={mountRef as any} className="lut-3d"></div>
};