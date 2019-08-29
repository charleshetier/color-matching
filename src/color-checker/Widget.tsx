import React, { useContext, useDebugValue, useEffect, createRef, RefObject, useState, useRef } from 'react';
import { WorkspaceContext } from './WorkspaceContext';
import { fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, map, mergeAll, combineAll, combineLatest, tap, startWith, distinctUntilChanged } from 'rxjs/operators'

interface UV { u: number, v: number }

export const Widget = () => {

    const [handles, setHandles] = useState({
        h1: { u: 0.3, v: 0.5 },
        h2: { u: 0.4, v: 0.5 },
        h3: { u: 0.45, v: 0.8 },
        h4: { u: 0.3, v: 0.8 }
    });

    return <g>
        <Handle uv={handles.h1} onUvChange={(uv: UV) => setHandles({ ...handles, h1: uv })} />
        <Handle uv={handles.h2} onUvChange={(uv: UV) => setHandles({ ...handles, h2: uv })} />
        <Handle uv={handles.h3} onUvChange={(uv: UV) => setHandles({ ...handles, h3: uv })} />
        <Handle uv={handles.h4} onUvChange={(uv: UV) => setHandles({ ...handles, h4: uv })} />
    </g>;
}

const Handle = (props: { uv: UV, onUvChange: (uv: UV) => void }) => {
    const workspaceContext = useContext(WorkspaceContext);

    const ref = useDragBehavior<SVGCircleElement>(createRef(), (e, context: typeof workspaceContext) => {

        props.onUvChange({
            u: props.uv.u + e.clientDelta.x / context.width,
            v: props.uv.v + e.clientDelta.y / context.height
        });

    }, [workspaceContext]);

    return <circle ref={ref} className="handle" cx={`${props.uv.u * 100}%`} cy={`${props.uv.v * 100}%`}></circle>;
};


function useDragBehavior<TElement extends Element>(ref: RefObject<TElement>, handler: (param: {
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
            const mouseLeave$ = fromEvent<MouseEvent>(window, 'mouseleave');

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
    }, []);

    return ref;
}