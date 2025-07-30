'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { BlockNoteEditor } from '@blocknote/core';

interface EditorContextType {
  editor: BlockNoteEditor | null;
  setEditor: (editor: BlockNoteEditor | null) => void;
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('');

  const setEditorStable = useCallback((editor: BlockNoteEditor | null) => {
    setEditor(editor);
  }, []);

  const setDocumentTitleStable = useCallback((title: string) => {
    setDocumentTitle(title);
  }, []);

  return (
    <EditorContext.Provider value={{ 
      editor, 
      setEditor: setEditorStable, 
      documentTitle, 
      setDocumentTitle: setDocumentTitleStable 
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
} 