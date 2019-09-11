import { State } from 'store';
import { UV } from 'core/model';

export const setColorCheckerWidgetHandles = (state: State, payload: {
    h1: UV,
    h2: UV,
    h3: UV,
    h4: UV
}): State => {

    if (state.currentImageIndex === undefined) return state;
    const handles = state.images[state.currentImageIndex].colorChecker;

    const handlesAreEqual = (handleA: typeof handles.h1, handleB: typeof handles.h1) => 
        handleA.u === handleB.u && handleA.v === handleB.v;

    if (handlesAreEqual(handles.h1,payload.h1)
        && handlesAreEqual(handles.h2,payload.h2)
        && handlesAreEqual(handles.h3,payload.h3)
        && handlesAreEqual(handles.h4,payload.h4)) return state;

    return {
        ...state,
        images: state.images.map((image, i) => i !== state.currentImageIndex
            ? image
            : {
                ...image,
                colorChecker: { ...payload }
            })
    }
}