import React, { DragEvent, useEffect, useContext, useMemo } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { useDispatch, useCurrentImage, useSelector, useCurrentColorCheckerSnapshot } from 'store';
import { setCurrentImage, addImage } from 'commands';
import { Properties } from 'components/properties/Properties';
import { LutContext } from 'components/context';
import { RGB } from 'core/model';

const App: React.FC = () => {

  const dispatch = useDispatch();
  const currentImage = useCurrentImage();

  // TODO enable in devmode only...
  useEffect(() => {
    dispatch(addImage, { src: './samples/sample1.jpg' })
      .then(() => dispatch(addImage, { src: './samples/sample2.jpg' }))
  }, [addImage]);

  /**
   * Handles the drop file event
   * @param e The event arguments
   */
  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    Array.from({ length: e.dataTransfer.files.length })
      .map((o, index) => e.dataTransfer.files[index])
      .forEach(async file => dispatch(addImage, { src: URL.createObjectURL(new Blob([file], { type: file.type })) }));
  }

  // cube projection
  const { cube: colorCube } = useContext(LutContext);
  const colorCheckerReference = useSelector(state => state.colorCheckerReference);
  const colorCheckerSnapshot = useCurrentColorCheckerSnapshot();
  useMemo(() => {
    if (colorCheckerSnapshot) {
      colorCube.project(colorCheckerReference.grid
        .flatMap(o => o)
        .map(reference256 => reference256.map(c => c / 255) as RGB)
        .map((reference, i) => ({
          reference,
          projection: colorCheckerSnapshot[i].color.map(c => c / 255) as RGB
        })));
    }
  }, [colorCheckerReference, colorCheckerSnapshot, colorCube])

  /** The background image element */
  const backdropImage = currentImage
    ? <img alt="sample" src={currentImage.src} />
    : null;

  // Final html rendering
  return (
    <div className="App"
      onDragOver={e => e.preventDefault()}
      onDrop={dropHandler}>

      <List onSelectionChange={index => dispatch(setCurrentImage, { index })}></List>
      <ViewPort>
        {backdropImage}
        <ColorChecker />
      </ViewPort>
      <Properties />
    </div>
  );
}

export default App;
