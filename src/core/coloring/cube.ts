import { RGB } from "core/model";
import { Subject } from "rxjs";
import { createNeutralCube } from "./cube-factory";
// eslint-disable-next-line
import CubeProjectionWorker from 'worker-loader!./cube-projection.worker';


export class ColorCube {

    public readonly colors: RGB[] = createNeutralCube(this.size);
    private readonly worker = new CubeProjectionWorker();
    private readonly _cubeNodes$ = new Subject<{ nodes: RGB[] }>();

    public get cubeNodes$() { return this._cubeNodes$ };

    constructor(public readonly size: number) {
        this.worker.onmessage = event => this._cubeNodes$.next(event.data);
    }

    public project(mapping: {reference: RGB, projection: RGB}[]) {
        this.worker.postMessage({mapping, cube: {size: this.size, colors: this.colors}});
    }
}