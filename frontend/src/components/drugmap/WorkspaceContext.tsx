import { createContext } from 'react';

// Context for workspace state management
interface Group {
  id: string;
  name: string;
  components: string[]; // Array of component IDs
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  type: 'room' | 'area';
}

// 創建並導出Context
export const WorkspaceContext = createContext(null);

// 定義Context的類型
export interface WorkspaceContextType {
  components: any[];
  setComponents: (components: any[]) => void;
  handleComponentDrag: (id: string, newX: number, newY: number) => void;
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
  groups: Group[];
  selectedGroup: string | null;
}