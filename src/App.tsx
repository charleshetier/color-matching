import React, { DragEvent, useEffect, useRef } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { useDispatch, useCurrentImage } from 'store';
import { setCurrentImage, addImage } from 'commands';
import { Properties } from 'components/properties/Properties';

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
