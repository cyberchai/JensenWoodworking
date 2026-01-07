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
    { id: 'feedback', label: 'Feedback' },
    { id: 'contact', label: 'Contact Requests' },
    { id: 'media', label: 'Media' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex gap-8 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-4 px-1 text-sm font-normal uppercase tracking-wide transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-site-gold text-black'
                  : 'border-transparent text-site-gray hover:text-black hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}

