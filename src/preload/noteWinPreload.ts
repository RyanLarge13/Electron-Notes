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
      ipcRenderer.on("display-note", (_, note) => callback(note));
    },
    sendNoteUpdate: (updatedNote) => {
      ipcRenderer.send("note-updated", updatedNote);
    }
  });
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
