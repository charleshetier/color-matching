import { State } from "store";
import * as actionHandlers from 'commands';
import { initialState } from "./initial-state";

export const rootReducer = (
    state: State = initialState,
    action: { [extraprop: string]: unknown, type: keyof typeof actionHandlers }): State => {
        
    if (action.type) {

        // Case of an async action result (async-middleware convention)
        if (action.type.endsWith('-$$result')) {
            if (action.result !== undefined) {
                return action.result as any;
            }

            throw new Error("a *-$$result action should contain a result property with the result of the promise");
        }

        const handler = actionHandlers[action.type];

        if (handler) {
            const result = handler(state, action as any) as any;

            // Async action case (async-middleware convention)
            if (result instanceof Promise) {
                action.__async = result;
                return state;
            }

            return result;
        }

        if (!action.type.startsWith('@@')) {
            throw new Error(`The command ${action.type} has not been registered in commands/index.ts file`);
        }
    }

    return state;
}