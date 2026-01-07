'use client';

import { ProjectStatus } from '@/lib/mockStore';
import { store } from '@/lib/mockStore';

interface ProjectStatusTimelineProps {
  currentStatus: ProjectStatus;
}

export default function ProjectStatusTimeline({ currentStatus }: ProjectStatusTimelineProps) {
  const statusOrder = store.getStatusOrder();
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-normal text-black mb-6">Project Status</h2>
      <div className="space-y-3">
        {statusOrder.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 ${
                    isCompleted
                      ? 'bg-site-gold'
                      : 'bg-gray-300'
                  }`}
                />
                {index < statusOrder.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ${
                      isCompleted
                        ? 'bg-site-gold'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p
                  className={`text-sm font-normal ${
                    isCurrent
                      ? 'text-black'
                      : isCompleted
                      ? 'text-site-gray'
                      : 'text-gray-400'
                  }`}
                >
                  {store.getStatusLabel(status)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

