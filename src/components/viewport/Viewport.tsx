import React, { createRef, useState } from 'react';
import { useDragBehavior } from 'core/hooks';
import { useCurrentImage } from 'store';

export const ViewPort = (props: { children: any }) => {

    const [workspace, setWorkspace] = useState({ x: 0, y: 0, scale: 1 });
    const currentImage = useCurrentImage();

    const ref = useDragBehavior<HTMLDivElement>(createRef(), (e, context) => {
        setWorkspace({
            ...workspace,
            x: workspace.x + e.clientDelta.x,
            y: workspace.y + e.clientDelta.y
        })
    });

    const width = currentImage ? currentImage.width* workspace.scale : 600;
    const height = currentImage ? currentImage.height* workspace.scale : 600;

    const workspaceStyle = {
        left: `${workspace.x}px`,
        top: `${workspace.y}px`,
        width: `${width}px`,
        height: `${height}px`
    };

    return <section className="viewport">
            <div ref={ref} style={workspaceStyle} className="workspace">
                {props.children}
            </div>
        <aside className="properties">
            <div className="content">
                Hello properties
          </div>
        </aside>
    </section>
};