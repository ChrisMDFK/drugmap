import React, { useState, useEffect } from 'react';
import { Settings, Trash2 } from 'lucide-react';

interface ComponentData {
  id: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number; depth: number };
  type: string;
  capacity?: number;
  items: any[];
  groupId: string | null;
}

interface WorkbenchComponentProps {
  data: ComponentData;
  onDrag: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const WorkbenchComponent: React.FC<WorkbenchComponentProps> = ({ 
  data, 
  onDrag, 
  isSelected, 
  onSelect, 
  onDelete, 
  onEdit 
}) => {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - data.position.x,
      y: e.clientY - data.position.y
    });
    onSelect();
    e.stopPropagation();
  };
  
  const handleMouseMove = (e: MouseEvent) => {
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
      className={`absolute bg-green-100 border-2 rounded-lg shadow-md flex flex-col ${
        isSelected ? 'border-blue-500' : 'border-green-300'
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
      <div className="bg-green-200 p-2 text-sm font-bold flex justify-between items-center">
        <span>{data.name}</span>
        <div className="flex gap-1">
          <Settings 
            size={16} 
            className="cursor-pointer hover:text-green-700"
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
        <div className="bg-green-50 border border-green-200 rounded h-full flex items-center justify-center">
          <span className="text-green-800 text-xs">Preparation Area</span>
        </div>
      </div>
    </div>
  );
};

export default WorkbenchComponent;