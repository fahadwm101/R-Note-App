
import React, { useState, useEffect } from 'react';
import { Class } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

declare global {
  interface Window {
    jspdf: any;
  }
}
declare const html2canvas: any;

interface ClassScheduleProps {
  classes: Class[];
  onDelete: (id: string) => void;
  onEdit: (item: Class) => void;
}

// Convert 24-hour time to 12-hour format
const formatTime = (timeString: string) => {
  // Handle time ranges like "14:00 - 15:30"
  if (timeString.includes(' - ')) {
    const [start, end] = timeString.split(' - ');
    return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
  }
  return formatSingleTime(timeString);
};

const formatSingleTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12; // 0 becomes 12 for 12:xx AM
  if (minutes === 0) {
    return `${hour12} ${period}`;
  }
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Time slots from 8:00 AM to 2:00 PM (7 hours)
const timeSlots = Array.from({ length: 7 }, (_, i) => {
  const hour24 = i + 8;
  return `${hour24.toString().padStart(2, '0')}:00`;
});

const ClassSchedule: React.FC<ClassScheduleProps> = ({ classes, onDelete, onEdit }) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Start week with Sunday
  const days = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];
  const originalDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = originalDays.indexOf(todayName);


  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    const scheduleElement = document.getElementById('schedule-grid');
    if(scheduleElement){
      html2canvas(scheduleElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("class-schedule.pdf");
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end items-center mb-6">
        <div>
           <button onClick={handleExportPDF} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md inline-flex items-center me-2">
               {ICONS.pdf}
               <span className="ms-2">{t('exportPdf')}</span>
           </button>
           <button onClick={() => onEdit({} as Class)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center">
               {ICONS.plus}
               <span className="ms-2">{t('addClass')}</span>
           </button>
        </div>
      </div>
      
      <div id="schedule-grid" className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] overflow-x-auto p-4 relative">
        <div className="grid grid-cols-8 min-w-[1000px]">
          <div className="sticky left-0 bg-slate-900/60 z-10"></div>
          {days.map((day, index) => (
            <div key={day} className={`text-center font-semibold text-white py-2 border-b border-white/20 ${index === todayIndex ? 'bg-white/10' : 'bg-white/5'}`}>{day}</div>
          ))}
          
          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="text-center text-sm text-white/70 pe-2 py-2 ltr:border-r rtl:border-l border-white/20">{formatTime(time)}</div>
              {originalDays.map(day => {
                const classItem = classes.find(c => c.day === day && c.time.startsWith(time.split(':')[0]));
                return (
                  <div key={`${day}-${time}`} className="border-b ltr:border-r rtl:border-l border-white/20 h-16 p-1 group relative">
                    {classItem && (
                      <div className={`rounded p-2 h-full flex flex-col justify-between ${classItem.color}/20 backdrop-blur-sm text-white text-xs`}>
                        <div>
                            <p className="font-bold">{classItem.subject}</p>
                            <p>{formatTime(classItem.time)}</p>
                            <p className="text-gray-200">{classItem.instructor}</p>
                        </div>
                        <div className="absolute bottom-1 end-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(classItem)} className="p-1 bg-black bg-opacity-40 rounded-full hover:bg-opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                            </button>
                             <button onClick={() => onDelete(classItem.id)} className="p-1 bg-black bg-opacity-40 rounded-full hover:bg-opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {(() => {
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();
          // Show current time indicator only between 8:00 AM and 2:00 PM
          if (currentHour >= 8 && currentHour <= 14) {
            const rowIndex = currentHour - 8;
            const rowHeight = 64; // h-16 = 64px
            const topPosition = 40 + rowIndex * rowHeight + (currentMinute / 60) * rowHeight; // 40 for header
            return (
              <>
                <div
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                  style={{ top: `${topPosition}px` }}
                ></div>
                <div
                  className="absolute left-0 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 z-10"
                  style={{ top: `${topPosition - 6}px` }}
                ></div>
                <div
                  className="absolute left-0 text-xs text-red-500 font-bold z-10"
                  style={{ top: `${topPosition - 16}px` }}
                >
                  Now
                </div>
              </>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default ClassSchedule;
