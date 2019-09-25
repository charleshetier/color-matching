import React, { useMemo } from 'react';
import { useCurrentImage, useSelector, useDispatch } from 'store';
import { getGridData } from 'components/color-checker/grid';
import { resetColorCheckerGrid, setCurrentImageAsReference } from 'commands';

const ColorItem = (props: {
    colorRef: [number, number, number],
    colorSnapshot: [number, number, number]
}) => <div className="color-item">
        <div style={{ background: `rgb(${props.colorRef.join(',')})` }}></div>
        <div style={{ background: `rgb(${props.colorSnapshot.join(',')})` }}></div>
    </div>

export const Properties = () => {

    // Current image from redux store
    const currentImage = useCurrentImage();
    const colorCheckerReference = useSelector(state => state.colorCheckerReference);
    const dispatch = useDispatch();

    // Computing grid snapshot
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

            // Computing uv coordinate of each grid items
            const items = getGridData(colorCheckerReference.grid, currentImage.colorChecker.handles);

            // Color extraction from current imate at each grid item position
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
    }, [currentImage, colorCheckerReference]);

    if (!currentImage) return null;

    return <aside className="properties">
        <div className="content">
            <h1>Color checker</h1>
            <div>spyder Chekr 24</div>
            <div><button type="button" onClick={() => dispatch(resetColorCheckerGrid)}>Reset</button></div>
            <table cellSpacing="0">
                <tbody>
                    {colorCheckerReference.grid.map((row, rowIndex) =>
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
            <div>
                <button type="button" onClick={() => dispatch(setCurrentImageAsReference)}>Update color reference</button>
            </div>
            <h1>Info</h1>
            <div>blablah</div>
        </div>
    </aside>;
}