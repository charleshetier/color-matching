import { State } from "store";
import { RGB } from "core/model";
import { cubeProjectionWorker as worker } from "workers";
import { Subject } from "rxjs";
import { filter, map, take } from "rxjs/operators";

const workerMessages$ = new Subject<{ nodes: RGB[], token: number }>();
worker.onmessage = event => workerMessages$.next(event.data);

export const projectCube = (state: State, payload: {
    /** The color projection of the color checker grid reference */
    projection: RGB[]
}): Promise<State> | State => {

    if (typeof state.currentImageIndex === 'number') {
        const currentImage = state.images[state.currentImageIndex];
        const cube = { size: currentImage.cube.size };
        const mapping = state.colorCheckerReference.grid
            .flatMap(o => o)
            .map(reference256 => reference256.map(c => c / 255) as RGB)
            .map((reference, i) => ({
                reference,
                projection: payload.projection[i].map(c => c / 255) as RGB
            }));


        const token = new Date().valueOf(); // corelation id to use for the response
        worker.postMessage({ mapping, cube, token });
        const asyncResult = workerMessages$.pipe( // TODO add a timeout behavior
            filter(message => message.token === token),
            map(message => ({
                ...state,
                images: state.images.map(image => image !== currentImage ? image : {
                    ...image,
                    cube: {
                        ...image.cube,
                        colors: message.nodes   // <- updated state value!
                    }
                })
            })),
            take(1)
        ).toPromise();

        return asyncResult;
    }

    // Fallback behavior, nothing done! 
    // console.warn('no image selected. Unable to project the cube');
    return state;
}