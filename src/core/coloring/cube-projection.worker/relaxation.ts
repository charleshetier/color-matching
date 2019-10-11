import { RGB, RGB_GREEN_INDEX, RGB_RED_INDEX, RGBIndices, RGB_BLUE_INDEX } from "core/model";
import { createCubeHookForRGBValue } from './hooking';

const relaxation = {
    homogeneityStrengthFactor: 0.2,
    targetStrengthFactor: 0.4
};

export const step = (cube: { size: number, colors: RGB[] }) => {

    const forwardBackwardBrowsingRange = [
        ...Array.from(Array(cube.size).keys()), // forward: 0 -> size-1
        ...Array.from(Array(cube.size - 1).keys()).reverse() // backward: size-2 -> 0
    ];

    return (hooks: ReturnType<ReturnType<typeof createCubeHookForRGBValue>>[]) => {

        // Stretching the cube to reach hooks
        hooks.forEach(hook => hook.dependancies.forEach(dependancy => {
            const currentColor = getColorAt(cube)(...dependancy.rgb0Indices);
            const newColor = currentColor
                .map((channelValue, channel) =>
                    channelValue + (hook.target[channel] - channelValue) * relaxation.targetStrengthFactor) as RGB;
            //this.setColorAt(newColor, ...dependancy.rgb0Indices);
        }));

        // Relaxing blue channel color backward and forward
        for (let r = 0; r < cube.size; r++)
            for (let g = 0; g < cube.size; g++)
                forwardBackwardBrowsingRange
                    .forEach(b => setColorAt(
                        relaxeColorChannelNode(cube)([r, g, b], RGB_BLUE_INDEX),
                        r, g, b));

        // Relaxing green channel color backward and forward
        for (let b = 0; b < cube.size; b++)
            for (let r = 0; r < cube.size; r++)
                forwardBackwardBrowsingRange
                    .forEach(g => setColorAt(
                        relaxeColorChannelNode(cube)([r, g, b], RGB_GREEN_INDEX),
                        r, g, b));

        // Relaxing red channel color backward and forward
        for (let g = 0; g < cube.size; g++)
            for (let b = 0; b < cube.size; b++)
                forwardBackwardBrowsingRange
                    .forEach(r => setColorAt(
                        relaxeColorChannelNode(cube)([r, g, b], RGB_RED_INDEX),
                        r, g, b));
    };
};

export const relaxeColorChannelNode = (cube: { colors: RGB[], size: number }) => (
    node: RGBIndices,
    channel: typeof RGB_RED_INDEX | typeof RGB_GREEN_INDEX | typeof RGB_BLUE_INDEX) => {

    const nodeIndicesWithChannelValue = (channelValue: number) => {
        const nodeProjection = [...node] as RGBIndices;
        nodeProjection[channel] = channelValue;
        return nodeProjection;
    };

    // Computing target value
    let targetChannelValue = NaN;
    const nodeChannelIndex = node[channel];
    if (nodeChannelIndex === 0) {
        // The first node targeted value is extrapolated from the 2 next nodes
        const axeChannelNodeIndices = [...node] as RGBIndices;
        axeChannelNodeIndices[channel] = 1;
        const axeChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(1))[channel];
        const mirrorTargetedChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(2))[channel];
        targetChannelValue = axeChannelValue - mirrorTargetedChannelValue + axeChannelValue;
    } else if (nodeChannelIndex === cube.size - 1) {
        // The last node targeted value is extrapolated from the 2 previous nodes
        const axeChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(cube.size - 2))[channel];
        const mirrorTargetedChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(cube.size - 3))[channel];
        targetChannelValue = axeChannelValue + axeChannelValue - mirrorTargetedChannelValue;
    } else {
        // By default a node targeted value is between the next and previous node
        const nextValue = getColorAt(cube)(...nodeIndicesWithChannelValue(nodeChannelIndex + 1))[channel];
        const previousValue = getColorAt(cube)(...nodeIndicesWithChannelValue(nodeChannelIndex - 1))[channel];
        targetChannelValue = (nextValue + previousValue) / 2;
    }

    // Updating color value
    const actualColorValue = getColorAt(cube)(...node);
    const actualChannelValue = actualColorValue[channel];
    const relaxedChannelValue = actualChannelValue + (targetChannelValue - actualChannelValue) * relaxation.homogeneityStrengthFactor;
    const newColorValue: RGB = [
        actualColorValue[0],
        actualColorValue[1],
        relaxedChannelValue
    ];

    return newColorValue;
};

/**
 * Gets the color RGB value at specified rgb node indices.
 * @param rIndex The red index node within the current cube
 * @param gIndex The green index node within the current cube
 * @param bIndex The blue index node within the current cube
 */
export const getColorAt = (cube: { colors: RGB[], size: number }) => {
    const size2 = cube.size * cube.size;
    return (rIndex: number, gIndex: number, bIndex: number) => {
        // 0, 0, 0              -> 0
        // 1, 0, 0              -> 1
        // 0, 1, 0              -> size
        // 3, 1, 0              -> size+3
        // 0, 0, 1              -> size*size
        return cube.colors[rIndex + gIndex * cube.size + bIndex * size2]
    }
}

const setColorAt = (...args: any[]) => {};