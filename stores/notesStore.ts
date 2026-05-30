import { create } from 'zustand';
import { onNoteCreated } from '../lib/notifications';
import { Note } from '../types';
import { storage } from '../lib/storage';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  userId: string | null;
  loadNotes: (userId: string) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
}

const key = (userId: string) => `notes:${userId}`;

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  userId: null,

  loadNotes: async (userId) => {
    set({ isLoading: true, userId });
    const cached = await storage.get<Note[]>(key(userId));
    const currentNotes = get().notes;
    
    // Merge cached notes with any notes added before load finished
    // We prioritize memory if there's a conflict, but usually load happens once at start
    if (currentNotes.length > 0 && (!cached || cached.length === 0)) {
      // Keep memory notes if cache is empty
      set({ isLoading: false });
      await storage.set(key(userId), currentNotes);
    } else {
      set({ notes: cached ?? [], isLoading: false });
    }
  },

  addNote: async (note) => {
    const notes = [note, ...get().notes];
    set({ notes });
    const uid = get().userId || note.user_id;
    if (uid) await storage.set(key(uid), notes);
    onNoteCreated(note);
  },

  updateNote: async (id, updates) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    );
    set({ notes });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), notes);
  },

  deleteNote: async (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    set({ notes });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), notes);
  },

  getNoteById: (id) => get().notes.find((n) => n.id === id),
}));

