import { State } from "store";

/**
 * Adds an image to the store.
 * The image added is not measured yet
 * @param state 
 * @param payload 
 */
export const addImageAsync = (state: State, payload: { src: string }): State => ({
    ...state,
    currentImageIndex: state.images.length, // Sets the added image as selected one
    images: [...state.images, {
        src: payload.src,
        width: 0,
        height: 0,
        workspace: { x: 0, y: 0, scale: 1 },
        colorChecker: {
            handles: {
                h1: { u: 0, v: 0 },
                h2: { u: 0.3, v: 0 },
                h3: { u: 0.3, v: 0.3 },
                h4: { u: 0, v: 0.3 }
            }
        }
    }]
});

/**
 * Finalize the add image process by measuring the image and pushing values to the store.
 * @param state 
 * @param payload 
 */
export const addImageCompleted = (state: State, payload: {
    srcRef: string, // TODO -> use middleware to ensure continuation of add image!
    width: number,
    height: number
}): State => {
    return {
        ...state,
        images: state.images
            .map(image => image.src !== payload.srcRef
                ? image
                : {
                    ...image,
                    width: payload.width,
                    height: payload.height
                })
    }
};