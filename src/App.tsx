import React, { DragEvent } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { useDispatch, useCurrentImage } from 'store';
import { addImage, setCurrentImage } from 'commands';
import { delay } from 'core';
import { setImageDimension } from './commands/add-image.command';

const App: React.FC = () => {

  const dispatch = useDispatch();

  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    Array.from({ length: e.dataTransfer.files.length })
      .map((o, index) => e.dataTransfer.files[index])
      .forEach(async file => {
        const src = URL.createObjectURL(new Blob([file], { type: file.type }));
        dispatch(addImage, { src });

        const img = document.createElement('IMG') as HTMLImageElement;
        img.src = src;

        await delay(100);

        dispatch(setImageDimension, {
          srcRef: src, 
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      });
  }

  const currentImage = useCurrentImage();

  const backdropImage = currentImage
    ? <img alt="sample" src={currentImage.src} />
    : null;

  return (
    <div className="App"
      onDragOver={e => e.preventDefault()}
      onDrop={dropHandler}>

      <List onSelectionChange={index => dispatch(setCurrentImage, { index })}></List>
      <ViewPort>
        {backdropImage}
        <ColorChecker />
      </ViewPort>

    </div>
  );
}

export default App;
