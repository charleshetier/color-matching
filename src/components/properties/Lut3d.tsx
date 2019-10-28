import React, { useEffect, useRef, useContext, useMemo } from 'react';
import * as THREE from 'three';
import { useDragBehavior } from 'core/hooks';
import { useCurrentColorCheckerSnapshot, useSelector } from 'store';
import { LutContext } from 'components/context';
import { RGB } from 'core/model';

export const Lut3d = () => {

    /** The HTML element hosting the 3d lut preview. */
    const mountRef = useRef<HTMLDivElement>();

    const { cube: colorCube, three } = useContext(LutContext);

    // Scene mouse drag interactions
    useDragBehavior(mountRef, {
        onDrag: e => {
            const { camera, scene, renderer, cube: cubeObject } = three;
            cubeObject.rotation.x += e.moveEvent.movementY * 0.01;
            cubeObject.rotation.y += e.moveEvent.movementX * 0.01;
            renderer.render(scene, camera);
        }
    });

    const colorCheckerReference = useSelector(state => state.colorCheckerReference);
    const colorCheckerSnapshot = useCurrentColorCheckerSnapshot();
    useMemo(() => {
        if (colorCheckerSnapshot) {
            colorCube.project(colorCheckerReference.grid
                .flatMap(o => o)
                .map(reference256 => reference256.map(c => c / 255) as RGB)
                .map((reference, i) => ({
                    reference,
                    projection: colorCheckerSnapshot[i].color.map(c => c / 255) as RGB
                })));
        }
    }, [colorCheckerReference, colorCheckerSnapshot, colorCube])


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


        // cube nodes
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(colorCube.colors.flatMap(color => color.map(channel => channel - 0.5)), 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colorCube.colors.flatMap(o => o), 3));
        geometry.computeBoundingSphere();
        const material = new THREE.PointsMaterial({ size: 0.06, vertexColors: THREE.VertexColors });
        const points = new THREE.Points(geometry, material);
        scene.add(points)
        points.parent = cubeObject;


        // arrows
        const red_arrow = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0), 
            new THREE.Vector3(-0.51, -0.51, -0.51),
            1.1,
            0xff0000, 0.1);
        scene.add(red_arrow);
        red_arrow.parent = cubeObject;

        const green_arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0), 
            new THREE.Vector3(-0.51, -0.51, -0.51),
            1.1,
            0x00ff00, 0.1);
        scene.add(green_arrow);
        green_arrow.parent = cubeObject;

        const blue_arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1), 
            new THREE.Vector3(-0.51, -0.51, -0.51),
            1.1,
            0x0000ff, 0.1);
        scene.add(blue_arrow);
        blue_arrow.parent = cubeObject;

        // Camera
        camera.position.z = 1.5;
        cubeObject.rotation.x = 0.57;
        cubeObject.rotation.y = 1;

        // Rendering
        renderer.render(scene, camera);

        // Changes handling
        colorCube.cubeNodes$.subscribe(e => {
            //console.log('cubeNodes', e);
            e.nodes.forEach((node, i) => {
                //@ts-ignore
                geometry.attributes.position.array[i*3] = node[0] - 0.5;
                //@ts-ignore
                geometry.attributes.position.array[i*3 + 1] = node[1] - 0.5;
                //@ts-ignore
                geometry.attributes.position.array[i*3 + 2] = node[2] - 0.5;
            });
            //@ts-ignore
            geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        });
    }, [three, colorCube]);

    return <div ref={mountRef as any} className="lut-3d"></div>
};