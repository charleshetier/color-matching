import { RGB, RGB_RED_INDEX, RGB_GREEN_INDEX, RGB_BLUE_INDEX } from 'core/model';
import { Subject } from "rxjs";
import { debounceTime } from 'rxjs/operators';
import triangulate from 'delaunay-triangulate';
import { isInTetrahedron, isFlatTetrahedron, toTetrahedronBarycentersNormalizedCoordinate, Tetrahedron } from './tetrahedron';

const worker: Worker = self as any;

const projection$ = new Subject<{
    mapping: { reference: RGB, projection: RGB }[],
    cube: { size: number, colors: RGB[] }
}>();

worker.addEventListener('message', (event) => projection$.next(event.data));

// delaunay triangulation approach
projection$.pipe(debounceTime(500)).subscribe(projection => {

    const referencePoints = projection.mapping.map(o => o.reference);

    // As some cube points may be outside of the reference tetrahedrons, we need to add extra imaginary extremum points to the triangulation
    // TODO merge reference points to cubeVertices if needed
    //const cubeVertices: RGB[] = [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]];
    const cubeVertices: RGB[] = [[-0.1, -0.1, -0.1], [-0.1, 1.1, -0.1], [1.1, 1.1, -0.1], [1.1, -0.1, -0.1], [-0.1, -0.1, 1.1], [-0.1, 1.1, 1.1], [1.1, 1.1, 1.1], [1.1, -0.1, 1.1]];
    const finalReferencePoints: RGB[] = [...referencePoints, ...cubeVertices];

    /** The vertex indices of the tetrahedrons */
    const tetrahedronsIndices = triangulate(finalReferencePoints)
        .filter(indices => !isFlatTetrahedron(indices.map(i => finalReferencePoints[i]) as Tetrahedron));

    /** The tetrahedrons from reference values */
    const tetrahedrons = tetrahedronsIndices
        .map(tetraIndices => tetraIndices.map(i => finalReferencePoints[i]) as Tetrahedron);

    /** Projection of the cube nodes to tetra index */
    const cubeNodesDependancies = projection.cube.colors.map(node => {

        // Finding the tetrahedron in which the point is (-1 if none found)
        const tetraIndexAroundNode = tetrahedrons.findIndex(vertices => isInTetrahedron(vertices, node));

        // TODO handle special case when cube node is exactly onto reference point or on face... -> will raise -1 for now...
        if (tetraIndexAroundNode !== -1)
            return tetraIndexAroundNode;

        const tetraIndexOnNode = tetrahedrons.findIndex(vertices => vertices
            .find(tetraVertex => tetraVertex[RGB_RED_INDEX] === node[RGB_RED_INDEX]
                && tetraVertex[RGB_GREEN_INDEX] === node[RGB_GREEN_INDEX]
                && tetraVertex[RGB_BLUE_INDEX] === node[RGB_BLUE_INDEX]));

        if (tetraIndexOnNode !== -1) {
            return tetraIndexOnNode; // warning, maybe -1!!
        }

        return undefined;
    });

    /** For each cube node, the weights to each vertex of the tetrahedron wrapping the cube node */
    const cubeNodeDependanciesVerticesWeights = projection.cube.colors.map((color, i) => {
        const tetraIndex = cubeNodesDependancies[i];
        if (tetraIndex !== undefined) {
            return toTetrahedronBarycentersNormalizedCoordinate(tetrahedrons[tetraIndex], color)
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

    /** The tetrahedrons from reference values */
    const tetrahedronsProjection = tetrahedronsIndices
        .map(tetraIndices => tetraIndices.map(i => finalProjectionPoints[i]) as Tetrahedron);

    // Cube nodes projection using barycenter coordinates
    const cubeNodesProjection = cubeNodesDependancies
        .map(tetrahedronIndex => tetrahedronIndex !== undefined ? tetrahedronsProjection[tetrahedronIndex] : undefined)
        .map((tetrahedron, i) => {

            if (tetrahedron) {
                const vertexWeights = cubeNodeDependanciesVerticesWeights[i]!;

                return [
                    tetrahedron[0][RGB_RED_INDEX] * vertexWeights[0]
                    + tetrahedron[1][RGB_RED_INDEX] * vertexWeights[1]
                    + tetrahedron[2][RGB_RED_INDEX] * vertexWeights[2]
                    + tetrahedron[3][RGB_RED_INDEX] * vertexWeights[3],

                    tetrahedron[0][RGB_GREEN_INDEX] * vertexWeights[0]
                    + tetrahedron[1][RGB_GREEN_INDEX] * vertexWeights[1]
                    + tetrahedron[2][RGB_GREEN_INDEX] * vertexWeights[2]
                    + tetrahedron[3][RGB_GREEN_INDEX] * vertexWeights[3],

                    tetrahedron[0][RGB_BLUE_INDEX] * vertexWeights[0]
                    + tetrahedron[1][RGB_BLUE_INDEX] * vertexWeights[1]
                    + tetrahedron[2][RGB_BLUE_INDEX] * vertexWeights[2]
                    + tetrahedron[3][RGB_BLUE_INDEX] * vertexWeights[3],
                ]
            }

            // default cube value
            return projection.cube.colors[i];
        });

    // Cube nodes projection publication
    worker.postMessage({ nodes: cubeNodesProjection });
});

