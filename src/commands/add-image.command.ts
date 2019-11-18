import { State } from "store";
import config from 'config';
import { createNeutralCube } from 'core/coloring/cube-factory';
import { delay } from 'core';

/**
 * Adds an image to the store.
 * The image added is not measured yet
 * @param state 
 * @param payload 
 */
export const addImage = async (state: State, payload: { src: string }): Promise<State> => {
    const img = document.createElement('IMG') as HTMLImageElement;
    img.src = payload.src;

    await delay(100);

    return {
        ...state,
        currentImageIndex: state.images.length, // Sets the added image as selected one
        images: [...state.images, {
            properties: {
                src: payload.src,
                width: img.naturalWidth,
                height: img.naturalHeight,
            },
            workspace: { x: 0, y: 0, scale: 1 },
            colorChecker: {
                handles: {
                    h1: { u: 0, v: 0 },
                    h2: { u: 0.3, v: 0 },
                    h3: { u: 0.3, v: 0.3 },
                    h4: { u: 0, v: 0.3 }
                }
            },
            cube: {
                size: config.cube.size,
                colors: createNeutralCube(config.cube.size)
            }}]};
};