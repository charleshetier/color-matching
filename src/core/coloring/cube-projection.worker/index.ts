import { RGB, RGBIndices, RGB_RED_INDEX, RGB_GREEN_INDEX, RGB_BLUE_INDEX } from "core/model";

const worker: Worker = self as any;

const relaxation = {
    homogeneityStrengthFactor: 0.2,
    targetStrengthFactor: 0.4
};

worker.addEventListener('message', (event) => {
    const hooks = projectWith(event.data.mapping, event.data.cube);

    // todo continue
});


export const projectWith = (
    mapping: { reference: RGB, projection: RGB }[],
    cube: { colors: RGB[], size: number }) => mapping.map(o => {

        // Fetching nodes around current reference
        const dependanciesNodes = findCubeDependancieNodesAt(cube)(o.reference);

        // Computing influence of each node toward current reference
        const dependanciesDistances = dependanciesNodes
            .map(node => Math.sqrt(
                Math.pow(node[0] / (cube.size - 1) /* = red [0...1] value from neutral cube */ - o.reference[0], 2)
                + Math.pow(node[1] / (cube.size - 1) /* = green [0...1] value from neutral cube */ - o.reference[1], 2)
                + Math.pow(node[2] / (cube.size - 1) /* = blue [0...1] value from neutral cube */ - o.reference[2], 2)
            ));

        // Case of a color exactly on a node
        // This case is important to handle to avoid division by zero!
        const distance0Index = dependanciesDistances.indexOf(0);
        if (distance0Index !== -1) {
            return {
                dependancies: [{ rgb0Indices: dependanciesNodes[distance0Index], influence: 1 }],
                target: o.projection
            }
        }

        // Computing influence on each node surronding the current hook
        const nodesInfluences = dependanciesDistances.map(distance => 1 / distance);
        const influencesSum = nodesInfluences.reduce((a, b) => a + b);
        const nodesInfluencesNormalized = nodesInfluences.map(influence => influence / influencesSum);

        // Creating color hook
        return {
            // Merging dependancies values based on current reference color
            dependancies: dependanciesNodes
                .map((rgb0Indices, i) => ({
                    rgb0Indices,
                    influence: nodesInfluencesNormalized[i]
                })),

            // Target position is projection color
            target: o.projection
        };
    });

    
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

/** Create dependancy context for the specified rgb0 (from reference data) value */
export const findCubeDependancieNodesAt = (cube: { size: number }) => (rgb0: RGB) => {
    const rgbIndex = rgb0.map(c => c * (cube.size - 1));
    const index_0 = (rgbChanel: number) => Math.floor(rgbIndex[rgbChanel]);
    const index_1 = (rgbChanel: number) => Math.floor(rgbIndex[rgbChanel] + 1);

    // Gets the nodes of the current cube surrounding the reference color value
    return [
        rgbIndex.map(Math.floor),             // 0,0,0
        [index_1(0), index_0(1), index_0(2)], // 1,0,0
        [index_0(0), index_1(1), index_0(2)], // 0,1,0
        [index_0(0), index_0(1), index_1(2)], // 0,0,1
        [index_1(0), index_1(1), index_1(2)]  // 1,1,1
    ] as RGBIndices[];
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