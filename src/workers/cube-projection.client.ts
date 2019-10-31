import CubeProjectionWorker from 'worker-loader!./cube-projection.worker';
import { RGB } from 'core/model';
import { Subject, Observable } from 'rxjs';

export class CubeProjectionClient {
    private readonly worker = new CubeProjectionWorker();
    private readonly _messages$ = new Subject<{ cube: RGB[] }>();
    
    public get cube$() { return this._messages$ as Observable<{ cube: RGB[] }> }

    public project(
        cube: { size: number, colors: RGB[] },
        mapping: { reference: RGB, projection: RGB }[]) {

        this.worker.postMessage({ mapping, cube });
    }
}