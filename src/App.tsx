import React, { DragEvent, useEffect, useRef } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { useDispatch, useCurrentImage } from 'store';
import { addImageAsync, addImageCompleted, setCurrentImage } from 'commands';
import { delay } from 'core';
import { Properties } from 'components/properties/Properties';

const App: React.FC = () => {

  const dispatch = useDispatch();
  const currentImage = useCurrentImage();

  /**
  * Handles the set of commands for adding a new image in the current session
  * @param src The source of the image to add
  */
 // TODO: trouver un moyen propre de déclarer cette fonction
  const { current: addImage } = useRef(
    async (src: string) => {
      dispatch(addImageAsync, { src });

      const img = document.createElement('IMG') as HTMLImageElement;
      img.src = src;

      await delay(100);

      dispatch(addImageCompleted, {
        srcRef: src,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    });

  // TODO enable in devmode only...
  useEffect(() => {
    addImage('./samples/sample1.jpg')
      .then(() => addImage('./samples/sample2.jpg'));
  }, [addImage]);

  /**
   * Handles the drop file event
   * @param e The event arguments
   */
  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    Array.from({ length: e.dataTransfer.files.length })
      .map((o, index) => e.dataTransfer.files[index])
      .forEach(async file => addImage(URL.createObjectURL(new Blob([file], { type: file.type }))));
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
