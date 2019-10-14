import { RGB, RGB_GREEN_INDEX, RGB_RED_INDEX, RGBIndices, RGB_BLUE_INDEX } from "core/model";
import { createCubeHookForRGBValue } from './hooking';

type Hook = ReturnType<ReturnType<typeof createCubeHookForRGBValue>>;

const relaxation = {
    homogeneityStrengthFactor: 0.1,
    targetStrengthFactor: 0.4
};


export const step = (cube: { size: number, colors: RGB[] }) => {

    const forwardBackwardBrowsingRange = [
        ...Array.from(Array(cube.size).keys()), // forward: 0 -> size-1
        ...Array.from(Array(cube.size - 1).keys()).reverse() // backward: size-2 -> 0
    ];

    return (hooks: Hook[]) => {

        // Stretching the cube to reach hooks
        hooks.forEach(stepHookConstraint(cube));

        // Relaxing blue channel color backward and forward
        for (let r = 0; r < cube.size; r++)
            for (let g = 0; g < cube.size; g++)
                forwardBackwardBrowsingRange
                    .forEach(b => setColorAt(cube)(
                        stepColorChannelNodeRelaxation(cube)([r, g, b], RGB_BLUE_INDEX),
                        r, g, b));

        // Relaxing green channel color backward and forward
        for (let b = 0; b < cube.size; b++)
            for (let r = 0; r < cube.size; r++)
                forwardBackwardBrowsingRange
                    .forEach(g => setColorAt(cube)(
                        stepColorChannelNodeRelaxation(cube)([r, g, b], RGB_GREEN_INDEX),
                        r, g, b));

        // Relaxing red channel color backward and forward
        for (let g = 0; g < cube.size; g++)
            for (let b = 0; b < cube.size; b++)
                forwardBackwardBrowsingRange
                    .forEach(r => setColorAt(cube)(
                        stepColorChannelNodeRelaxation(cube)([r, g, b], RGB_RED_INDEX),
                        r, g, b));
    };
};

export const stepHookConstraint = (cube: { size: number, colors: RGB[] }) => (hook: Hook) =>
    hook.dependancies.forEach(dependancy => {
        const currentColor = getColorAt(cube)(...dependancy.rgb0Indices);
        const newColor = currentColor
            .map((channelValue, channel) =>
                channelValue // initial value
                + (hook.target[channel] - channelValue) // gap between target and initial value
                * relaxation.targetStrengthFactor   // step ratio from config
                * dependancy.influence) as RGB; // step ratio from influence value
        setColorAt(cube)(newColor, ...dependancy.rgb0Indices);
    });

export const stepColorChannelNodeRelaxation = (cube: { colors: RGB[], size: number }) => (
    node: RGBIndices,
    channel: typeof RGB_RED_INDEX | typeof RGB_GREEN_INDEX | typeof RGB_BLUE_INDEX) => {

    const nodeIndicesWithChannelValue = (channelValue: number) => {
        const nodeProjection = [...node] as RGBIndices;
        nodeProjection[channel] = channelValue;
        return nodeProjection;
    };

    // Computing target value
    const targetChannelValue = (() => {
        const nodeChannelIndex = node[channel];
        
        if (nodeChannelIndex === 0) {
            // The first node targeted value is extrapolated from the 2 next nodes
            const axeChannelNodeIndices = [...node] as RGBIndices;
            axeChannelNodeIndices[channel] = 1;
            const axeChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(1))[channel];
            const mirrorTargetedChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(2))[channel];
            return axeChannelValue - mirrorTargetedChannelValue + axeChannelValue;
        }

        if (nodeChannelIndex === cube.size - 1) {
            // The last node targeted value is extrapolated from the 2 previous nodes
            const axeChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(cube.size - 2))[channel];
            const mirrorTargetedChannelValue = getColorAt(cube)(...nodeIndicesWithChannelValue(cube.size - 3))[channel];
            return axeChannelValue + axeChannelValue - mirrorTargetedChannelValue;
        }
       
        // By default a node targeted value is between the next and previous node
        const nextValue = getColorAt(cube)(...nodeIndicesWithChannelValue(nodeChannelIndex + 1))[channel];
        const previousValue = getColorAt(cube)(...nodeIndicesWithChannelValue(nodeChannelIndex - 1))[channel];
        return (nextValue + previousValue) / 2;

    })();

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

/**
 * Sets the color at specified node coordinate.
 */
export const setColorAt = (cube: { colors: RGB[], size: number }) => {
    const size2 = cube.size * cube.size;

    return (color: RGB, rIndex: number, gIndex: number, bIndex: number) => {
        const index = rIndex + gIndex * cube.size + bIndex * size2;
        cube.colors[index] = color;
    };
};