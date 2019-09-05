import React, { createRef, useState } from 'react';
import { useDragBehavior } from 'core/hooks';
import { WorkspaceContext } from 'context';

export const ViewPort = (props: { children: any }) => {

    const [workspace, setWorkspace] = useState({ x: 0, y: 0, width: 568, height: 379, scale: 1 });

    const ref = useDragBehavior<HTMLDivElement>(createRef(), (e, context) => {
        setWorkspace({
            ...workspace,
            x: workspace.x + e.clientDelta.x,
            y: workspace.y + e.clientDelta.y
        })
    });

    const workspaceStyle = {
        left: `${workspace.x}px`,
        top: `${workspace.y}px`,
        width: `${workspace.width * workspace.scale}px`,
        height: `${workspace.height * workspace.scale}px`
    };

    return <section className="viewport">
        <WorkspaceContext.Provider value={workspace}>
            <div ref={ref} style={workspaceStyle} className="workspace">
                {props.children}
            </div>
        </WorkspaceContext.Provider>
        <aside className="properties">
            <div className="content">
                Hello properties
          </div>
        </aside>
    </section>
};