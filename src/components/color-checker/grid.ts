import { UV } from 'core/model';

/**
 * Compute the grid data
 * @param grid The color grid of the color checker
 * @param handles The handles in worspace uv coordinates of the color checker
 */
export const getGridData = (
    grid: [number, number, number][][],
    handles: { h1: UV, h2: UV, h3: UV, h4: UV }) =>

    grid.flatMap((colors, row) => colors.map((color, column) => {

        // uv coordinates of the item within colorchecker referential
        const uRatio = column / (colors.length - 1);
        const vRatio = row / (grid.length - 1);

        // uv corner ponderation
        const weight = {
            h1: { u: 1 - uRatio, v: 1 - vRatio },
            h2: { u: uRatio, v: 1 - vRatio },
            h3: { u: uRatio, v: vRatio },
            h4: { u: 1 - uRatio, v: vRatio }
        };

        // projection of the u coordinate to workspace referencial
        const u = (handles.h1.u * weight.h1.u * weight.h1.v
            + handles.h2.u * weight.h2.u * weight.h2.v
            + handles.h3.u * weight.h3.u * weight.h3.v
            + handles.h4.u * weight.h4.u * weight.h4.v);

        // projection of the v coordinate to workspace referencial
        const v = (handles.h1.v * weight.h1.u * weight.h1.v
            + handles.h2.v * weight.h2.u * weight.h2.v
            + handles.h3.v * weight.h3.u * weight.h3.v
            + handles.h4.v * weight.h4.u * weight.h4.v);

        return {
            uv: { u, v },
            color,
            row,
            key: `${row.toString().padStart(2, '0')}${column.toString().padStart(2, '0')}`
        };
    }));