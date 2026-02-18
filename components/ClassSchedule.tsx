import React, { useState, useEffect } from 'react';
import { Class, Task, Quiz, Assignment } from '../types';
import CalendarView from './CalendarView';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import PageTour from './PageTour';

declare global {
  interface Window {
    jspdf: any;
  }
}
declare const html2canvas: any;



interface ClassScheduleProps {
  classes: Class[];
  tasks: Task[];
  quizzes: Quiz[];
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onEdit: (item: Class) => void;
}

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'
];

const ClassSchedule: React.FC<ClassScheduleProps> = ({ classes, tasks, quizzes, assignments, onDelete, onEdit }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const days = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday')];
  const originalDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = originalDays.indexOf(todayName);

  console.log('Classes received:', classes, 'Original days:', originalDays);

  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    const scheduleElement = document.getElementById('schedule-grid');
    if (scheduleElement) {
      html2canvas(scheduleElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        // 'l' for landscape, 'mm' for units, 'a4' for paper size
        const pdf = new jsPDF('l', 'mm', 'a4');

        // Get landscape dimensions (A4 Landscape: 297mm x 210mm)
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions to fit width while maintaining aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Add image starting at 0,0
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save("class-schedule.pdf");
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageTour
        pageKey="schedule"
        title={t('tourScheduleTitle')}
        description={t('tourScheduleDesc')}
        features={t('tourScheduleFeatures').split(',')}
      />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* View Switcher */}
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex space-x-1">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'week'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-700'
              }`}
          >
            {t('classSchedule') || 'Weekly'}
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'month'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/50 dark:hover:bg-slate-700'
              }`}
          >
            {t('calendar') || 'Monthly'}
          </button>
        </div>

        <div className="flex items-center">
          <button onClick={() => {
            const url = `${window.location.origin}/share-schedule/${user?.uid}`;
            navigator.clipboard.writeText(url);
            alert(t('scheduleLinkCopied'));
          }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center me-2 shadow-lg shadow-emerald-500/20 transition-all">
            {ICONS.share}
            <span className="ms-2 hidden sm:inline">{t('shareSchedule')}</span>
          </button>

          {viewMode === 'week' && (
            <button onClick={handleExportPDF} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md inline-flex items-center me-2">
              {ICONS.pdf}
              <span className="ms-2 hidden sm:inline">{t('exportPdf')}</span>
            </button>
          )}

          <button onClick={(e) => {
            console.log('Add class button clicked', e);
            // Call onEdit with undefined to indicate adding a new class
            onEdit(undefined);
          }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center">
            {ICONS.plus}
            <span className="ms-2 hidden sm:inline">{t('addClass')}</span>
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div id="schedule-grid" className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] overflow-x-auto p-4 relative transition-colors duration-300">
          <div className="grid grid-cols-6 min-w-[1000px]">
            {/* Empty corner cell */}
            <div className="bg-slate-50 dark:bg-slate-900/60 z-10 sticky left-0 top-0 border-b border-r border-slate-200 dark:border-white/20"></div>
            {/* Day headers */}
            {days.map((day, index) => (
              <div key={day} className={`text-center font-bold text-slate-700 dark:text-white py-4 border-b border-slate-200 dark:border-white/20 ${index === todayIndex ? 'bg-indigo-50 dark:bg-white/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                {day}
              </div>
            ))}

            {/* Time slots and schedule cells */}
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={time}>
                <div className={`text-center text-xs font-semibold text-slate-500 dark:text-white/70 pe-2 py-4 ltr:border-r rtl:border-l border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-slate-900/60 sticky left-0 flex items-center justify-center ${timeIndex !== timeSlots.length - 1 ? 'border-b' : ''}`}>
                  {time}
                </div>
                {originalDays.map((day, dayIndex) => {
                  const classItem = classes.find(c => {
                    if (c.day !== day) return false;

                    // Helper to parse "HH:MM AM/PM"
                    const parse = (tStr: string) => {
                      const [timePart, meridiem] = tStr.split(' ');
                      const [hour] = timePart.split(':');
                      return {
                        hour: parseInt(hour, 10),
                        meridiem: meridiem?.toUpperCase()
                      };
                    };

                    const slotTime = parse(time);
                    const classTime = parse(c.time);

                    // Match if hour and meridiem are the same (e.g., 08:15 AM matches 08:00 AM slot)
                    return slotTime.hour === classTime.hour && slotTime.meridiem === classTime.meridiem;
                  });

                  return (
                    <div key={`${day}-${time}`} className={`border-b ltr:border-r rtl:border-l border-slate-100 dark:border-white/20 h-24 p-1 group relative transition-colors hover:bg-slate-50 dark:hover:bg-white/5`}>
                      {classItem && (
                        <div className={`rounded-xl p-3 h-full flex flex-col justify-between ${classItem.color} dark:bg-opacity-20 text-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
                          <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate leading-tight">{classItem.subject}</p>
                            <p className="text-xs opacity-90 truncate mt-0.5">{classItem.time}</p>
                            <p className="text-xs opacity-75 truncate mt-1">{classItem.instructor}</p>
                          </div>
                          <div className="absolute top-2 end-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md p-1 rounded-lg">
                            <button onClick={() => onEdit(classItem)} className="p-1 hover:text-indigo-200 text-white transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => onDelete(classItem.id)} className="p-1 hover:text-red-200 text-white transition-colors">
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
            if (currentHour >= 8 && currentHour <= 15) {
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
      ) : (
        <CalendarView tasks={tasks} quizzes={quizzes} assignments={assignments} classes={classes} />
      )}
    </div>
  );
};

export default ClassSchedule;
