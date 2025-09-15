import React from 'react';
import { Rnd } from 'react-rnd';
import ChatScreen from './ChatScreen';

const DraggableChat: React.FC = () => {
  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 400,
        height: 600,
      }}
      minWidth={300}
      minHeight={400}
      bounds="parent"
    >
      <div className="bg-white rounded-lg shadow-xl overflow-hidden h-full">
        <ChatScreen user={{ name: 'Mahaveer', email: 'mahaveer@example.com' }}/>
      </div>
    </Rnd>
  );
};

export default DraggableChat;
