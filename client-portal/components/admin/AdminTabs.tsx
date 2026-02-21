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
    { id: 'past-projects', label: 'Past Projects' },
    { id: 'feedback', label: 'Testimonials' },
    { id: 'contact', label: 'Contact Requests' },
    { id: 'media', label: 'Media Gallery' },
  ];

  return (
    <div>
      <div className="px-3 sm:px-4 lg:px-5 overflow-x-auto">
        <div className="flex items-center gap-x-1 sm:gap-x-1 border-b border-stone-200 min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative -mb-px px-3 sm:px-4 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center shrink-0 ${
                activeTab === tab.id ? 'text-ebony' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass"></div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

