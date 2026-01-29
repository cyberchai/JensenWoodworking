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
    <div className="space-y-10">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-12 gap-y-3 border-b border-stone-200 pb-2 min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative -mb-px px-1 py-4 min-h-[44px] md:py-5 text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] transition-all flex items-center shrink-0 ${
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
      </div>
      <div>{children}</div>
    </div>
  );
}

