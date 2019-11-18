import { createStore, compose, applyMiddleware } from 'redux';
import { initialState } from './initial-state';
import { rootReducer } from './root-reducer';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { useMemo } from 'react';
import { getGridData } from 'components/color-checker/grid';
import { asyncMiddleWare } from './async-middleware';

export type State = typeof initialState;

/** The function type of a redux action */
type ActionHandler = (state: State, payload: any) => (State | Promise<State>);

/**  The Redux store of the application. */
export const store = createStore(
    rootReducer,
    compose(
        applyMiddleware(asyncMiddleWare),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()));

/** Store dispatcher */
export const useDispatch = () => {
    const reduxDispatch = useReduxDispatch();

    return useMemo(() => <THandler extends ActionHandler>(actionHandler: THandler, payload?: Parameters<THandler>[1]) => {
        const type = actionHandler.name;// Object.keys(actionHandlers).filter(key => (actionHandlers as any /* TODO fix this!*/)[key] === actionHandler);
        const newPayload = reduxDispatch({ ...payload, type });

        return (newPayload as any).__async || Promise.resolve(newPayload);
    }, [reduxDispatch]);
};

/** Store projection */
export const useSelector = <TResult>(selector: (state: State) => TResult) => useReduxSelector(selector) as TResult;

/** Provides the current image from store */
export const useCurrentImage = () => useSelector(state => state.currentImageIndex !== undefined
    ? state.images[state.currentImageIndex]
    : undefined);

/** Provides the current image colorchecker snapshot  */
export const useCurrentColorCheckerSnapshot = () => {

    // Current image from redux store
    const currentImage = useCurrentImage();
    const currentImageProperties = !currentImage ? undefined : currentImage.properties;
    const colorCheckerHandles = !currentImage ? undefined : currentImage.colorChecker.handles;
    const colorCheckerReference = useSelector(state => state.colorCheckerReference);

    // Fetching snapshot or retrieve it from memoization
    const snapshot = useMemo(() => {
        if (currentImageProperties && colorCheckerHandles) {
            // Buffer Image canvas creation
            const img = document.createElement('IMG') as HTMLImageElement;
            const canvasElement = document.createElement('CANVAS') as HTMLCanvasElement;
            const canvasContext = canvasElement.getContext('2d')!;
            img.src = currentImageProperties.src;
            canvasElement.width = currentImageProperties.width;
            canvasElement.height = currentImageProperties.height;
            canvasContext.drawImage(img, 0, 0);

            // Computing uv coordinate of each grid items
            const items = getGridData(colorCheckerReference.grid, colorCheckerHandles);

            // Color extraction from current imate at each grid item position
            const itemsSnapshot = items.map(cell => {
                const data = canvasContext.getImageData(
                    cell.uv.u * currentImageProperties.width,
                    cell.uv.v * currentImageProperties.height,
                    1,
                    1).data.slice(0, 3); // TODO: extract a range of pixel instead
                const color = [data[0], data[1], data[2]] as [number, number, number];
                return { ...cell, color };
            });

            return itemsSnapshot;
        }
    }, [currentImageProperties, colorCheckerReference, colorCheckerHandles]);

    return snapshot;
};