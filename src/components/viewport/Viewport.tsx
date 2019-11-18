import React, { createRef, useState, useEffect, useRef } from 'react';
import { useDragBehavior } from 'core/hooks';
import { useCurrentImage } from 'store';

export const ViewPort = (props: { children: any }) => {

    const [workspace, setWorkspace] = useState({
        x: 0,
        y: 0,
        viewPortWidth: 0,
        viewPortHeight: 0,
        scale: 1
    });
    const currentImage = useCurrentImage();

    const workspaceRef = useDragBehavior<HTMLDivElement>(useRef(), (e, context) => {
        setWorkspace({
            ...workspace,
            x: workspace.x + e.clientDelta.x,
            y: workspace.y + e.clientDelta.y
        })
    });

    const viewPortRef = createRef<HTMLElement>();

    const width = currentImage ? currentImage.properties.width * workspace.scale : 600;
    const height = currentImage ? currentImage.properties.height * workspace.scale : 600;

    useEffect(() => {
        if (viewPortRef.current && (viewPortRef.current.clientWidth !== workspace.viewPortWidth || viewPortRef.current.clientHeight !== workspace.viewPortHeight)) {
            setWorkspace({ ...workspace, viewPortWidth: viewPortRef.current.clientWidth, viewPortHeight: viewPortRef.current.clientHeight });
        }
    }, [viewPortRef, workspace]);

    const viewPortOrigin = {
        x: workspace.viewPortWidth / 2,
        y: workspace.viewPortHeight / 2
    };

    const workspaceStyle = {
        left: `${viewPortOrigin.x + workspace.x - width / 2}px`,
        top: `${viewPortOrigin.y + workspace.y - height / 2}px`,
        width: `${width}px`,
        height: `${height}px`
    };

    return <section ref={viewPortRef} className="viewport">
        {currentImage ? <ul className="info">
            <li style={{borderTop: 'solid 1px #555', margin: '5px 0'}}></li>
            <li>{currentImage.properties.width} x {currentImage.properties.height}</li>
            <li>{currentImage.properties.src}</li>
            <li style={{borderTop: 'solid 1px #555', margin: '5px 0'}}></li>
            <li>h1<small>uv</small> [ {currentImage.colorChecker.handles.h1.u.toFixed(2)}, {currentImage.colorChecker.handles.h1.v.toFixed(2)} ]</li>
            <li>h2<small>uv</small> [ {currentImage.colorChecker.handles.h2.u.toFixed(2)}, {currentImage.colorChecker.handles.h2.v.toFixed(2)} ]</li>
            <li>h3<small>uv</small> [ {currentImage.colorChecker.handles.h3.u.toFixed(2)}, {currentImage.colorChecker.handles.h3.v.toFixed(2)} ]</li>
            <li>h4<small>uv</small> [ {currentImage.colorChecker.handles.h4.u.toFixed(2)}, {currentImage.colorChecker.handles.h4.v.toFixed(2)} ]</li>
            <li style={{borderTop: 'solid 1px #555', margin: '5px 0'}}></li>
        </ul> : null}

        <div ref={workspaceRef as any} style={workspaceStyle} className="workspace">
            {props.children}
        </div>
    </section>
};