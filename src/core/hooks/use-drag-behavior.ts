import { BehaviorSubject, fromEvent, merge, Observable, OperatorFunction, MonoTypeOperatorFunction, noop } from "rxjs";
import { RefObject, useRef, useEffect } from 'react';
import { switchMap, combineLatest, distinctUntilChanged, map, tap, takeWhile } from 'rxjs/operators';
import { takeWhileInclusive } from 'core/rxjs/operators';

/**  The generic drag and drop handler paramater. */
interface GenericDragDropHandlerParams {
    moveEvent?: MouseEvent;
    downEvent: MouseEvent;
    upEvent?: MouseEvent;
    bounds: DOMRect | ClientRect;
    clientDeltaInit: { x: number, y: number };
    clientDelta: { x: number, y: number };
}

/** The handler parameter for drag case. */
interface DragHandlerParams {
    moveEvent: MouseEvent;
    downEvent: MouseEvent;
    bounds: DOMRect | ClientRect;
    clientDeltaInit: { x: number, y: number };
    clientDelta: { x: number, y: number };
}

/** The handler parameter for drop case. */
interface DropHandlerParams {
    downEvent: MouseEvent;
    upEvent: MouseEvent;
    bounds: DOMRect | ClientRect;
    clientDeltaInit: { x: number, y: number };
    clientDelta: { x: number, y: number };
}

export function useDragBehavior<TElement extends Element>(
    ref: RefObject<TElement>,
    handler:
        ((param: GenericDragDropHandlerParams, context?: any) => void)
        | {
            onDrag?: (param: DragHandlerParams, context?: any) => void,
            onDrop?: (param: DropHandlerParams, context?: any) => void
        },
    dependancies: any[] = []) {

    const { current: context$ } = useRef(new BehaviorSubject<any>(dependancies[0]));
    const { current: handler$ } = useRef(new BehaviorSubject(handler));
    context$.next(dependancies[0]);
    handler$.next(handler);

    useEffect(() => {

        if (ref.current) {
            const element = ref.current;
            const mouseConstraintsPipe = tap((e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            })
            const mouseDown$ = fromEvent<MouseEvent>(element, 'mousedown').pipe(mouseConstraintsPipe);
            const mouseUp$ = fromEvent<MouseEvent>(window, 'mouseup').pipe(mouseConstraintsPipe);
            const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(mouseConstraintsPipe);
            //const mouseLeave$ = fromEvent<MouseEvent>(window, 'mouseleave').pipe(mouseConstraintsPipe);

            // Creation of the mouse event stream
            mouseDown$.pipe(
                map(downEvent => ({
                    downEvent,
                    boundsInit: element.getBoundingClientRect()
                })),
                switchMap(downEventContext => merge(
                    mouseMove$.pipe(map(moveEvent => ({ moveEvent }))),
                    mouseUp$.pipe(map(upEvent => ({ upEvent })))).pipe(
                        combineLatest([context$.pipe(distinctUntilChanged())]),
                        map(o => ({
                            events: o[0] as { moveEvent?: MouseEvent, upEvent?: MouseEvent },
                            context: o[1]
                        })),
                        map(o => ({
                            ...o.events,
                            ...downEventContext,
                            bounds: element.getBoundingClientRect(),
                            context: o.context
                        })),
                        takeWhileInclusive(o => !o.upEvent)    // TODO understand why 2 mouseup are going through (even context$ updated shoudl allow the twice one to pass)
                    ))
            ).subscribe(o => {

                /** Creates the whole generic callback value. */
                const callbackValueFactory = () => ({
                    ...o,
                    clientDeltaInit: {
                        x: o.downEvent.clientX - o.bounds.left,
                        y: o.downEvent.clientY - o.bounds.top
                    },
                    clientDelta: {
                        x: (o.moveEvent || o.upEvent)!.clientX - o.bounds.left + o.boundsInit.left - o.downEvent.clientX,
                        y: (o.moveEvent || o.upEvent)!.clientY - o.bounds.top + o.boundsInit.top - o.downEvent.clientY
                    }
                });

                switch (typeof handler$.value) {

                    // The handler is a generic function receiving drag and drop events data
                    case 'function':
                        handler$.value(callbackValueFactory(), o.context);
                        break;

                    // There are specific handler depending on the nature of the event (drag, drop...) 
                    default:
                        if (o.moveEvent && handler$.value.onDrag) { // Drag handler management
                            handler$.value.onDrag(callbackValueFactory() as ReturnType<typeof callbackValueFactory> & { moveEvent: MouseEvent })
                        } else if (o.upEvent && handler$.value.onDrop) { // Drop handler management
                            handler$.value.onDrop(callbackValueFactory() as ReturnType<typeof callbackValueFactory> & { upEvent: MouseEvent })
                        }
                        break;
                }
            });
        }
        // eslint-disable-next-line
    }, [context$, handler$]);

    // Returning the ref element for inline hook use purpose
    return ref;
}