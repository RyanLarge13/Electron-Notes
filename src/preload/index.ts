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
      openNoteInNewWindow: (note) => ipcRenderer.invoke("openNoteInNewWindow", note)
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
