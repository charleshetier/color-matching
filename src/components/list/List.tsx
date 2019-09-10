import React from 'react';
import { useSelector } from 'store';

export const List = (props: {
  onSelectionChange: (index: number | undefined) => void
}) => {

  const images = useSelector(state => state.images);

  return <section className="list">
    <ul>
      {images.map(image => <li key={image.src}>
        <img alt="sample" 
          src={image.src} 
          onClick={() => props.onSelectionChange(images.indexOf(image))} />
      </li>)}
    </ul>
  </section>;
}