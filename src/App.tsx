import React from 'react';
import './App.scss';
import { ColorChecker } from 'components/color-checker';
import { ViewPort } from './components/viewport/Viewport';

const App: React.FC = () => {
  return (
    <div className="App">
      <section className="list">
        <ul>
          <li><img alt="sample1" src="./samples/sample1.jpg" /></li>
          <li><img alt="sample2" src="./samples/sample2.jpg" /></li>
        </ul>
      </section>
      <ViewPort>
        <img alt="sample1" src="./samples/sample1.jpg" />
        <ColorChecker />
      </ViewPort>
    </div>
  );
}

export default App;
