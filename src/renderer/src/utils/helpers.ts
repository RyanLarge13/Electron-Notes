import { v4 as uuidv4 } from "uuid";

export const findNoteSize = (text: string): string => {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  const size = encodedText.length;
  const kb = size / 1024;
  return kb.toFixed(2);
};

export const organizeNotesAndFolders = (updatedData) => {
  const newFoldersArray = updatedData.newFoldersArray.map((fold) => {
    return {
      folderid: fold.folderid,
      parentFolderId: fold.parentfolderid,
      title: fold.title,
      color: fold.color
    };
  });
  const newNotesArray = updatedData.newNotesArray.map((aNote) => {
    return {
      noteid: aNote.noteid,
      htmlText: aNote.htmlnotes,
      folderId: aNote.folderid,
      title: aNote.title,
      createdAt: aNote.createdat,
      updated: aNote.updated,
      locked: aNote.locked,
      trashed: aNote.trashed
    };
  });

  return {
    newFoldersArray,
    newNotesArray
  };
};

const getNestedFoldersIds = (folderId: string, folderIds: string[], folders): void => {
  const childFolders = folders.filter((fold) => fold.parentFolderId === folderId);
  if (childFolders.length === 0) {
    return;
  }
  childFolders.forEach((child) => {
    folderIds.push(child.folderid);
    getNestedFoldersIds(child.folderid, folderIds, folders);
  });
};

const buildChildFolders = (
  aFoldId: string,
  newFolders: { folderid: string; title: string; color: string; parentFolderId: string }[],
  folders
): void => {
  const childFolders = folders.filter((fold) => fold.parentFolderId === aFoldId);
  if (childFolders.length === 0) {
    return;
  }
  childFolders.forEach((child) => {
    const newFolder = {
      folderid: child.folderid,
      title: child.title,
      color: child.color,
      parentFolderId: child.parentFolderId
    };
    newFolders.push(newFolder);
    buildChildFolders(child.folderid, newFolders, folders);
  });
};

const buildChildNotes = (
  folderIds: string[],
  newNotes: {
    title: string;
    htmlText: string;
    locked: boolean;
    trashed: boolean;
    folderId: string;
  }[],
  notes
): void => {
  for (let i = 0; i < folderIds.length; i++) {
    const childNotes = notes.filter((aNote) => aNote.folderId === folderIds[i]);
    childNotes.forEach((child) => {
      const newNote = {
        title: child.title,
        htmlText: child.htmlText,
        locked: child.locked,
        trashed: child.trashed,
        folderId: child.folderId
      };
      newNotes.push(newNote);
    });
  }
};

export const createCopiesOfFoldersAndNotes = (folder, folders, notes) => {
  const newFolders = [];
  const newNotes = [];
  const folderIds = [];
  const newFolder = {
    folderid: folder.folderid,
    title: folder.title,
    color: folder.color,
    parentFolderId: folder.parentFolderId
  };
  newFolders.push(newFolder);
  folderIds.push(folder.folderid);

  getNestedFoldersIds(folder.folderid, folderIds, folders);
  buildChildFolders(folder.folderid, newFolders, folders);
  buildChildNotes(folderIds, newNotes, notes);
  for (let i = 0; i < newFolders.length; i++) {
    const newId = uuidv4();
    for (let j = 0; j < newNotes.length; j++) {
      if (newNotes[j].folderId === newFolders[i].folderid) {
        newNotes[j].folderId = newId;
      }
    }
    for (let k = 0; k < newFolders.length; k++) {
      if (newFolders[k].parentFolderId === newFolders[i].folderid) {
        newFolders[k].parentFolderId = newId;
      }
    }
    newFolders[i].folderid = newId;
  }
  for (let i = 0; i < newNotes.length; i++) {
    const newId = uuidv4();
    newNotes[i].noteid = newId;
  }

  return { copyFolders: newFolders, copyNotes: newNotes };
};

export const generateMockNotes = (folder, tempId) => {
  const newNote = {
    folderId: folder.folderid,
    title: `New Note inside of the ${folder.title} folder`,
    htmlNotes: "<p>Change me!!</p>",
    locked: false
  };
  const noteToPush = {
    noteid: tempId,
    folderId: folder.folderid,
    title: `New Note inside of the ${folder.title} folder`,
    htmlText: "<p>Change me!!</p>",
    locked: false,
    createdAt: new Date(),
    updated: new Date(),
    trashed: false,
    favorite: false
  };

  return { newNote, noteToPush };
};
