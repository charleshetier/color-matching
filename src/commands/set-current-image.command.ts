import { State } from "store";

export const setCurrentImage = (state: State, payload: {index: number | undefined}) => ({
    ...state,
    currentImageIndex: payload.index
} as State);