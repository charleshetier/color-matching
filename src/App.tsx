import React from 'react';
import './App.scss';
import { ColorChecker } from './color-checker';

// const { ipcRenderer } = require('electron');
// console.log(ipcRenderer);

const App: React.FC = () => {
  return (
    <div className="App">
      <section className="list">
        <ul>
          <li><img alt="sample1" src="./samples/sample1.jpg" /></li>
          <li><img alt="sample2" src="./samples/sample2.jpg" /></li>
        </ul>
      </section>
      <section className="viewport">
        <div className="workspace">
          <img alt="sample1" src="./samples/sample1.jpg" />
          <ColorChecker />
        </div>
        <aside className="properties">
          <div className="content">
            Hello properties
          </div>
        </aside>
      </section>
    </div>
  );
}

export default App;
