import { RGB } from "core/model";
import { createCubeHookForRGBValue } from './hooking';
import { step } from "./relaxation";

const worker: Worker = self as any;

worker.addEventListener('message', (event) => {
    const mapping: { reference: RGB, projection: RGB }[] = event.data.mapping;
    const cube: { colors: RGB[], size: number } = event.data.cube;

    const hooks = mapping.map(colorDistorsion => createCubeHookForRGBValue(cube)(colorDistorsion.reference, colorDistorsion.projection));
    step(cube)(hooks);

    worker.postMessage({nodes: cube.colors});
});