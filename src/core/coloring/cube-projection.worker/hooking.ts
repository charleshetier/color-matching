import { RGB, RGBIndices } from "core/model";

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

export const computeNodeDistanceFromRGBValue = (cube: { size: number }, rgb: RGB) => {
    const cubeMaxIndice = cube.size - 1;

    return (node: RGBIndices) => Math.sqrt(
        Math.pow(node[0] / cubeMaxIndice /* = red [0...1] value from neutral cube */ - rgb[0], 2)
        + Math.pow(node[1] / cubeMaxIndice /* = green [0...1] value from neutral cube */ - rgb[1], 2)
        + Math.pow(node[2] / cubeMaxIndice /* = blue [0...1] value from neutral cube */ - rgb[2], 2)
    );
};

export const createCubeHookForRGBValue = (cube: { size: number }) => (rgbSource: RGB, target: RGB) => {

    // Fetching nodes around current reference RGB value
    const dependanciesNodes = findCubeDependancieNodesAt(cube)(rgbSource);

    // Computing nodes distances from current reference RGB value
    const dependanciesDistances = dependanciesNodes.map(computeNodeDistanceFromRGBValue(cube, rgbSource));

    // Case of a color exactly on a node
    // This case is important to handle to avoid division by zero!
    const distance0Index = dependanciesDistances.indexOf(0);
    if (distance0Index !== -1) {
        return {
            dependancies: [{ rgb0Indices: dependanciesNodes[distance0Index], influence: 1 }],
            target
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
        target
    };
};