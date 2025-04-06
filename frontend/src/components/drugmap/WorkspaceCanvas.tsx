import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, Settings, Trash2, ZoomIn, ZoomOut, Save, 
  Download, Upload, Grid, Move, Undo, Redo, List, 
  Maximize, Minimize, AlertCircle, ChevronLeft, ChevronRight,
  FolderPlus, Folder, LayoutGrid
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

interface Component {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number; depth: number };
  capacity?: number;
  items: any[];
  groupId: string | null;
}

// Main workspace component
const WorkspaceCanvas = (): React.ReactElement => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showComponentList, setShowComponentList] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [components, setComponents] = useState<Component[]>([
    { 
      id: '1', 
      type: 'shelf', 
      name: 'Medicine Shelf A', 
      position: { x: 100, y: 100 }, 
      dimensions: { width: 200, height: 150, depth: 50 },
      capacity: 24,
      items: [],
      groupId: null
    },
    { 
      id: '2', 
      type: 'drawer', 
      name: 'Storage Drawer 1', 
      position: { x: 350, y: 100 }, 
      dimensions: { width: 150, height: 80, depth: 40 },
      capacity: 12,
      items: [],
      groupId: null
    },
    { 
      id: '3', 
      type: 'workbench', 
      name: 'Preparation Station', 
      position: { x: 200, y: 300 }, 
      dimensions: { width: 300, height: 120, depth: 60 },
      items: [],
      groupId: null
    }
  ]);
  
  // History for undo/redo
  const [history, setHistory] = useState([{ components, groups }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newComponents: Component[], newGroups: Group[]): void => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ components: newComponents, groups: newGroups });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = (): void => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const { components: prevComponents, groups: prevGroups } = history[historyIndex - 1];
      setComponents(prevComponents);
      setGroups(prevGroups);
    }
  };

  const redo = (): void => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const { components: nextComponents, groups: nextGroups } = history[historyIndex + 1];
      setComponents(nextComponents);
      setGroups(nextGroups);
    }
  };

  // Group management functions
  const addGroup = (type: 'room' | 'area'): void => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: `New ${type === 'room' ? 'Room' : 'Area'}`,
      components: [],
      position: { x: 100, y: 100 },
      dimensions: { width: 400, height: 300 },
      type
    };
    
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    addToHistory(components, newGroups);
    setSelectedGroup(newGroup.id);
    setEditingGroup(newGroup);
  };

  const updateGroup = (id: string, updates: Partial<Group>): void => {
    const newGroups = groups.map(group =>
      group.id === id ? { ...group, ...updates } : group
    );
    setGroups(newGroups);
    addToHistory(components, newGroups);
  };

  const deleteGroup = (id: string): void => {
    // Remove group and update components that were in the group
    const newComponents = components.map(comp =>
      comp.groupId === id ? { ...comp, groupId: null } : comp
    );
    const newGroups = groups.filter(group => group.id !== id);
    
    setComponents(newComponents);
    setGroups(newGroups);
    addToHistory(newComponents, newGroups);
    setSelectedGroup(null);
    setEditingGroup(null);
  };

  const addComponentToGroup = (componentId: string, groupId: string): void => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newGroups = groups.map(g =>
      g.id === groupId
        ? { ...g, components: [...g.components, componentId] }
        : g
    );

    const newComponents = components.map(comp =>
      comp.id === componentId
        ? { ...comp, groupId }
        : comp
    );

    setGroups(newGroups);
    setComponents(newComponents);
    addToHistory(newComponents, newGroups);
  };

  const removeComponentFromGroup = (componentId: string, groupId: string): void => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newGroups = groups.map(g =>
      g.id === groupId
        ? { ...g, components: g.components.filter(id => id !== componentId) }
        : g
    );

    const newComponents = components.map(comp =>
      comp.id === componentId
        ? { ...comp, groupId: null }
        : comp
    );

    setGroups(newGroups);
    setComponents(newComponents);
    addToHistory(newComponents, newGroups);
  };

  // Zoom functionality
  const handleZoom = (delta: number): void => {
    setScale(prev => {
      const newScale = Math.max(0.5, Math.min(2, prev + delta * 0.1));
      return newScale;
    });
  };
  
  // Pan functionality
  const handlePan = (e: React.MouseEvent): void => {
    if (isDragging) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };
  
  // Component drag functionality
  const handleComponentDrag = (id: string, newX: number, newY: number): void => {
    const newComponents = components.map(comp => 
      comp.id === id 
        ? { ...comp, position: { x: newX, y: newY } } 
        : comp
    );
    setComponents(newComponents);
    addToHistory(newComponents, groups);
  };

  // Group drag functionality
  const handleGroupDrag = (id: string, newX: number, newY: number): void => {
    const newGroups = groups.map(group =>
      group.id === id
        ? { ...group, position: { x: newX, y: newY } }
        : group
    );
    setGroups(newGroups);
    addToHistory(components, newGroups);
  };

  // Add new component
  const addComponent = (type: string): void => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 100, y: 100 },
      dimensions: { 
        width: type === 'workbench' ? 300 : 200,
        height: type === 'drawer' ? 80 : 150,
        depth: 50
      },
      capacity: type === 'shelf' ? 24 : 12,
      items: [],
      groupId: selectedGroup
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    
    if (selectedGroup) {
      const newGroups = groups.map(g =>
        g.id === selectedGroup
          ? { ...g, components: [...g.components, newComponent.id] }
          : g
      );
      setGroups(newGroups);
      addToHistory(newComponents, newGroups);
    } else {
      addToHistory(newComponents, groups);
    }
  };

  // Delete component
  const deleteComponent = (id: string): void => {
    const component = components.find(c => c.id === id);
    const newComponents = components.filter(comp => comp.id !== id);
    
    let newGroups = groups;
    if (component?.groupId) {
      newGroups = groups.map(g =>
        g.id === component.groupId
          ? { ...g, components: g.components.filter(cId => cId !== id) }
          : g
      );
    }
    
    setComponents(newComponents);
    setGroups(newGroups);
    addToHistory(newComponents, newGroups);
    setSelectedComponent(null);
    setEditingComponent(null);
  };

  // Update component
  const updateComponent = (id: string, updates: Partial<Component>): void => {
    const newComponents = components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
    addToHistory(newComponents, groups);
  };

  // Save layout
  const saveLayout = (): void => {
    const layout = {
      components,
      groups,
      scale,
      position
    };
    const blob = new Blob([JSON.stringify(layout)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.json';
    a.click();
  };

  // Load layout
  const loadLayout = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const layout = JSON.parse(result);
            setComponents(layout.components);
            setGroups(layout.groups || []);
            setScale(layout.scale);
            setPosition(layout.position);
            addToHistory(layout.components, layout.groups || []);
          }
        } catch (error) {
          console.error('Error loading layout:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle component list
  const toggleComponentList = (): void => {
    setShowComponentList(!showComponentList);
  };

  // Render individual component
  const renderComponent = (component: Component): React.ReactNode => {
    const props = {
      key: component.id,
      data: component,
      onDrag: handleComponentDrag,
      isSelected: selectedComponent === component.id,
      onSelect: () => setSelectedComponent(component.id),
      onDelete: () => deleteComponent(component.id),
      onEdit: () => setEditingComponent(component)
    };

    switch (component.type) {
      case 'shelf':
        return <ShelfComponent {...props} />;
      case 'drawer':
        return <DrawerComponent {...props} />;
      case 'workbench':
        return <WorkbenchComponent {...props} />;
      default:
        return null;
    }
  };

  // Render group
  const renderGroup = (group: Group): React.ReactNode => {
    const isSelected = selectedGroup === group.id;
    
    return (
      <div
        key={group.id}
        className={`absolute border-2 ${
          group.type === 'room' 
            ? 'border-purple-300 bg-purple-50/30' 
            : 'border-indigo-300 bg-indigo-50/30'
        } ${isSelected ? 'border-blue-500' : ''} rounded-lg`}
        style={{
          left: `${group.position.x}px`,
          top: `${group.position.y}px`,
          width: `${group.dimensions.width}px`,
          height: `${group.dimensions.height}px`,
          zIndex: isSelected ? 5 : 0
        }}
        onClick={() => {
          setSelectedGroup(group.id);
          setEditingGroup(group);
        }}
      >
        <div className={`p-2 ${
          group.type === 'room' ? 'bg-purple-100' : 'bg-indigo-100'
        } rounded-t-lg flex justify-between items-center`}>
          <span className="font-semibold">{group.name}</span>
          <div className="flex gap-1">
            <Settings 
              size={16} 
              className="cursor-pointer hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                setEditingGroup(group);
              }}
            />
            <Trash2 
              size={16} 
              className="cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                deleteGroup(group.id);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Context value
  const contextValue = {
    components,
    setComponents,
    handleComponentDrag,
    selectedComponent,
    setSelectedComponent,
    groups,
    selectedGroup
  };
  
  return (
    <WorkspaceContext.Provider value={contextValue}>
      <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              className="p-2 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-1"
              onClick={() => handleZoom(1)}>
              <ZoomIn size={18} /> Zoom In
            </button>
            <button 
              className="p-2 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-1"
              onClick={() => handleZoom(-1)}>
              <ZoomOut size={18} /> Zoom Out
            </button>
            <button 
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
              onClick={() => setShowGrid(!showGrid)}>
              <Grid size={18} /> {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="p-2 bg-purple-100 rounded hover:bg-purple-200 flex items-center gap-1"
              onClick={() => addGroup('room')}>
              <FolderPlus size={18} /> Add Room
            </button>
            <button 
              className="p-2 bg-indigo-100 rounded hover:bg-indigo-200 flex items-center gap-1"
              onClick={() => addGroup('area')}>
              <LayoutGrid size={18} /> Add Area
            </button>
            <button 
              className="p-2 bg-green-100 rounded hover:bg-green-200 flex items-center gap-1"
              onClick={saveLayout}>
              <Save size={18} /> Save
            </button>
            <label className="p-2 bg-green-100 rounded hover:bg-green-200 flex items-center gap-1 cursor-pointer">
              <Upload size={18} /> Load
              <input type="file" className="hidden" onChange={loadLayout} accept=".json" />
            </label>
            <button 
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
              onClick={undo}
              disabled={historyIndex === 0}>
              <Undo size={18} />
            </button>
            <button 
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
              onClick={redo}
              disabled={historyIndex === history.length - 1}>
              <Redo size={18} />
            </button>
          </div>
        </div>

        {/* Toggle Button for Component List */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={toggleComponentList}
        >
          {showComponentList ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>

        {/* Left Sidebar - Component List */}
        <div className={`absolute left-4 top-20 bottom-4 w-64 bg-white rounded-lg shadow-md z-10 transition-transform ${showComponentList ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold">Components</h2>
          </div>
          <div className="p-4 space-y-2">
            <button 
              className="w-full p-2 bg-yellow-100 rounded hover:bg-yellow-200 flex items-center gap-2"
              onClick={() => addComponent('shelf')}>
              <PlusCircle size={18} /> Add Shelf
            </button>
            <button 
              className="w-full p-2 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-2"
              onClick={() => addComponent('drawer')}>
              <PlusCircle size={18} /> Add Drawer
            </button>
            <button 
              className="w-full p-2 bg-green-100 rounded hover:bg-green-200 flex items-center gap-2"
              onClick={() => addComponent('workbench')}>
              <PlusCircle size={18} /> Add Workbench
            </button>
          </div>
          
          {/* Groups List */}
          <div className="p-4 border-t">
            <h3 className="font-bold mb-2">Groups</h3>
            <div className="space-y-1">
              {groups.map(group => (
                <div 
                  key={group.id}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                    selectedGroup === group.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedGroup(group.id)}>
                  <div className="flex items-center gap-2">
                    {group.type === 'room' ? <Folder size={16} /> : <LayoutGrid size={16} />}
                    <span>{group.name}</span>
                  </div>
                  <button 
                    className="p-1 hover:bg-red-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group.id);
                    }}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        
          {/* Component List */}
          <div className="p-4 border-t">
            <h3 className="font-bold mb-2">Existing Components</h3>
            <div className="space-y-1">
              {components.map(comp => (
                <div 
                  key={comp.id}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                    selectedComponent === comp.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedComponent(comp.id)}>
                  <span>{comp.name}</span>
                  <button 
                    className="p-1 hover:bg-red-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteComponent(comp.id);
                    }}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="absolute w-full h-full"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: '0 0',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handlePan}
        >
          {/* Grid Background */}
          {showGrid && (
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundSize: '20px 20px',
                backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)'
              }}
            />
          )}
          
          {/* Groups */}
          {groups.map(group => renderGroup(group))}
          
          {/* Components */}
          {components.map(comp => renderComponent(comp))}
        </div>
      </div>

      {/* Settings Panel */}
      {(editingComponent || editingGroup) && (
        <div className="absolute right-4 top-20 w-80 bg-white rounded-lg shadow-md z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">
              {editingComponent ? 'Component Settings' : 'Group Settings'}
            </h3>
            <button 
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => {
                setEditingComponent(null);
                setEditingGroup(null);
              }}>
              ×
            </button>
          </div>
          {editingComponent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  onChange={(e) => updateComponent(editingComponent.id, { name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={editingComponent.dimensions.width}
                      onChange={(e) => updateComponent(editingComponent.id, {
                        dimensions: { ...editingComponent.dimensions, width: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={editingComponent.dimensions.height}
                      onChange={(e) => updateComponent(editingComponent.id, {
                        dimensions: { ...editingComponent.dimensions, height: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Depth</label>
                    <input
                      type="number"
                      value={editingComponent.dimensions.depth}
                      onChange={(e) => updateComponent(editingComponent.id, {
                        dimensions: { ...editingComponent.dimensions, depth: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
              {(editingComponent.type === 'shelf' || editingComponent.type === 'drawer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={editingComponent.capacity}
                    onChange={(e) => updateComponent(editingComponent.id, { capacity: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Group</label>
                <select
                  value={editingComponent.groupId || ''}
                  onChange={(e) => {
                    const newGroupId = e.target.value;
                    if (editingComponent.groupId) {
                      removeComponentFromGroup(editingComponent.id, editingComponent.groupId);
                    }
                    if (newGroupId) {
                      addComponentToGroup(editingComponent.id, newGroupId);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="">No Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : editingGroup && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) => updateGroup(editingGroup.id, { name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={editingGroup.type}
                  onChange={(e) => updateGroup(editingGroup.id, { type: e.target.value as 'room' | 'area' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="room">Room</option>
                  <option value="area">Area</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={editingGroup.dimensions.width}
                      onChange={(e) => updateGroup(editingGroup.id, {
                        dimensions: { ...editingGroup.dimensions, width: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={editingGroup.dimensions.height}
                      onChange={(e) => updateGroup(editingGroup.id, {
                        dimensions: { ...editingGroup.dimensions, height: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceCanvas;