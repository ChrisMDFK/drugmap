import React from 'react';
import Link from 'next/link';
import '@/styles/globals.css';

export const metadata = {
  title: '藥房佈局管理系統',
  description: '使用此工具來設計和管理您的藥房佈局，包括藥櫃、抽屜和工作台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-lg font-bold text-gray-900">
              藥房佈局管理系統
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                儀表板
              </Link>
              <Link href="/layout" className="text-gray-600 hover:text-gray-900">
                佈局編輯器
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 藥房佈局管理系統
          </div>
        </footer>
      </body>
    </html>
  );
}