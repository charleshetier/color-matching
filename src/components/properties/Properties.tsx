import React, { useEffect, useState, useMemo } from 'react';
import { useCurrentImage } from 'store';
import { getGridData } from 'components/color-checker/grid';

const ColorItem = (props: {
    colorRef: [number, number, number],
    colorSnapshot: [number, number, number]
}) => <div className="color-item">
        <div style={{ background: `rgb(${props.colorRef.join(',')})` }}></div>
        <div style={{ background: `rgb(${props.colorSnapshot.join(',')})` }}></div>
    </div>

export const Properties = () => {

    const currentImage = useCurrentImage();

    // const [snapShots, setSnapShots] = useState<[number, number, number][][] | undefined>();

    const snapshot = useMemo(() => {
        if (currentImage) {

            // Buffer Image canvas creation
            const img = document.createElement('IMG') as HTMLImageElement;
            const canvasElement = document.createElement('CANVAS') as HTMLCanvasElement;
            const canvasContext = canvasElement.getContext('2d')!;
            img.src = currentImage.src;
            canvasElement.width = currentImage.width;
            canvasElement.height = currentImage.height;
            canvasContext.drawImage(img, 0, 0);

            const items = getGridData(currentImage.colorChecker.grid, currentImage.colorChecker.handles);
            const itemsSnapshot = items.map(cell => {
                const data = canvasContext.getImageData(
                    cell.uv.u * currentImage.width,
                    cell.uv.v * currentImage.height,
                    1,
                    1).data.slice(0, 3); // TODO: extract a range of pixel instead
                const color = [data[0], data[1], data[2]] as [number, number, number];
                return { ...cell, color };
            });

            return itemsSnapshot;
        }
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
                            {row.map((item, i) => <td key={`${rowIndex} ${i}`}>
                                <ColorItem
                                    key={`ci ${rowIndex} ${i}`}
                                    colorRef={item}
                                    colorSnapshot={snapshot ? snapshot.find(o => o.row === rowIndex && o.column === i)!.color : item} />
                            </td>)}
                        </tr>)}
                </tbody>
            </table>
        </div>
    </aside>;
}