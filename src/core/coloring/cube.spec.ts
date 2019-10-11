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
});