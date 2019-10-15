import { RGB } from "core/model";

const zeroTo = (size: number) => Array.from(Array(size).keys());

/**
 * Creates neutral cube data with specified size.
 * @param size The size of the neutral cube.
 * @returns A size x size x size length array
 */
export const createNeutralCube = (size: number) => zeroTo(size).map(b => zeroTo(size).map(g => zeroTo(size)
    .map(r => [r, g, b]))).flatMap(o => o.flatMap(o => o))
    .map(rgb => rgb.map(c => c / (size - 1)) as RGB);