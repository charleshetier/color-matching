import 'react-app-polyfill/stable';
import { ColorCube } from './cube';

describe('color cube', () => {
    describe('node extraction', () => {

        it('should extract black node', () => {
            const cube = new ColorCube(5);
            expect(cube.getColorAt(0, 0, 0)).toEqual([0, 0, 0]);
        });

        it('should extract 2nd red node', () => {
            const cube = new ColorCube(5);
            expect(cube.getColorAt(1, 0, 0)).toEqual([1 / 4 /* size(5) -> 0, 1/4, 2/4, 3/4, 4/4 */, 0, 0]);
        });

        it('should extract 2nd green node', () => {
            const cube = new ColorCube(5);
            expect(cube.getColorAt(0, 1, 0)).toEqual([0, 1 / 4 /* size(5) -> 0, 1/4, 2/4, 3/4, 4/4 */, 0]);
        });

        it('should extract 2nd blue node', () => {
            const cube = new ColorCube(5);
            expect(cube.getColorAt(0, 0, 1)).toEqual([0, 0, 1 / 4 /* size(5) -> 0, 1/4, 2/4, 3/4, 4/4 */]);
        });

        it('should extract white node', () => {
            const cube = new ColorCube(5);
            expect(cube.getColorAt(4, 4, 4)).toEqual([1, 1, 1]);
        });
    });

    describe('hooks dependancies', () => {

        it('should create a hook', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [0, 0, 0],
                projection: [0, 0, 0]
            }]);

            expect(cube.getHooks()).toHaveLength(1);
        });

        it('should create a hook depending on 0,0,0 corner cube nodes', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [0.01, 0.01, 0.01],  // -> impacts dependancies
                projection: [0, 0, 0]           // values doesn't matter
            }]);

            const dependanciesNodes = cube.getHooks()[0].dependancies.map(d => d.rgb0Indices);
            expect(dependanciesNodes).toHaveLength(5);
            expect(dependanciesNodes).toContainEqual([0, 0, 0]);
            expect(dependanciesNodes).toContainEqual([1, 0, 0]);
            expect(dependanciesNodes).toContainEqual([0, 1, 0]);
            expect(dependanciesNodes).toContainEqual([0, 0, 1]);
            expect(dependanciesNodes).toContainEqual([1, 1, 1]);
        });

        it('should normalize influence', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [0.01, 0.01, 0.01],  // -> impacts dependancies
                projection: [0, 0, 0]           // values doesn't matter
            }]);

            const dependancies = cube.getHooks()[0].dependancies;
            const influencesSum = dependancies.map(d => d.influence).reduce((a, b) => a + b);
            expect(influencesSum).toBeGreaterThan(0.98);
            expect(influencesSum).toBeLessThan(1.02);
        });

        it('should have one influencing node', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [0, 0, 0],       // -> impacts dependancies
                projection: [0, 0, 0]       // values doesn't matter
            }]);

            const dependancies = cube.getHooks()[0].dependancies;
            expect(dependancies).toHaveLength(1);
            expect(dependancies.filter(d => d.influence === 1)).toHaveLength(1);
        });

        it('should have one influencing node', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [0, 0, 1/2],       // -> impacts dependancies
                projection: [0, 0, 0]       // values doesn't matter
            }]);

            const dependancies = cube.getHooks()[0].dependancies;
            expect(dependancies).toHaveLength(1);
            expect(dependancies.filter(d => d.influence === 1)).toHaveLength(1);
        });

        it('should have equal influence', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [1 / 8, 1 / 8, 1 / 8],       // -> impacts dependancies
                projection: [0, 0, 0]       // values doesn't matter
            }]);

            const dependancies = cube.getHooks()[0].dependancies;
            expect(dependancies[0].influence).toBe(1 / 5);
            expect(dependancies[1].influence).toBe(1 / 5);
            expect(dependancies[2].influence).toBe(1 / 5);
            expect(dependancies[3].influence).toBe(1 / 5);
            expect(dependancies[4].influence).toBe(1 / 5);
        });

        it('should have equal influence', () => {
            const cube = new ColorCube(5);
            cube.projectWith([{
                reference: [1 / 8 + 1 / 4, 1 / 8 + 1 / 4, 1 / 8],       // -> impacts dependancies
                projection: [0, 0, 0]       // values doesn't matter
            }]);

            const dependancies = cube.getHooks()[0].dependancies;
            console.log('dependancies', dependancies);
            expect(dependancies[0].influence).toBe(1 / 5);
            expect(dependancies[1].influence).toBe(1 / 5);
            expect(dependancies[2].influence).toBe(1 / 5);
            expect(dependancies[3].influence).toBe(1 / 5);
            expect(dependancies[4].influence).toBe(1 / 5);
        });
    });

    describe('relaxation', () => {

    });
}
);