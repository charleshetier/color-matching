import React, { createRef, useState } from 'react';
import { useDragBehavior } from 'core/hooks';
import { useCurrentImage, useDispatch, useSelector } from 'store';
import { setColorCheckerWidgetHandles } from 'commands';
import { getGridData } from './grid';

interface UV { u: number, v: number }

/**
 * The color checker widget within the image workspace
 */
export const Widget = () => {

    /** The color grid of the color checker */
    const grid = useSelector(state => state.colorCheckerReference.grid);
    const currentImage = useCurrentImage()!;
    const dispatch = useDispatch();
    const [realTimeHandles, setRealTimeHandles] = useState<typeof currentImage.colorChecker.handles & { src: string } | undefined>();

    /** The handles of the color checker */
    const handles = realTimeHandles && realTimeHandles.src === currentImage.src
        ? realTimeHandles
        : currentImage.colorChecker.handles;

    // color checker grid items data
    const items = getGridData(grid, handles);

    return <g>

        {/* Color checker items */}
        {items.map(item => <Item
            key={item.key}
            uv={item.uv}
            color={item.color}></Item>)}


        {/* Handles */}
        <Handle label="h1" uv={handles.h1}
            onDrag={uv => setRealTimeHandles({ ...handles, h1: uv, src: currentImage.src })}
            onDrop={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h1: uv })} />
        <Handle label="h2" uv={handles.h2}
            onDrag={uv => setRealTimeHandles({ ...handles, h2: uv, src: currentImage.src })}
            onDrop={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h2: uv })} />
        <Handle label="h3" uv={handles.h3}
            onDrag={uv => setRealTimeHandles({ ...handles, h3: uv, src: currentImage.src })}
            onDrop={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h3: uv })} />
        <Handle label="h4" uv={handles.h4}
            onDrag={uv => setRealTimeHandles({ ...handles, h4: uv, src: currentImage.src })}
            onDrop={uv => dispatch(setColorCheckerWidgetHandles, { ...handles, h4: uv })} />

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
    onDrag: (uv: UV) => void,
    onDrop: (uv: UV) => void
}) => {
    const currentImage = useCurrentImage();

    const ref = useDragBehavior<SVGCircleElement>(createRef(), (e, context: typeof currentImage) => {

        if (context) {
            if (!context.width || !context.height) {
                throw new Error('width or height state should be greater than 0');
            }

            (e.upEvent ? props.onDrop : props.onDrag)({
                u: props.uv.u + e.clientDelta.x / (context.width * context.workspace.scale),
                v: props.uv.v + e.clientDelta.y / (context.height * context.workspace.scale)
            });
        }

    }, [currentImage]);

    return <g className="handle">
        <circle ref={ref} className="grabme" r={8 * currentImage!.workspace.scale} cx={`${props.uv.u * 100}%`} cy={`${props.uv.v * 100}%`}></circle>
        <g className="cursor" transform={`translate(${props.uv.u * currentImage!.width * currentImage!.workspace.scale},${props.uv.v * currentImage!.height * currentImage!.workspace.scale})`}>
            <g>
                <line x1="10" x2="15"></line>
                <line x1="-10" x2="-15"></line>
                <line y1="10" y2="15"></line>
                <line y1="-10" y2="-15"></line>
            </g>
        </g>
    </g>;

};