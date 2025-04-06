import React, { useState, useEffect } from 'react';
import { Settings, Trash2 } from 'lucide-react';

// 從App.tsx中的DrawerComponent完整複製
const DrawerComponent = ({ data, onDrag, isSelected, onSelect, onDelete, onEdit }) => {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - data.position.x,
      y: e.clientY - data.position.y
    });
    onSelect();
    e.stopPropagation();
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onDrag(data.id, newX, newY);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div 
      className={`absolute bg-blue-100 border-2 rounded-lg shadow-md flex flex-col ${
        isSelected ? 'border-blue-500' : 'border-blue-300'
      }`}
      style={{
        left: `${data.position.x}px`,
        top: `${data.position.y}px`,
        width: `${data.dimensions.width}px`,
        height: `${data.dimensions.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging || isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-blue-200 p-2 text-sm font-bold flex justify-between items-center">
        <span>{data.name}</span>
        <div className="flex gap-1">
          <Settings 
            size={16} 
            className="cursor-pointer hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          />
          <Trash2 
            size={16} 
            className="cursor-pointer hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </div>
      </div>
      <div className="flex-1 p-2">
        <div className="bg-blue-50 border border-blue-200 rounded h-full"></div>
      </div>
    </div>
  );
};

export default DrawerComponent;