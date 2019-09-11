import React, { createRef } from 'react';
import { useDragBehavior } from 'core/hooks';
import { useCurrentImage, useDispatch } from 'store';
import { setColorCheckerWidgetHandles } from 'commands';
import { getGridData } from './grid';

interface UV { u: number, v: number }

/**
 * The color checker widget within the image workspace
 */
export const Widget = () => {

    // hooks
    const currentImage = useCurrentImage()!;
    const dispatch = useDispatch();

    /** The handles of the color checker */
    const handles = currentImage.colorChecker.handles;

    /** The color grid of the color checker */
    const grid = currentImage.colorChecker.grid;

    // color checker grid items data
    const items = getGridData(grid, handles);

    return <g>

        {/* Color checker items */}
        {items.map(item => <Item
            key={item.key}
            uv={item.uv}
            color={item.color}></Item>)}


        {/* Handles */}
        <Handle label="h1" uv={handles.h1} onMove={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h1: uv })} />
        <Handle label="h2" uv={handles.h2} onMove={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h2: uv })} />
        <Handle label="h3" uv={handles.h3} onMove={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h3: uv })} />
        <Handle label="h4" uv={handles.h4} onMove={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h4: uv })} />

        {/* Grid Lines */}
    </g>;
}

const Item = (props: {
    color: [number, number, number],
    uv: UV
}) => {

    const currentImage = useCurrentImage();

    return <circle className="item"
        r={5 * currentImage!.workspace.scale}
        fill={`rgb(${props.color.join(',')})`}
        cx={`${props.uv.u * 100}%`}
        cy={`${props.uv.v * 100}%`}></circle>;
};

const Handle = (props: {
    label: string,
    uv: UV,
    onMove: (uv: UV) => void
}) => {
    const currentImage = useCurrentImage();

    const ref = useDragBehavior<SVGCircleElement>(createRef(), (e, context: typeof currentImage) => {

        if (context) {
            if(!context.width || !context.height) {
                throw new Error('width or height state should be greater than 0');
            }

            props.onMove({
                u: props.uv.u + e.clientDelta.x / (context.width * context.workspace.scale),
                v: props.uv.v + e.clientDelta.y / (context.height * context.workspace.scale)
            });
        }

    }, [currentImage]);

    return <circle ref={ref} className="handle" r={8 * currentImage!.workspace.scale} cx={`${props.uv.u * 100}%`} cy={`${props.uv.v * 100}%`}></circle>;

};