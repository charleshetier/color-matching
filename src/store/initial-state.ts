import { UV } from 'core/model';
import { spyderChecker24Preset } from './color-checker-presets';

export interface Workspace {
    x: number;
    y: number;
    scale: number;
}

// export interface ColorCheckerWidget {
//     handles: {h1: UV, h2: UV, h3: UV, h4: UV}
//     grid: [number, number, number][][]
// }

export const initialState = {
    colorCheckerReference: { grid: spyderChecker24Preset },
    images: [] as {
        src: string,
        width: number;
        height: number;
        workspace: Workspace,
        colorChecker: { handles: {h1: UV, h2: UV, h3: UV, h4: UV} }
    }[],
    currentImageIndex: undefined as number | undefined
};