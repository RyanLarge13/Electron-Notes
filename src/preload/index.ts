import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);

    // Message from note window
    contextBridge.exposeInMainWorld("noteUpdate", {
      receiveCustomData: (callback) =>
        ipcRenderer.on("note-data-from-custom", (_, data) => callback(data)),
      saveNoteFromWindow: (callback) =>
        ipcRenderer.on("note-save-from-custom", (_, data) => callback(data))
    });
    // Message from note window

    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("save", {
      saveTxt: (content: string, title: string) => ipcRenderer.invoke("saveTxt", content, title),
      saveHtml: (content: string, title: string) => ipcRenderer.invoke("saveHtml", content, title),
      saveAsPdf: (content: string, title: string) => ipcRenderer.invoke("savePdf", content, title),
      saveAsDocX: (content: string, title: string, username: string) =>
        ipcRenderer.invoke("saveDocX", content, title, username)
    });
    contextBridge.exposeInMainWorld("closeWin", {
      closeMainWin: () => ipcRenderer.invoke("closeMainWin")
    });

    contextBridge.exposeInMainWorld("openNewWin", {
      openNoteInNewWindow: (note, darkMode) =>
        ipcRenderer.invoke("openNoteInNewWindow", note, darkMode)
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
