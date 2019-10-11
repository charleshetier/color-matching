import { RGBIndices, RGB, RGB_BLUE_INDEX, RGB_GREEN_INDEX, RGB_RED_INDEX } from "core/model";

type CubeHook = {
    /** The list of cube nodes the hook is dependent from */
    dependancies: {
        /** The neutral cube rgb position of the node */
        rgb0Indices: RGBIndices,

        /** Influence coeficient of the dependency */
        influence: number
    }[],

    target: RGB
};

const zeroTo = (size: number) => Array.from(Array(size).keys());

/**
 * Creates neutral cube data with specified size.
 * @param size The size of the neutral cube.
 * @returns A size x size x size length array
 */
export const createNeutralCube = (size: number) => zeroTo(size).map(b => zeroTo(size).map(g => zeroTo(size)
    .map(r => [r, g, b]))).flatMap(o => o.flatMap(o => o))
    .map(rgb => rgb.map(c => c / (size - 1)) as RGB);


export class ColorCube {

    public readonly colors: RGB[] = createNeutralCube(this.size);
    private readonly size2 = this.size * this.size;
    private readonly size3 = this.size2 * this.size;
    private readonly forwardBackwardBrowsingRange = [
        ...Array.from(Array(this.size).keys()), // forward: 0 -> size-1
        ...Array.from(Array(this.size - 1).keys()).reverse() // backward: size-2 -> 0
    ];

    /** The hooks deforming the cube */
    private hooks: CubeHook[] = [];

    private readonly relaxation = {
        homogeneityStrengthFactor: 0.2,
        targetStrengthFactor: 0.4
    };

    constructor(public readonly size: number) {
    }

    /**
     * Gets the color RGB value at specified rgb node indices.
     * @param rIndex The red index node within the current cube
     * @param gIndex The green index node within the current cube
     * @param bIndex The blue index node within the current cube
     */
    public getColorAt(rIndex: number, gIndex: number, bIndex: number) {
        // 0, 0, 0              -> 0
        // 1, 0, 0              -> 1
        // 0, 1, 0              -> size
        // 3, 1, 0              -> size+3
        // 0, 0, 1              -> size*size
        return this.colors[rIndex + gIndex * this.size + bIndex * this.size2]
    }

    // /**
    //  * Updates the color RGB value at specified rgb node indices.
    //  * @param rIndex The red index node within the current cube
    //  * @param gIndex The green index node within the current cube
    //  * @param bIndex The blue index node within the current cube
    //  */
    // public setColorAt(color: RGB, rIndex: number, gIndex: number, bIndex: number) {
    //     this.colors[rIndex + gIndex * this.size + bIndex * this.size2] = color;
    // }
}