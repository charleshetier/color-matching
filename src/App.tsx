import React, { useState, DragEvent } from 'react';
import './App.scss';
import { ColorChecker, ViewPort, List } from 'components';
import { SessionContext, defaultSessionContext, Workspace, ColorCheckerWidget } from 'context';

const App: React.FC = () => {

  const [session, setSession] = useState(defaultSessionContext);

  const dropHandler = (e: DragEvent) => {
    e.preventDefault();
    // console.log(e.dataTransfer.files);
    Array.from({ length: e.dataTransfer.files.length })
      .map((o, index) => e.dataTransfer.files[index])
      .forEach(file => {
        console.log(file);
        const blob = new Blob([file], { type: file.type });
        const src = URL.createObjectURL(blob);
        const workspace = {x: 0, y: 0, width: 400, height: 300, scale: 1};
        const widgets = [new ColorCheckerWidget];
        setSession({
          ...session,
          images: [{ src, workspace, widgets }, ...session.images]
        });
      });
  }

  return (
    <div className="App"
      onDragOver={e => e.preventDefault()}
      onDrop={dropHandler}>
      <SessionContext.Provider value={session}>
        <List onSelectionChange={index => setSession({ ...session, currentImageIndex: index })}></List>
        <ViewPort>{session.currentImageIndex !== undefined
          ? <img alt="sample" src={session.images[session.currentImageIndex].src} />
          : null}
          <ColorChecker />
        </ViewPort>
      </SessionContext.Provider>
    </div>
  );
}

export default App;
