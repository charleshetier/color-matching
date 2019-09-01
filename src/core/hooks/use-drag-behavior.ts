import { BehaviorSubject, fromEvent } from "rxjs";
import {RefObject, useRef, useEffect} from 'react';
import { switchMap, combineLatest, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';

export function useDragBehavior<TElement extends Element>(ref: RefObject<TElement>, handler: (param: {
    moveEvent: MouseEvent,
    downEvent: MouseEvent,
    bounds: DOMRect | ClientRect,
    clientDeltaInit: { x: number, y: number },
    clientDelta: { x: number, y: number },
}, context?: any) => void, dependancies: any[] = []) {

    const {current: context$} = useRef(new BehaviorSubject<any>(dependancies[0]));
    const {current: handler$} = useRef(new BehaviorSubject(handler));
    context$.next(dependancies[0]);
    handler$.next(handler);

    useEffect(() => {
        
        if (ref.current) {
            const element = ref.current;
            const mouseDown$ = fromEvent<MouseEvent>(element, 'mousedown');
            const mouseUp$ = fromEvent<MouseEvent>(window, 'mouseup');
            const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove');
            //const mouseLeave$ = fromEvent<MouseEvent>(window, 'mouseleave');

            mouseDown$.pipe(
                switchMap(downEvent => mouseMove$.pipe(
                    combineLatest([context$.pipe(distinctUntilChanged())]),
                    takeUntil(mouseUp$),
                    map(all => ({ moveEvent: all[0], context: all[1] })),
                    map(all => ({
                        moveEvent: all.moveEvent,
                        downEvent,
                        bounds: element.getBoundingClientRect(),
                        context: all.context
                    }))
                ))
            ).subscribe(o => handler$.value(({
                ...o,
                clientDeltaInit: {
                    x: o.downEvent.clientX - o.bounds.left,
                    y: o.downEvent.clientY - o.bounds.top
                },
                clientDelta: {
                    x: o.moveEvent.clientX - o.bounds.left,
                    y: o.moveEvent.clientY - o.bounds.top
                }
            }), o.context));
        }
    // eslint-disable-next-line
    }, [context$, handler$]);

    return ref;
}