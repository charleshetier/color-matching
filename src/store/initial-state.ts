import { UV, RGB } from 'core/model';
import { spyderChecker24Preset } from './color-checker-presets';

export interface Workspace {
    x: number;
    y: number;
    scale: number;
}

/**
 * The initial redux state.
 */
export const initialState = {
    colorCheckerReference: { grid: spyderChecker24Preset },
    images: [] as {
        properties: {
            src: string,
            width: number,
            height: number
        },
        workspace: Workspace,
        colorChecker: { handles: {h1: UV, h2: UV, h3: UV, h4: UV} },
        cube: {
            size: number,
            colors: RGB[]
        }
    }[],
    currentImageIndex: undefined as number | undefined
};