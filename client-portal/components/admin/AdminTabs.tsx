'use client';

import { ReactNode } from 'react';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export default function AdminTabs({ activeTab, onTabChange, children }: AdminTabsProps) {
  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'feedback', label: 'Testimonials' },
    { id: 'contact', label: 'Contact Requests' },
    { id: 'media', label: 'Media Gallery' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center space-x-12 border-b border-stone-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${
              activeTab === tab.id ? 'text-ebony' : 'text-stone-300 hover:text-stone-500'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass animate-in slide-in-from-left duration-300"></div>
            )}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}

