import { UV } from 'core/model';

export interface Workspace {
    x: number;
    y: number;
    scale: number;
}

export interface ColorCheckerWidget {
    handles: {h1: UV, h2: UV, h3: UV, h4: UV}
    grid: [number, number, number][][]
}

export const initialState = {
    images: [] as {
        src: string,
        width: number;
        height: number;
        workspace: Workspace,
        colorChecker: ColorCheckerWidget
    }[],
    currentImageIndex: undefined as number | undefined
};