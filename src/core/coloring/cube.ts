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

    /** Provides the current hooks. */
    public getHooks() { return this.hooks; }

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

    /**
     * Updates the color RGB value at specified rgb node indices.
     * @param rIndex The red index node within the current cube
     * @param gIndex The green index node within the current cube
     * @param bIndex The blue index node within the current cube
     */
    public setColorAt(color: RGB, rIndex: number, gIndex: number, bIndex: number) {
        this.colors[rIndex + gIndex * this.size + bIndex * this.size2] = color;
    }

    /**
     * Projects the cube with specified colors mapping.
     * @param mapping The colors from reference to projection describing how the cube should be deformed
     */
    public projectWith(mapping: {
        reference: RGB,
        projection: RGB
    }[]) {

        /** Create dependancy context for the specified rgb0 (from reference data) value */
        const findNodesDependenciesFor = (rgb0: RGB) => {
            const rgbIndex = rgb0.map(c => c * (this.size - 1));
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

        this.hooks = mapping.map(o => {

            // Fetching nodes around current reference
            const dependanciesNodes = findNodesDependenciesFor(o.reference);

            // Computing influence of each node toward current reference
            const dependanciesDistances = dependanciesNodes
                .map(node => Math.sqrt(
                    Math.pow(node[0] / (this.size - 1) /* = red [0...1] value from neutral cube */ - o.reference[0], 2)
                    + Math.pow(node[1] / (this.size - 1) /* = green [0...1] value from neutral cube */ - o.reference[1], 2)
                    + Math.pow(node[2] / (this.size - 1) /* = blue [0...1] value from neutral cube */ - o.reference[2], 2)
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
    }

    /**
     * Step throught the relaxation process so that the cube matchs the hooks positions
     * @param iteration Number of relaxation iterations
     */
    public step(iteration = 1) {

        // Stretching the cube to reach hooks
        this.hooks.forEach(hook => hook.dependancies.forEach(dependancy => {
            const currentColor = this.getColorAt(...dependancy.rgb0Indices);
            const newColor = currentColor
                .map((channelValue, channel) =>
                    channelValue + (hook.target[channel] - channelValue) * this.relaxation.targetStrengthFactor) as RGB;
            this.setColorAt(newColor, ...dependancy.rgb0Indices);
        }));

        // Relaxing blue channel color backward and forward
        for (let r = 0; r < this.size; r++)
            for (let g = 0; g < this.size; g++)
                this.forwardBackwardBrowsingRange
                    .forEach(b => this.setColorAt(
                        this.relaxeColorChannelNode([r, g, b], RGB_BLUE_INDEX),
                        r, g, b));

        // Relaxing green channel color backward and forward
        for (let b = 0; b < this.size; b++)
            for (let r = 0; r < this.size; r++)
                this.forwardBackwardBrowsingRange
                    .forEach(g => this.setColorAt(
                        this.relaxeColorChannelNode([r, g, b], RGB_GREEN_INDEX),
                        r, g, b));

        // Relaxing red channel color backward and forward
        for (let g = 0; g < this.size; g++)
            for (let b = 0; b < this.size; b++)
                this.forwardBackwardBrowsingRange
                    .forEach(r => this.setColorAt(
                        this.relaxeColorChannelNode([r, g, b], RGB_RED_INDEX),
                        r, g, b));
    }

    private relaxeColorChannelNode(
        node: RGBIndices,
        channel: typeof RGB_RED_INDEX | typeof RGB_GREEN_INDEX | typeof RGB_BLUE_INDEX) {

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
            const axeChannelValue = this.getColorAt(...nodeIndicesWithChannelValue(1))[channel];
            const mirrorTargetedChannelValue = this.getColorAt(...nodeIndicesWithChannelValue(2))[channel];
            targetChannelValue = axeChannelValue - mirrorTargetedChannelValue + axeChannelValue;
        } else if (nodeChannelIndex === this.size - 1) {
            // The last node targeted value is extrapolated from the 2 previous nodes
            const axeChannelValue = this.getColorAt(...nodeIndicesWithChannelValue(this.size - 2))[channel];
            const mirrorTargetedChannelValue = this.getColorAt(...nodeIndicesWithChannelValue(this.size - 3))[channel];
            targetChannelValue = axeChannelValue + axeChannelValue - mirrorTargetedChannelValue;
        } else {
            // By default a node targeted value is between the next and previous node
            const nextValue = this.getColorAt(...nodeIndicesWithChannelValue(nodeChannelIndex + 1))[channel];
            const previousValue = this.getColorAt(...nodeIndicesWithChannelValue(nodeChannelIndex - 1))[channel];
            targetChannelValue = (nextValue + previousValue) / 2;
        }

        // Updating color value
        const actualColorValue = this.getColorAt(...node);
        const actualChannelValue = actualColorValue[channel];
        const relaxedChannelValue = actualChannelValue + (targetChannelValue - actualChannelValue) * this.relaxation.homogeneityStrengthFactor;
        const newColorValue: RGB = [
            actualColorValue[0],
            actualColorValue[1],
            relaxedChannelValue
        ];

        return newColorValue;
    };
}