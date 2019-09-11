import React, { DragEvent } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { useDispatch, useCurrentImage } from 'store';
import { addImageAsync, addImageCompleted, setCurrentImage } from 'commands';
import { delay } from 'core';

const App: React.FC = () => {

  const dispatch = useDispatch();
  const currentImage = useCurrentImage();

  const addImage = async (src: string) => {
    dispatch(addImageAsync, { src });

    const img = document.createElement('IMG') as HTMLImageElement;
    img.src = src;

    await delay(10);

    dispatch(addImageCompleted, {
      srcRef: src, 
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  }

  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    Array.from({ length: e.dataTransfer.files.length })
      .map((o, index) => e.dataTransfer.files[index])
      .forEach(async file => addImage(URL.createObjectURL(new Blob([file], { type: file.type }))));
  }


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
