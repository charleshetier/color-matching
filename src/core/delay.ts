export const delay = async (timeout?: number) => new Promise(resolve => window.setTimeout(() => resolve(), timeout));