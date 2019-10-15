import 'react-app-polyfill/stable';

import { getColorAt, setColorAt, stepHookConstraint, stepColorChannelNodeRelaxation } from './relaxation';
import { RGB_RED_INDEX, RGB_BLUE_INDEX, RGB_GREEN_INDEX } from 'core/model';
import { createNeutralCube } from '../cube-factory';

describe('cube relaxation', () => {
    describe('getColorAt', () => {
        it('should get color at 0,0,0', () => {
            const color = getColorAt({ size: 5, colors: createNeutralCube(5) })(0, 0, 0);
            expect(color).toEqual([0, 0, 0]);
        })

        it('should get white color at white index', () => {
            const color = getColorAt({ size: 5, colors: createNeutralCube(5) })(4, 4, 4);
            expect(color).toEqual([1, 1, 1]);
        })
    });

    describe('setColorAt', () => {
        it('should set white color at 0,0,0', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            setColorAt(cube)([1, 1, 1], 0, 0, 0);
            expect(cube.colors[0]).toEqual([1, 1, 1]);
        });

        it('should set red at 0,1,0', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            setColorAt(cube)([1, 0, 0], 0, 1, 0);
            expect(getColorAt(cube)(0, 1, 0)).toEqual([1, 0, 0]);
        })
    });

    describe('stepHookConstraint', () => {
        it('should do nothing when hook has same reference and target value', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            stepHookConstraint(cube)({
                dependancies: [{
                    rgb0Indices: [0, 0, 0],
                    influence: 1
                }],
                target: [0, 0, 0]
            });

            expect(cube.colors).toEqual(createNeutralCube(5));
        });

        it('should do nothing when hook dependancy has no influence', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            stepHookConstraint(cube)({
                dependancies: [{
                    rgb0Indices: [0, 0, 0],
                    influence: 0
                }],
                target: [1, 0, 0]
            });

            expect(cube.colors).toEqual(createNeutralCube(5));
        });

        it('should move the unique hooked node', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            stepHookConstraint(cube)({
                dependancies: [{
                    rgb0Indices: [0, 0, 0],
                    influence: 1
                }],
                target: [1, 0, 0]
            });

            expect(cube.colors[0][RGB_RED_INDEX]).toBeGreaterThan(0);   // Only red channel should be increased
            expect(cube.colors[0][RGB_GREEN_INDEX]).toBe(0);    // nothing should have changed
            expect(cube.colors[0][RGB_BLUE_INDEX]).toBe(0);     // nothing should have changed
            expect(cube.colors.slice(1, cube.colors.length - 1))
                .toEqual(createNeutralCube(5).slice(1, cube.colors.length - 1));
        });
    });

    describe('stepColorChannelNodeRelaxation', () => {
        it('should keep the neutral cube without any change', () => {
            const cube = { size: 5, colors: createNeutralCube(5) };
            
            const initialColor = getColorAt(cube)(0, 0, 0);
            const newColor = stepColorChannelNodeRelaxation(cube)([0, 0, 0], RGB_BLUE_INDEX);
            expect(newColor).toEqual(initialColor);
        });
    });
});