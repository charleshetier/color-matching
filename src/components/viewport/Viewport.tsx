import React, { createRef, useState, useEffect } from 'react';
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

    const workspaceRef = useDragBehavior<HTMLDivElement>(createRef(), (e, context) => {
        setWorkspace({
            ...workspace,
            x: workspace.x + e.clientDelta.x,
            y: workspace.y + e.clientDelta.y
        })
    });

    const viewPortRef = createRef<HTMLElement>();

    const width = currentImage ? currentImage.width * workspace.scale : 600;
    const height = currentImage ? currentImage.height * workspace.scale : 600;

    useEffect(() => {
        if(viewPortRef.current && (viewPortRef.current.clientWidth !== workspace.viewPortWidth || viewPortRef.current.clientHeight !== workspace.viewPortHeight)) {
            setWorkspace({...workspace, viewPortWidth: viewPortRef.current.clientWidth, viewPortHeight: viewPortRef.current.clientHeight});
        } 
    }, /*[viewPortRef]*/);

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
        <div ref={workspaceRef} style={workspaceStyle} className="workspace">
            {props.children}
        </div>
        <aside className="properties">
            <div className="content">
                Hello properties
                </div>
        </aside>
    </section>
};