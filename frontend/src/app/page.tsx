import React from 'react';
import WorkspaceCanvas from '../components/drugmap/WorkspaceCanvas';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">藥房佈局管理系統</h1>
        <p className="mb-6 text-gray-600">
          使用此工具來設計和管理您的藥房佈局，包括藥櫃、抽屜和工作台。
        </p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <WorkspaceCanvas />
      </div>
    </div>
  );
}
