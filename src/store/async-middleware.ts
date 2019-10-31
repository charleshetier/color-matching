type Action = {
    [prop: string]: unknown,
    type: string,
    __async?: Promise<unknown>,
    result?: unknown
};

export const asyncMiddleWare = () =>
    (next: (action: Action) => Action) =>
        (action: Action) => {

            // Execution of the action
            const a = next(action);

            // Async action case
            if (a.__async instanceof Promise) {
                const promise = a.__async;

                // promise added by rootReducer is removed from action
                // TODO consider removing the _async property, maybe using metadata?
                //delete a.__async;

                promise.then(result => next({
                    ...a,
                    result,
                    type: `${a.type}-$$result`
                }));
            }

            // Action is forwarded
            return a;
        };