import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataManagement } from '../hooks/useDataManagement';
import { Note } from '../types';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../LanguageContext';

const PublicNoteView: React.FC = () => {
    const { noteId } = useParams<{ noteId: string }>();
    const { getPublicNote, handleSave } = useDataManagement();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Ensure dark mode is applied if not already (though App.tsx does it globally)
        document.documentElement.classList.add('dark');

        const fetchNote = async () => {
            if (!noteId) return;
            try {
                const fetchedNote = await getPublicNote(noteId);
                if (fetchedNote) {
                    setNote(fetchedNote);
                } else {
                    setError("Note not found or has been deleted.");
                }
            } catch (err) {
                setError("Failed to load note.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [noteId, getPublicNote]);

    const handleSaveCopy = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!note) return;

        setSaving(true);
        try {
            await handleSave('notes', undefined, {
                title: `${note.title} (Copy)`,
                subject: note.subject,
                content: note.content
            });
            alert("Note saved to your collection!");
            navigate('/notes');
        } catch (e: any) {
            console.error(e);
            alert("Failed to save note: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center transition-colors duration-300">
                <div className="text-6xl mb-6">😕</div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Note Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">{error || "The link might be invalid or the note was deleted."}</p>
                <a href="/" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium shadow-lg shadow-indigo-500/30">
                    Go to Home
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
            {/* 🌊 Organic Liquid Background - reused from App.tsx but simplified */}
            <div className="absolute inset-0 w-full h-full pointer-events-none hidden dark:block">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 blur-[100px] rounded-full mix-blend-screen opacity-30"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen opacity-30"></div>
            </div>

            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="R.Note Logo" className="h-9 w-9 object-contain drop-shadow-md" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight hidden sm:block">R.NOTE</span>
                    </div>

                    <div>
                        {user ? (
                            <button
                                onClick={handleSaveCopy}
                                disabled={saving}
                                className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-70 disabled:shadow-none text-sm font-semibold overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                        </svg>
                                        Save to My R.NOTE
                                    </>
                                )}
                            </button>
                        ) : (
                            <a href="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                                Log In to Save
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center pt-8 pb-12 px-4 sm:px-6 relative z-10">
                <article className="w-full max-w-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-300">
                    {/* Note Header */}
                    <div className="p-8 pb-6 border-b border-slate-100 dark:border-white/5 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                        <div className="flex items-center gap-2 mb-5">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide border border-indigo-100 dark:border-indigo-500/20">
                                {note.subject || 'General'}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 tracking-tight">
                            {note.title}
                        </h1>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Last updated on {note.lastUpdated ? new Date(note.lastUpdated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}
                        </div>
                    </div>

                    {/* Note Content */}
                    <div className="p-8 pt-8 min-h-[300px]">
                        <div
                            className="prose prose-lg max-w-none 
                                prose-slate dark:prose-invert 
                                text-slate-800 dark:text-slate-200
                                hover:prose-a:text-indigo-600 dark:hover:prose-a:text-indigo-400 
                                prose-img:rounded-xl prose-img:shadow-lg
                                prose-headings:font-bold prose-headings:tracking-tight
                                dark:prose-headings:text-white
                                prose-p:leading-8 prose-p:text-slate-700 dark:prose-p:text-slate-300
                                prose-li:text-slate-700 dark:prose-li:text-slate-300
                                prose-strong:text-slate-900 dark:prose-strong:text-white
                                prose-blockquote:border-l-indigo-500 dark:prose-blockquote:border-l-indigo-400 
                                prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-white/5 
                                prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    </div>
                </article>

                <div className="mt-10 text-center">
                    <p className="text-slate-400 dark:text-slate-600 text-sm font-medium flex items-center justify-center gap-2">
                        Shared via <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wide">R.NOTE</span>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PublicNoteView;
