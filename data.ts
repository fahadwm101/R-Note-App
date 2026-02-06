import { Class, Task, Quiz, Assignment, Note, Priority, SubmissionStatus } from './types';

export const initialClasses: Class[] = [
    { id: '1', subject: 'Calculus II', time: '10:00 - 11:30', day: 'Monday', color: 'bg-red-500', instructor: 'Dr. Turing' },
    { id: '2', subject: 'Data Structures', time: '13:00 - 14:30', day: 'Monday', color: 'bg-blue-500', instructor: 'Prof. Hopper' },
    { id: '3', subject: 'Physics E&M', time: '09:00 - 10:30', day: 'Tuesday', color: 'bg-green-500', instructor: 'Dr. Feynman' },
    { id: '4', subject: 'Calculus II', time: '10:00 - 11:30', day: 'Wednesday', color: 'bg-red-500', instructor: 'Dr. Turing' },
    { id: '5', subject: 'Computer Architecture', time: '15:00 - 16:30', day: 'Thursday', color: 'bg-purple-500', instructor: 'Prof. Von Neumann' },
];
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const initialTasks: Task[] = [
    { id: '1', title: 'Complete Math Homework 3', priority: Priority.High, completed: false, dueDate: today },
    { id: '2', title: 'Read Chapter 5 of Physics textbook', priority: Priority.Medium, completed: true, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '3', title: 'Start coding assignment for CS', priority: Priority.High, completed: false, dueDate: tomorrow },
    { id: '4', title: 'Review notes for upcoming quiz', priority: Priority.Low, completed: false, dueDate: nextWeek },
];
export const initialQuizzes: Quiz[] = [
    { id: '1', subject: 'Physics', date: nextWeek, materialsUrl: 'https://example.com/physics-notes' },
    { id: '2', subject: 'Calculus II', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];
export const initialAssignments: Assignment[] = [
    { id: '1', subject: 'Data Structures', title: 'Linked List Implementation', description: 'Implement a doubly linked list in C++ with various operations.', status: SubmissionStatus.NotSubmitted, dueDate: nextMonth + 'T23:59' },
    { id: '2', subject: 'Computer Architecture', title: 'Lab Report 2', description: 'Analyze CPU performance using cache simulators.', status: SubmissionStatus.Submitted, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T17:00' },
];
export const initialNotes: Note[] = [
    { id: '1', subject: 'Data Structures', title: 'Big O Notation', content: '<b>Big O notation</b> is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. <i>It is used in computer science to classify algorithms according to how their run time or space requirements grow as the input size grows.</i>', lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '2', subject: 'Physics', title: 'Maxwell\'s Equations', content: 'Set of coupled partial differential equations that, together with the Lorentz force law, form the foundation of classical electromagnetism.', lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '3', subject: 'Data Structures', title: 'Trees vs Graphs', content: 'A tree is a type of graph, but not all graphs are trees. Trees are undirected graphs that are connected and acyclic.', lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];
