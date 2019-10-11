import 'react-app-polyfill/stable';
import { findCubeDependancieNodesAt, computeNodeDistanceFromRGBValue, createCubeHookForRGBValue } from './hooking';

describe('color cube hooking', () => {
    describe('findCubeDependancieNodesAt', () => {
        it('should find the dependancies for color value exactly on node', () => {
            const nodes = findCubeDependancieNodesAt({ size: 5 })([0, 0, 0]);
            expect(nodes).toHaveLength(5);
            expect(nodes).toContainEqual([1, 0, 0]);
            expect(nodes).toContainEqual([0, 1, 0]);
            expect(nodes).toContainEqual([0, 0, 1]);
            expect(nodes).toContainEqual([1, 1, 1]);
            expect(nodes).toContainEqual([0, 0, 0]);
        });
    });

    describe('computeNodeDistanceFromRGBValue', () => {
        const distance = computeNodeDistanceFromRGBValue({ size: 5 }, [0.2, 0, 0])([0, 0, 0]);
        expect(distance).toBe(0.2);
    });

    describe('createCubeHookForRGBValue', () => {
        it('should create a hook with only 0,0,0 dependancy and exclusive influence', () => {
            const hook = createCubeHookForRGBValue({ size: 5 })([0, 0, 0], [NaN, NaN, NaN]);
            expect(hook.dependancies).toHaveLength(1);
            expect(hook.dependancies[0].rgb0Indices).toEqual([0, 0, 0]);
            expect(hook.dependancies[0].influence).toBe(1);
        });

        it('should create a hook with 5 dependancies and higher inflence on 0,0,0 than other dependancies', () => {
            const hook = createCubeHookForRGBValue({ size: 5 })([0.1, 0.1, 0.1], [NaN, NaN, NaN]);
            expect(hook.dependancies).toHaveLength(5);

            const dep000 = hook.dependancies.find(d => !d.rgb0Indices.find(i => !!i))!;

            expect(hook.dependancies
                .filter(d => d !== dep000)
                .find(d => d.influence > dep000.influence)).toBeFalsy();
        });
    });
});