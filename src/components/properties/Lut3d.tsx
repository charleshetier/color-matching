import React, { useEffect, useRef, useContext } from 'react';
import * as THREE from 'three';
import { useDragBehavior } from 'core/hooks';
import { useCurrentColorCheckerSnapshot } from 'store';
import { LutContext } from 'components/context';

export const Lut3d = () => {

    /** The HTML element hosting the 3d lut preview. */
    const mountRef = useRef<HTMLDivElement>();

    const { cube: colorCube, three } = useContext(LutContext);
    const size = colorCube.size;

    // Scene mouse drag interactions
    useDragBehavior(mountRef, {
        onDrag: e => {
            const { camera, scene, renderer, cube: cubeObject } = three;
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
        // todo: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_points.html
        const { camera, scene, renderer, cube: cubeObject } = three;
        const mountElement = mountRef.current!;
        const width = mountElement.clientWidth;
        const height = width;
        camera.aspect = width / height;
        renderer.setSize(width, height);
        mountElement.appendChild(renderer.domElement);
        scene.add(cubeObject);

        // const g = new THREE.SphereGeometry(0.025, 4, 4);
        // const colorCubeNodeObjects = colorCube.colors.map((rgb, i) => {
        //     const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb) });
        //     const nodeObject = new THREE.Mesh(g, m);
        //     nodeObject.position.set(
        //         (i % size) / (size - 1) - 0.5,
        //         (Math.floor(i / (size)) % size) / (size - 1) - 0.5,
        //         Math.floor(i / (size * size)) / (size - 1) - 0.5);
        //     scene.add(nodeObject);
        //     nodeObject.parent = cubeObject;
        //     return nodeObject;
        // });
        const color = new THREE.Color();
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(colorCube.colors.flatMap((o, i) => [
            (i % size) / (size - 1) - 0.5,
            (Math.floor(i / (size)) % size) / (size - 1) - 0.5,
            Math.floor(i / (size * size)) / (size - 1) - 0.5
        ]), 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colorCube.colors.flatMap(o => o), 3));
        geometry.computeBoundingSphere();
        const material = new THREE.PointsMaterial({ size: 0.06, vertexColors: THREE.VertexColors });
        const points = new THREE.Points(geometry, material);
        scene.add(points)
        points.parent = cubeObject;

        camera.position.z = 1.5;
        cubeObject.rotation.x = 0.57;
        cubeObject.rotation.y = 1;

        renderer.render(scene, camera);

        // function frame() {
        //     colorCube.colors.forEach((color, i) => {
        //         const nodeObject = colorCubeNodeObjects[i];
        //         const position = color.map(c => c - 0.5) as [number, number, number];
        //         nodeObject.position.set(...position);
        //         renderer.render(scene, camera);
        //     });
        //     window.setTimeout(() => window.requestAnimationFrame(frame), 500);
        // }
        // window.requestAnimationFrame(frame);
    }, [three]);

    return <div ref={mountRef as any} className="lut-3d"></div>
};