import React, { createRef, createContext, useContext, useState, useEffect } from 'react';
import './color-checker.scss';

const WorkspaceContext = createContext({width: 0, height:0});


export const ColorChecker = () => {
    const [dimensions, setDimensions] = useState({width: 0, height:0, outdated: true});

    const workspaceRefCallback = (element: HTMLDivElement) => {
        if(element) {
            const width = element.clientWidth;
            const height = element.clientHeight;
            if(dimensions.width !== width || dimensions.height !== height) {
                setDimensions({width, height, outdated: false});
            }
        }
    };

    useEffect(() => {
        const handler = () => setDimensions({...dimensions, outdated: true});
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [])

    return <div className="color-checker-workspace" ref={workspaceRefCallback}>
        <WorkspaceContext.Provider value={dimensions}>
            <svg>
                <ColorCheckerGrid />
            </svg>
        </WorkspaceContext.Provider>
    </div>;
}

const ColorCheckerGrid = () =>
    <g>
        <Handle u={0.3} v={0.5} />
        <Handle u={0.4} v={0.5} />
        <Handle u={0.45} v={0.8} />
        <Handle u={0.3} v={0.8} />
    </g>;

const Handle = (props: { u: number, v: number }) => {
    const workspaceContext = useContext(WorkspaceContext);
    return <circle data-w-width={workspaceContext.width} className="handle" cx={`${props.u * 100}%`} cy={`${props.v * 100}%`}></circle>;
};  