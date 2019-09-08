import { createContext } from 'react';
import { UV } from 'core/model';

export interface Workspace {
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
}

export class ColorCheckerWidget {
    public h1: UV = { u: 0, v: 0 };
    public h2: UV = { u: 0.5, v: 0 };
    public h3: UV = { u: 0.5, v: 0.5 };
    public h4: UV = { u: 0, v: 0.5 };
}

export const WorkspaceContext = createContext<Workspace | null>(null);

export const defaultSessionContext = {
    images: [] as {
        src: string,
        workspace: Workspace,
        widgets: ColorCheckerWidget[] // (widget1 | widget2 | ...)[]
    }[],
    currentImageIndex: undefined as number | undefined
};

export const SessionContext = createContext(defaultSessionContext);