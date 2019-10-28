import { RGB, RGB_RED_INDEX, RGB_GREEN_INDEX, RGB_BLUE_INDEX } from 'core/model';
import { createCubeHookForRGBValue } from './hooking';
import { step } from "./relaxation";
import { Subject, timer } from "rxjs";
import { switchMap, takeUntil, map, debounceTime } from 'rxjs/operators';
import config from 'config';
import triangulate from 'delaunay-triangulate';
import { isInTetrahedron, isFlatTetrahedron } from './tetrahedron';

const worker: Worker = self as any;

const projection$ = new Subject<{
    mapping: { reference: RGB, projection: RGB }[],
    cube: { size: number, colors: RGB[] }
}>();

worker.addEventListener('message', (event) => projection$.next(event.data));


// Relaxation approach (obsolete)
// projection$.pipe(
//     map(projection => ({
//         projection,
//         hooks: projection.mapping
//             .map(colorDistorsion => createCubeHookForRGBValue(projection.cube)(
//                 colorDistorsion.reference,
//                 colorDistorsion.projection))
//     })),
//     switchMap(projectionHooks => timer(0, config.relaxation.frameDuration).pipe(
//         takeUntil(projection$),
//         map(() => projectionHooks)
//     ))
// ).subscribe(projectionHooks => {
//     step(projectionHooks.projection.cube)(projectionHooks.hooks);
//     worker.postMessage({ nodes: projectionHooks.projection.cube.colors });
// });

const distance = (p1: RGB, p2: RGB) => Math.sqrt(
    Math.pow(p1[0] - p2[0], 2)
    + Math.pow(p1[1] - p2[1], 2)
    + Math.pow(p1[2] - p2[2], 2)
);

// delaunay triangulation approach
projection$.pipe(debounceTime(500)).subscribe(projection => {
    const referencePoints = projection.mapping.map(o => o.reference);

    // As some cube points may be outside of the reference tetrahedrons, we need to add extra imaginary extremum points to the triangulation
    // TODO merge reference points to cubeVertices if needed
    const cubeVertices: RGB[] = [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]];
    //const cubeVertices: RGB[] = [[-0.1, -0.1, -0.1], [-0.1, 1.1, -0.1], [1.1, 1.1, -0.1], [1.1, -0.1, -0.1], [-0.1, -0.1, 1.1], [-0.1, 1.1, 1.1], [1.1, 1.1, 1.1], [1.1, -0.1, 1.1]];
    const finalReferencePoints: RGB[] = [...referencePoints, ...cubeVertices];

    /** The vertex indices of the tetrahedrons */
    const tetrahedrons = triangulate(finalReferencePoints)
        .filter(tetraIndices => {
            const tetraPoints = tetraIndices.map(i => finalReferencePoints[i]) as [RGB, RGB, RGB, RGB];

            return !isFlatTetrahedron(tetraPoints);
        });

    /** Projection of the cube nodes to tetra index */
    const cubeNodesDependancies = projection.cube.colors.map(node => {

        // Finding the tetrahedron in which the point is (-1 if none found)
        const tetraIndexAroundNode = tetrahedrons.findIndex(indices =>
            isInTetrahedron(indices.map(i => finalReferencePoints[i]) as [RGB, RGB, RGB, RGB], node));

        // TODO handle special case when cube node is exactly onto reference point or on face... -> will raise -1 for now...
        if (tetraIndexAroundNode !== -1)
            return tetraIndexAroundNode;

        const tetraIndexOnNode = tetrahedrons.findIndex(indices => indices
            .map(i => finalReferencePoints[i])
            .find(tetraPoint => tetraPoint[RGB_RED_INDEX] === node[RGB_RED_INDEX]
                && tetraPoint[RGB_GREEN_INDEX] === node[RGB_GREEN_INDEX]
                && tetraPoint[RGB_BLUE_INDEX] === node[RGB_BLUE_INDEX]));

        if (tetraIndexOnNode !== -1) {
            return tetraIndexOnNode; // warning, maybe -1!!
        }

        return undefined;
    });

    /** For each cube node, the weights to each vertex of the tetrahedron wrapping the cube node */
    const cubeNodeDependanciesVerticesWeights = projection.cube.colors.map((color, i) => {
        const tetrahedronIndex = cubeNodesDependancies[i];
        if (tetrahedronIndex !== undefined) {
            const distances = tetrahedrons[tetrahedronIndex]
                .map(tetraPointIndex => finalReferencePoints[tetraPointIndex])
                .map(tetraPoint => distance(color, tetraPoint));
            const distanceSum = distances.reduce((a, b) => a + b);
            return distances.map(distance => distance / distanceSum)
        }

        return undefined;
    });

    /*
        From now we are going to use the tetrahedrons with the projection points and apply eah weight 
        so that the projected cube matches the tetrahedrons applied onto projection. 
    */

    // Projection data
    const projectionPoints = projection.mapping.map(o => o.projection);
    const finalProjectionPoints = [...projectionPoints, ...cubeVertices];

    // Cube nodes projection using barycenter coordinates
    const cubeNodesProjection = cubeNodesDependancies
        .map(tetrahedronIndex => tetrahedronIndex !== undefined ? tetrahedrons[tetrahedronIndex] : undefined)
        .map((tetrahedron, i) => {

            if (tetrahedron) {
                const vertexWeights = cubeNodeDependanciesVerticesWeights[i]!;
                const tetraPoints = tetrahedron
                    .map(tetraPointIndex => finalProjectionPoints[tetraPointIndex]) as [RGB, RGB, RGB, RGB];

                return [
                    tetraPoints[0][RGB_RED_INDEX] * vertexWeights[0]
                    + tetraPoints[1][RGB_RED_INDEX] * vertexWeights[1]
                    + tetraPoints[2][RGB_RED_INDEX] * vertexWeights[2]
                    + tetraPoints[3][RGB_RED_INDEX] * vertexWeights[3],

                    tetraPoints[0][RGB_GREEN_INDEX] * vertexWeights[0]
                    + tetraPoints[1][RGB_GREEN_INDEX] * vertexWeights[1]
                    + tetraPoints[2][RGB_GREEN_INDEX] * vertexWeights[2]
                    + tetraPoints[3][RGB_GREEN_INDEX] * vertexWeights[3],

                    tetraPoints[0][RGB_BLUE_INDEX] * vertexWeights[0]
                    + tetraPoints[1][RGB_BLUE_INDEX] * vertexWeights[1]
                    + tetraPoints[2][RGB_BLUE_INDEX] * vertexWeights[2]
                    + tetraPoints[3][RGB_BLUE_INDEX] * vertexWeights[3],
                ]
            }

            // default cube value
            return projection.cube.colors[i];
        });

    // Cube nodes projection publication
    worker.postMessage({ nodes: cubeNodesProjection });
});

