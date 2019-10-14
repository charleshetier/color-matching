import { RGB } from "core/model";
import { Subject } from "rxjs";
// eslint-disable-next-line
import CubeProjectionWorker from 'worker-loader!./cube-projection.worker';


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
    private readonly worker = new CubeProjectionWorker();
    private readonly _cubeNodes$ = new Subject<{ nodes: RGB[] }>();

    public get cubeNodes$() { return this._cubeNodes$ };

    constructor(public readonly size: number) {
        this.worker.onmessage = event => this._cubeNodes$.next(event.data);
    }

    public project(mapping: {reference: RGB, projection: RGB}[]) {
        this.worker.postMessage(mapping);
    }
}