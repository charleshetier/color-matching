import React, { useState, useEffect } from 'react';
import './color-checker.scss';
import { WorkspaceContext } from './WorkspaceContext';
import { Widget } from './Widget';

export const ColorChecker = () => {
    const [dimensions, setDimensions] = useState({width: 0, height:0, outdated: true});

    const workspaceRefCallback = (element: HTMLDivElement) => {
        if(element) {
            const {clientWidth: width, clientHeight: height} = element;
            if(dimensions.width !== width || dimensions.height !== height) {
                setDimensions({width, height, outdated: false});
            }
        }
    };

    useEffect(() => {
        const handler = () => setDimensions(d => ({...d, outdated: true}));
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [])

    return <div className="color-checker-workspace" ref={workspaceRefCallback}>
        <WorkspaceContext.Provider value={dimensions}>
            <svg>
                <Widget />
            </svg>
        </WorkspaceContext.Provider>
    </div>;
}