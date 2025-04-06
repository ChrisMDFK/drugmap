'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  Settings,
  Trash2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Upload,
  Grid,
  Move,
  Undo,
  Redo,
  List,
  MaximizeIcon,
  MinimizeIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Folder,
  LayoutGrid,
} from 'lucide-react';
import ShelfComponent from './furniture/ShelfComponent';
import DrawerComponent from './furniture/DrawerComponent';
import WorkbenchComponent from './furniture/WorkbenchComponent';
import { WorkspaceContext } from './WorkspaceContext';

// Group type definition
interface Group {
  id: string;
  name: string;
  components: string[]; // Array of component IDs
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  type: 'room' | 'area';
}

// Component type definitions
interface BaseComponent {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number; depth: number };
  items: any[];
  groupId: string | null;
}

interface ShelfComponent extends BaseComponent {
  type: 'shelf';
  capacity: number;
}

interface DrawerComponent extends BaseComponent {
  type: 'drawer';
  capacity: number;
}

interface WorkbenchComponent extends BaseComponent {
  type: 'workbench';
}

type Component = ShelfComponent | DrawerComponent | WorkbenchComponent;

// Simplified WorkspaceCanvas component
const WorkspaceCanvas = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [components, setComponents] = useState<Component[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Simplified render method to get the app started
  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <div className="absolute top-4 left-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="p-2 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-1"
            onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
          >
            <ZoomIn size={18} /> Zoom In
          </button>
          <button
            className="p-2 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-1"
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
          >
            <ZoomOut size={18} /> Zoom Out
          </button>
          <button
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid size={18} /> {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
        </div>
      </div>

      <div
        className="absolute w-full h-full"
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: '0 0',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0"
            style={{
              backgroundSize: '20px 20px',
              backgroundImage:
                'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            }}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h2 className="text-xl font-bold mb-4">藥房佈局管理系統</h2>
            <p className="mb-4">
              此為暫時性的 WorkspaceCanvas 組件，解決導入問題用。
              在完整應用中，您將看到藥房佈局編輯器界面。
            </p>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                新增藥櫃
              </button>
              <button className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
                新增抽屜
              </button>
              <button className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                新增工作台
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCanvas;
