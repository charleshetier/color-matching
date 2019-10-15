import { createContext } from "react";
import * as THREE from 'three';
import { ColorCube } from 'core/coloring/cube';
import config from 'config';

export const lutContextDefaultValue = {
    cube: new ColorCube(config.cube.size),
    three: {
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, undefined, 0.1, 100),
        renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
        cube: new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
            new THREE.LineBasicMaterial({
                color: 0x666666,
                linewidth: 1
            }))
    }
};

export const LutContext = createContext(lutContextDefaultValue);