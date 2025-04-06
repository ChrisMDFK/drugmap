import { createContext } from 'react';

// Component type definition
export interface Component {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number; depth: number };
  capacity?: number;
  items: any[];
  groupId: string | null;
}

// Group type definition
export interface Group {
  id: string;
  name: string;
  components: string[]; // Array of component IDs
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  type: 'room' | 'area';
}

// Context type definition
export interface WorkspaceContextType {
  components: Component[];
  setComponents: (components: Component[]) => void;
  handleComponentDrag: (id: string, newX: number, newY: number) => void;
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
  groups: Group[];
  selectedGroup: string | null;
}

// Create and export Context
export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);