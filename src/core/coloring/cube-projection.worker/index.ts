import { RGB } from "core/model";
import { createCubeHookForRGBValue } from './hooking';
import { step } from "./relaxation";
import { Subject, timer } from "rxjs";
import { switchMap, takeUntil, map } from 'rxjs/operators';
import config from 'config';
import triangulate from 'delaunay-triangulate';

const worker: Worker = self as any;

const projection$ = new Subject<{
    mapping: { reference: RGB, projection: RGB }[],
    cube: { size: number, colors: RGB[] }
}>();

projection$.pipe(
    map(projection => ({
        projection,
        hooks: projection.mapping
            .map(colorDistorsion => createCubeHookForRGBValue(projection.cube)(
                colorDistorsion.reference,
                colorDistorsion.projection))
    })),
    switchMap(projectionHooks => timer(0, config.relaxation.frameDuration).pipe(
        takeUntil(projection$),
        map(() => projectionHooks)
    ))
).subscribe(projectionHooks => {
    step(projectionHooks.projection.cube)(projectionHooks.hooks);
    worker.postMessage({ nodes: projectionHooks.projection.cube.colors });
});

worker.addEventListener('message', (event) => {

    projection$.next(event.data);
});

projection$.subscribe(projection => {
    const points = projection.mapping.map(o => o.reference);
    console.log(triangulate(points));
});


/* Algorithmes references:
- delaunay triangulation

*/

