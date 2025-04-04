import { Document, Packer, Paragraph, TextRun } from "docx";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import fs from "fs";
import path, { join } from "path";
import PDFDocument from "pdfkit";

import { electronApp, is, optimizer } from "@electron-toolkit/utils";

import appIcon from "../../resources/icon.png?asset";

let preloaderWindow;

function createWindow(): void {
  // Create the browser window.
  const userDataPath = app.getPath("userData");
  const windowStatePath = join(userDataPath, "window-state.json");

  let windowState;
  try {
    windowState = JSON.parse(fs.readFileSync(windowStatePath, "utf-8"));
  } catch (err) {
    console.log(err);
    windowState = { width: 1000, height: 700 };
  }

  const mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    title: "Notes",
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { appIcon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    preloaderWindow.close();
    mainWindow.show();
  });

  mainWindow.on("resize", () => {
    const { width, height } = mainWindow.getBounds();
    windowState = { width, height };
    fs.writeFileSync(windowStatePath, JSON.stringify(windowState));
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  ipcMain.handle("saveTxt", async (_, content, title) => {
    const documentsPath = app.getPath("documents");
    const defaultPath = documentsPath ? path.join(documentsPath, `${title}.txt`) : `${title}.txt`;
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save As Plain Text",
      defaultPath: defaultPath,
      filters: [{ name: "Text Files", extensions: ["txt"] }]
    });
    if (filePath) {
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return;
        }
        console.log("File saved successfully:", filePath);
      });
    } else {
      console.log("File save operation was canceled by the user.");
    }
  });

  ipcMain.handle("saveHtml", async (_, content, title) => {
    const documentsPath = app.getPath("documents");
    const defaultPath = documentsPath ? path.join(documentsPath, `${title}.html`) : `${title}.html`;
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save As HTML",
      defaultPath: defaultPath,
      filters: [{ name: "HTML Files", extensions: ["html"] }]
    });
    if (filePath) {
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error("Error saving file:", err);
          return;
        }
        console.log("File saved successfully:", filePath);
      });
    } else {
      console.log("File save operation was canceled by the user.");
    }
  });

  ipcMain.handle("savePdf", async (_, content, title) => {
    const documentsPath = app.getPath("documents");
    const defaultPath = documentsPath ? path.join(documentsPath, `${title}.pdf`) : `${title}.pdf`;
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save As PDF",
      defaultPath: defaultPath,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }]
    });
    if (filePath) {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      doc.text(content);
      doc.end();
      console.log("PDF file saved successfully:", filePath);
    } else {
      console.log("PDF save operation was canceled by the user.");
    }
  });

  ipcMain.handle("saveDocX", async (_, content, title, username) => {
    const documentsPath = app.getPath("documents");
    const defaultPath = documentsPath ? path.join(documentsPath, `${title}.docx`) : `${title}.docx`;
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save As DOCX",
      defaultPath: defaultPath,
      filters: [{ name: "DOCX Files", extensions: ["docx"] }]
    });
    if (filePath) {
      const doc = new Document({
        creator: username,
        title: title,
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun(content)]
              })
            ]
          }
        ]
      });
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);
      console.log("DOCX file saved successfully:", filePath);
    } else {
      console.log("DOCX save operation was canceled by the user.");
    }
  });

  ipcMain.handle("closeMainWin", () => {
    app.quit();
  });

  ipcMain.handle("openNoteInNewWindow", (_, note, darkMode) => {
    const noteWindow = new BrowserWindow({
      width: 1000,
      height: 600,
      title: note.title || "Note",
      autoHideMenuBar: true,
      resizable: true, // Ensure this is true to enable resizing
      minimizable: true, // Ensure this is true for minimizing
      maximizable: true, // Ensure this is true for maximizing
      frame: true,
      modal: false, // Change to true if you want it as a modal
      webPreferences: {
        preload: join(__dirname, "../preload/noteWinPreload.js"),
        sandbox: false,
        contextIsolation: true
      }
    });

    noteWindow.loadFile(join(__dirname, "../renderer/windows/newNote/index.html"));

    // noteWindow.webContents.openDevTools();

    // Once the new window is ready, send the note data to it
    noteWindow.webContents.once("did-finish-load", () => {
      noteWindow.webContents.send("display-note", note, darkMode);
    });
  });

  // Send note data back to main window for live updates
  ipcMain.on("note-update", (_, data) => {
    mainWindow.webContents.send("note-data-from-custom", data);
  });

  ipcMain.on("note-save", (_, note) => {
    mainWindow.webContents.send("note-save-from-custom", note);
  });

  mainWindow.loadFile(join(__dirname, "../renderer/index.html"), { hash: "login" });
  // mainWindow.webContents.openDevTools();

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Step 1: Create the preloader window immediately
  preloaderWindow = new BrowserWindow({
    width: 600,
    height: 350,
    frame: false, // Removes the default window frame
    alwaysOnTop: true, // Ensures it's displayed above other windows
    show: true, // Ensure the window is shown as soon as possible
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  // Load a very minimal preloader HTML file
  preloaderWindow.loadFile(join(__dirname, "../renderer/windows/preloader/index.html"));

  setTimeout(() => {
    createWindow();
  }, 5000);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
