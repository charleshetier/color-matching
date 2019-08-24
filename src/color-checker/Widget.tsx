import React, { useContext, useDebugValue } from 'react';
import { WorkspaceContext } from './WorkspaceContext';

export const Widget = () =>
    <g>
        <Handle u={0.3} v={0.5} />
        <Handle u={0.4} v={0.5} />
        <Handle u={0.45} v={0.8} />
        <Handle u={0.3} v={0.8} />
    </g>;

const Handle = (props: { u: number, v: number }) => {
    const workspaceContext = useContext(WorkspaceContext);
    useDebugValue(workspaceContext.width);
    return <circle className="handle" cx={`${props.u * 100}%`} cy={`${props.v * 100}%`}></circle>;
};  