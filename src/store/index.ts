import { createStore } from 'redux';
import { initialState } from './initial-state';
import { rootReducer } from './root-reducer';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';

export type State = typeof initialState;
type ActionHandler = (state: State, payload: any) => State;

/**  The Redux store of the application. */
export const store = createStore(rootReducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

export const useDispatch = () => {
    const reduxDispatch = useReduxDispatch();
    return <THandler extends ActionHandler>(actionHandler: THandler, payload?: Parameters<THandler>[1]) => {
        const type = actionHandler.name;// Object.keys(actionHandlers).filter(key => (actionHandlers as any /* TODO fix this!*/)[key] === actionHandler);
        return reduxDispatch({ ...payload, type });
    }
}

export const useSelector = <TResult>(selector: (state: State) => TResult) => useReduxSelector(selector) as TResult;

export const useCurrentImage = () => useSelector(state => state.currentImageIndex !== undefined
    ? state.images[state.currentImageIndex]
    : undefined);