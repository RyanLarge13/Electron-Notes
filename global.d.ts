import { Note } from "@renderer/types/types";

export {};

declare global {
  interface Window {
    save: {
      saveTxt: (plainText: string, title: string) => Promise<void>;
      saveHtml: (text: string, title: string) => Promise<void>;
      saveAsPdf: (text: string, title: string) => Promise<void>;
      saveAsDocX: (texT: string, title: string) => Promise<void>;
    };
    openNewWin: {
      openNoteInNewWindow: (note: Note, darkMode: boolean) => Promise<void>;
    };
  }
}
