import React, { useContext, createRef, useState } from 'react';
import { WorkspaceContext } from './WorkspaceContext';
import { useDragBehavior } from '../core/hooks';

interface UV { u: number, v: number }

const spyderChecker24Preset = [
    [[255, 255, 255], [0, 157, 194], [253, 131, 0], [125, 214, 199]],
    [[230, 230, 230], [223, 92, 175], [50, 86, 176], [145, 143, 205]],
    [[190, 190, 190], [256, 233, 0], [232, 87, 104], [78, 91, 46]],
    [[140, 140, 140], [199, 40, 48], [77, 44, 93], [82, 131, 177]],
    [[80, 80, 80], [88, 175, 72], [218, 221, 59], [229, 168, 149]],
    [[30, 30, 30], [0, 50, 148], [256, 181, 0], [99, 57, 45]]
] as [number, number, number][][];

export const Widget = () => {

    const [handles, setHandles] = useState({
        h1: { u: 0.1, v: 0.1 },
        h2: { u: 0.9, v: 0.1 },
        h3: { u: 0.9, v: 0.9 },
        h4: { u: 0.1, v: 0.9 }
    });

    return <g>

        {spyderChecker24Preset.flatMap((colors, row) => colors.map((color, i) => {

            const uRatio = i / (colors.length - 1);
            const vRatio = row / (spyderChecker24Preset.length - 1);

            const weight = {
                h1: { u: 1 - uRatio, v: 1 - vRatio },
                h2: { u: uRatio, v: 1 - vRatio },
                h3: { u: uRatio, v: vRatio },
                h4: { u: 1 - uRatio, v: vRatio }
            };

            const u = (handles.h1.u * weight.h1.u * weight.h1.v
                + handles.h2.u * weight.h2.u * weight.h2.v
                + handles.h3.u * weight.h3.u * weight.h3.v
                + handles.h4.u * weight.h4.u * weight.h4.v);

            const v = (handles.h1.v * weight.h1.u * weight.h1.v
                    + handles.h2.v * weight.h2.u * weight.h2.v
                    + handles.h3.v * weight.h3.u * weight.h3.v
                    + handles.h4.v * weight.h4.u * weight.h4.v);
            // const v = vRatio + 0.5 / spyderChecker24Preset.length;

            return <Item
                key={`${row.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`}
                uv={{ u, v }}
                color={color}></Item>;
        }))}


        <Handle label="h1" uv={handles.h1} onUvChange={(uv: UV) => setHandles({ ...handles, h1: uv })} />
        <Handle label="h2" uv={handles.h2} onUvChange={(uv: UV) => setHandles({ ...handles, h2: uv })} />
        <Handle label="h3" uv={handles.h3} onUvChange={(uv: UV) => setHandles({ ...handles, h3: uv })} />
        <Handle label="h4" uv={handles.h4} onUvChange={(uv: UV) => setHandles({ ...handles, h4: uv })} />
    </g>;
}

const Item = (props: {
    color: [number, number, number],
    uv: UV
}) => {

    return <circle className="item"
        fill={`rgb(${props.color.join(',')})`}
        cx={`${props.uv.u * 100}%`}
        cy={`${props.uv.v * 100}%`}></circle>;
};

const Handle = (props: {
    label: string,
    uv: UV,
    onUvChange: (uv: UV) => void
}) => {
    const workspaceContext = useContext(WorkspaceContext);

    const ref = useDragBehavior<SVGCircleElement>(createRef(), (e, context: typeof workspaceContext) => {

        props.onUvChange({
            u: props.uv.u + e.clientDelta.x / context.width,    // TODO -> widget level
            v: props.uv.v + e.clientDelta.y / context.height
        });

    }, [workspaceContext]);

    return <circle ref={ref} className="handle" cx={`${props.uv.u * 100}%`} cy={`${props.uv.v * 100}%`}></circle>;
    
};