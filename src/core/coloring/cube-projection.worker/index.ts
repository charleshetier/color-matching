import { RGB, RGBIndices, RGB_RED_INDEX, RGB_GREEN_INDEX, RGB_BLUE_INDEX } from "core/model";
import { findCubeDependancieNodesAt, computeNodeDistanceFromRGBValue, createCubeHookForRGBValue } from './hooking';

const worker: Worker = self as any;

worker.addEventListener('message', (event) => {
    const mapping: { reference: RGB, projection: RGB }[] = event.data.mapping;
    const cube: { colors: RGB[], size: number } = event.data.cube;

    const hooks = mapping.map(colorDistorsion => createCubeHookForRGBValue(cube)(colorDistorsion.reference, colorDistorsion.projection));
    // todo continue
});