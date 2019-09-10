import { State } from "store";
import * as actionHandlers from 'commands';
import { initialState } from "./initial-state";

export const rootReducer = (state: State = initialState, action:  { [extraprop: string]: any, type: keyof typeof actionHandlers }): State => {
    if (action.type) {
        const handler = actionHandlers[action.type];

        if (handler) {
            return handler(state, action as any) as any;
        } else if(action.type as any !== '@@INIT') {
            throw new Error(`The command ${action.type} has not been registered in commands/index.ts file`);
        }
    }

    return state;
}