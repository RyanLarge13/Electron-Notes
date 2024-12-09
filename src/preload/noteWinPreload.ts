import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("electron", {
    onDisplayNote: (callback) => {
      ipcRenderer.on("display-note", (_, note, darkMode) => callback(note, darkMode));
    },
    sendNoteUpdate: (updatedNote) => {
      ipcRenderer.send("note-update", updatedNote);
    },
    sendNoteSave: (note) => {
      ipcRenderer.send("note-save", note);
    }
  });
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
