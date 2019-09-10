import React from 'react';
import './color-checker.scss';
import { Widget } from './Widget';
import { useCurrentImage } from 'store';

export const ColorChecker = () => {

    const currentImage = useCurrentImage();

    return <div className="color-checker-workspace">
        <svg>
            {currentImage ? <Widget /> : null}
        </svg>
    </div>;
}