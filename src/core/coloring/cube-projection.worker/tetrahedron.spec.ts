import 'react-app-polyfill/stable';
import { isInTetrahedron } from './tetrahedron';
import { RGB } from 'core/model';

describe('tetrahedron', () => {
    describe('pointInTetrahedron', () => {

        it('should consider the point inside the tetrahedron', () => {
            const tetra: [RGB, RGB, RGB, RGB] = [
                [-1, 1, 0],
                [1, 1, 0],
                [0, -1, 0],
                [0, 0, 1]
            ];

            const point: RGB = [0, 0, 0.5];
            expect(isInTetrahedron(tetra, point)).toBe(true);
        });

        it('should consider the point inside the tetrahedron', () => {
            const tetra: [RGB, RGB, RGB, RGB] = [
                [1, 1, 0],
                [0, 0, 1],
                [0, -1, 0],
                [-1, 1, 0]
            ];

            const point: RGB = [0, 0, 0.5];
            expect(isInTetrahedron(tetra, point)).toBe(true);
        });

        it('should consider the point inside the tetrahedron', () => {
            const tetra: [RGB, RGB, RGB, RGB] = [
                [-1, 1, 0],
                [0, -1, 0],
                [0, 0, 1],
                [1, 1, 0]
            ];

            const point: RGB = [0, 0, 0.5];
            expect(isInTetrahedron(tetra, point)).toBe(true);
        });

        it('should consider the point outside the tetrahedron when on a vertex of the tetra', () => {
            const tetra: [RGB, RGB, RGB, RGB] = [
                [-1, 1, 0],
                [1, 1, 0],
                [0, -1, 0],
                [0, 0, 1]
            ];

            const point: RGB = [0, 0, 1];
            expect(isInTetrahedron(tetra, point)).toBe(false);
        });

        it('should consider the point outside the tetrahedron', () => {
            const tetra: [RGB, RGB, RGB, RGB] = [
                [-1, 1, 0],
                [0, -1, 0],
                [0, 0, 1],
                [1, 1, 0]
            ];

            const point: RGB = [0, 0, -0.5];
            expect(isInTetrahedron(tetra, point)).toBe(false);
        });
    });
});