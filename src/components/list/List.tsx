import React, { useContext } from 'react';
import { SessionContext } from 'context';

export const List = (props: {
  onSelectionChange: (index: number | undefined) => void
}) => {

  const session = useContext(SessionContext);

  return <section className="list">
    <ul>
      {session.images.map(image => <li key={image.src}>
        <img alt="sample" 
          src={image.src} 
          onClick={() => props.onSelectionChange(session.images.indexOf(image))} />
      </li>)}
    </ul>
  </section>;
}