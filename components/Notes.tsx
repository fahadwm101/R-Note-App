
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface NotesProps {
  notes: Note[];
  onAdd: () => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, onAdd, onUpdate, onDelete }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const { t } = useLanguage();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If selected note is deleted, select the first available note
    if (selectedNote && !notes.find(n => n.id === selectedNote.id)) {
        setSelectedNote(notes[0] || null);
    }
    // If there was no selected note and notes are now available, select the first one.
    else if (!selectedNote && notes.length > 0) {
        setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote]);
  
  useEffect(() => {
    if (editorRef.current && selectedNote) {
      editorRef.current.innerHTML = selectedNote.content;
    }
  }, [selectedNote]);
  
  const subjects = [...new Set(notes.map(n => n.subject))];

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if(editorRef.current && selectedNote) {
        onUpdate({ ...selectedNote, content: editorRef.current.innerHTML });
    }
  };
  
  const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if(selectedNote) {
          onUpdate({ ...selectedNote, content: e.currentTarget.innerHTML });
      }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 ltr:border-r rtl:border-l border-white/10 bg-slate-900/40 backdrop-blur-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{t('allNotes')}</h2>
          <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md">
            {ICONS.plus}
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {subjects.map(subject => (
            <div key={subject}>
              <h3 className="px-4 py-2 text-sm font-semibold text-white/70 bg-white/5">{subject}</h3>
              <ul>
                {notes.filter(n => n.subject === subject).map(note => (
                  <li key={note.id} onClick={() => setSelectedNote(note)}
                      className={`group relative p-4 cursor-pointer ltr:border-l-4 rtl:border-r-4 ${selectedNote?.id === note.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-transparent hover:bg-white/10'}`}>
                    <h4 className="font-semibold text-white truncate">{note.title}</h4>
                    <p className="text-sm text-white/70">{t('updated')}: {new Date(note.lastUpdated).toLocaleDateString()}</p>
                     <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="absolute top-2 end-2 p-1 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-slate-900/60 backdrop-blur-xl">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-white/10 bg-slate-900/60">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedNote.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedNote.subject}</p>
              <div className="bg-slate-800 rounded-lg p-2 flex gap-3 mb-4">
                <button onClick={() => handleFormat('formatBlock', '<h1>')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white text-sm">H1</button>
                <button onClick={() => handleFormat('formatBlock', '<h2>')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white text-sm">H2</button>
                <button onClick={() => handleFormat('bold')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white"><b>B</b></button>
                <button onClick={() => handleFormat('italic')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white"><i>I</i></button>
                <button onClick={() => handleFormat('insertUnorderedList')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white">•</button>
                <button onClick={() => handleFormat('insertOrderedList')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white">1.</button>
                <button onClick={() => handleFormat('formatBlock', '<pre>')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white">{'</>'}</button>
                <button onClick={() => handleFormat('createLink')} className="px-2 py-1 border rounded dark:border-gray-600 dark:text-white">🔗</button>
              </div>
            </div>
            <div
              ref={editorRef}
              contentEditable
              onBlur={handleContentBlur}
              className="max-w-3xl mx-auto p-6 flex-grow overflow-y-auto focus:outline-none text-gray-300 leading-relaxed prose dark:prose-invert"
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>{t('selectNotePrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
