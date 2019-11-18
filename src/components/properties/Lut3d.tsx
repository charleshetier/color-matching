import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDragBehavior } from 'core/hooks';
import { useCurrentImage } from 'store/index';
import { createNeutralCube } from 'core/coloring/cube-factory';

export const Lut3d = () => {

    /** The HTML element hosting the 3d lut preview. */
    const mountRef = useRef<HTMLDivElement>();

    const currentImage = useCurrentImage()!;
    const cubeColors = currentImage.cube.colors;
    const cubeSize = currentImage.cube.size;

    /** The threejs objects reference */
    const { current: three } = useRef({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, undefined, 0.1, 100),
        renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
        cubeObject: new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
            new THREE.LineBasicMaterial({
                color: 0x222222,
                linewidth: 1
            })),
        geometry: new THREE.BufferGeometry()
    });

    // Scene mouse drag interactions
    useDragBehavior(mountRef, {
        onDrag: e => {
            const { camera, scene, renderer, cubeObject } = three;
            cubeObject.rotation.x += e.moveEvent.movementY * 0.01;
            cubeObject.rotation.y += e.moveEvent.movementX * 0.01;
            renderer.render(scene, camera);
        }
    });


    // Building 3D scene
    useEffect(() => {
        // todo: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_points.html
        const { camera, scene, renderer, cubeObject, geometry } = three;
        const mountElement = mountRef.current!;
        const width = mountElement.clientWidth;
        const height = width;
        camera.aspect = width / height;
        renderer.setSize(width, height);
        mountElement.appendChild(renderer.domElement);
        scene.add(cubeObject);

        // Neutral cube is displayed waiting for cube projection computation
        const neutralCube = createNeutralCube(cubeSize);

        // cube nodes
        // const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(neutralCube.flatMap(color => color.map(channel => channel - 0.5)), 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(neutralCube.flatMap(o => o), 3));
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
    }, [three, cubeSize]);

    // Changes handling
    useEffect(() => {
        const { renderer, camera, scene, geometry } = three;
        //console.log('cubeNodes', e);
        cubeColors.forEach((node, i) => {
            //@ts-ignore
            geometry.attributes.position.array[i * 3] = node[0] - 0.5;
            //@ts-ignore
            geometry.attributes.position.array[i * 3 + 1] = node[1] - 0.5;
            //@ts-ignore
            geometry.attributes.position.array[i * 3 + 2] = node[2] - 0.5;
        });
        //@ts-ignore
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }, [three, cubeColors])

    return <div ref={mountRef as any} className="lut-3d"></div>
};