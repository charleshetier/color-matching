import { State } from "store";

/** The preset of the color grid of the spyderCheckr24 color checker  */
export const spyderChecker24Preset = [
    [[255, 255, 255], [0, 157, 194], [253, 131, 0], [125, 214, 199]],
    [[230, 230, 230], [223, 92, 175], [50, 86, 176], [145, 143, 205]],
    [[190, 190, 190], [256, 233, 0], [232, 87, 104], [78, 91, 46]],
    [[140, 140, 140], [199, 40, 48], [77, 44, 93], [82, 131, 177]],
    [[80, 80, 80], [88, 175, 72], [218, 221, 59], [229, 168, 149]],
    [[30, 30, 30], [0, 50, 148], [256, 181, 0], [99, 57, 45]]
] as [number, number, number][][];

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
            },
            grid: spyderChecker24Preset
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