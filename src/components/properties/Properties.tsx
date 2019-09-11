import React, { useEffect } from 'react';
import { useCurrentImage } from 'store';

const ColorItem = (props: { color: [number, number, number] }) => <div className="color-item">
    <div style={{ background: `rgb(${props.color.join(',')})` }}></div>
    <div style={{ background: `rgb(${props.color.map(c => c * 0.5).join(',')})` }}></div>
</div>

export const Properties = () => {

    const currentImage = useCurrentImage();
    useEffect(() => {

    }, [currentImage]);

    if (!currentImage) return null;

    return <aside className="properties">
        <div className="content">
            <h1>Color checker</h1>
            <div>spyder Chekr 24</div>
            <table cellSpacing="0">
                <tbody>
                    {currentImage.colorChecker.grid.map((row, rowIndex) =>
                        <tr key={rowIndex}>
                            {row.map((item, i) => <td>
                                <ColorItem key={`${rowIndex} ${i}`} color={item} />
                            </td>)}
                        </tr>)}
                </tbody>
            </table>
        </div>
    </aside>;
}