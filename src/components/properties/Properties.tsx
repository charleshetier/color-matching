import React, { useEffect, useMemo, useContext } from 'react';
import { useCurrentImage, useSelector, useDispatch, useCurrentColorCheckerSnapshot } from 'store';
import { resetColorCheckerGrid, setCurrentImageAsReference } from 'commands';
import { saveLUT } from 'io/file-system';
import { Lut3d } from './Lut3d';
import { LutContext } from 'components/context';
import { RGB } from 'core/model';

const ColorItem = (props: {
    colorRef: [number, number, number],
    colorSnapshot: [number, number, number]
}) => <div className="color-item">
        <div style={{ background: `rgb(${props.colorRef.join(',')})` }}></div>
        <div style={{ background: `rgb(${props.colorSnapshot.join(',')})` }}></div>
    </div>

export const Properties = () => {

    // Current image from redux store
    const dispatch = useDispatch();
    const currentImage = useCurrentImage();
    const colorCheckerReference = useSelector(state => state.colorCheckerReference);
    const snapshot = useCurrentColorCheckerSnapshot();
    const { cube } = useContext(LutContext);

    // test!
    // const worker = useMemo(() => new Worker('core/coloring/cube-projection.worker'), []);
    useEffect(() => {
        if (snapshot) {
            const colorsMapping = colorCheckerReference.grid.flatMap((o, row) =>
                o.map(r => r.map(c => c/255) as RGB).map((reference, column) => {
                    const projection = snapshot.find(s => s.column === column && s.row === row)!.color.map(c => c / 255) as RGB;
                    return { projection, reference };
                }));

            // cube.projectWith(colorsMapping);
            // console.log(cube);
        }
    }, [snapshot]);

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

            <h1>3D LUT</h1>
            {/* <div><button type="button" onClick={() => cube.step()}>Update cube (relax step)</button></div> */}
            <Lut3d></Lut3d>
            <br />

            <div>Export color checker projection:</div>
            {/* <div><button type="button" onClick={async () => console.log(await dialog.showSaveDialog({}))}>Reference -> live projection mapping...</button></div> */}
            <div><button type="button" onClick={() => saveLUT(colorCheckerReference.grid.flatMap(row => row), snapshot!.map(o => o.color))}>Reference -> live projection mapping...</button></div>
            <div><button type="button">Live projection -> reference mapping...</button></div>
        </div>
    </aside>;
}