'use client';

import { StatusUpdate, StatusUpdatePhoto } from '@/lib/mockStore';
import { Calendar } from '@/components/icons';

interface ProjectStatusTimelineProps {
  statusUpdates: StatusUpdate[];
}

export default function ProjectStatusTimeline({ statusUpdates }: ProjectStatusTimelineProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sort by date, newest first
  const sortedUpdates = [...statusUpdates].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-32">
      {sortedUpdates.map((update, idx) => (
        <div key={update.id} className="relative">
          <div className="absolute left-[-40px] top-0 bottom-[-128px] w-px bg-stone-100 hidden md:block">
            <div className="w-2 h-2 rounded-full bg-brass absolute top-0 left-[-4px]"></div>
          </div>
          
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 block mb-2">Update {sortedUpdates.length - idx}</span>
                <h4 className="text-4xl font-serif text-ebony">{update.title}</h4>
              </div>
            </div>

            {update.photos && update.photos.length > 0 && (
              <div className="aspect-video bg-stone-50 overflow-hidden shadow-2xl rounded-sm">
                <img 
                  src={typeof update.photos[0] === 'string' ? update.photos[0] : update.photos[0].url} 
                  alt={update.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="max-w-2xl">
              <p className="text-stone-600 text-xl font-serif leading-relaxed italic">"{update.message}"</p>
            </div>
            
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300 flex items-center">
              <Calendar size={12} className="mr-2" /> {formatDate(update.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
