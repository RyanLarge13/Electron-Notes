import { useContext, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AllData, Folder, Note } from "@renderer/types/types";
import { CiFolderOn } from "react-icons/ci";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaFolderPlus,
  FaRegCheckCircle,
  FaArrowCircleRight,
  FaCopy,
  FaEdit,
  FaPaintBrush,
  FaWindowClose,
  FaPlusSquare
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import {
  createNewFolder,
  createNewNote,
  updateFolder,
  // updateMultiFolders,
  // updateMultiNotes,
  deleteAFolder,
  duplicateMultipleContents
} from "@renderer/utils/api";
import Colors from "./Colors";
import UserContext from "@renderer/contexxt/UserContext";

const Folders = (): JSX.Element => {
  const {
    setPosition,
    setFolder,
    setSystemNotif,
    setContextMenu,
    setSelectedFolder,
    setAllData,
    setNesting,
    setNote,
    setSelectedForEdit,
    setDraggedOverFolder,
    setMove,
    setUserPreferences,
    setNotes,
    editCurrentFolder,
    userPreferences,
    folders,
    token,
    edit,
    selectedForEdit,
    draggedOverFolder,
    allData
  } = useContext(UserContext);

  const [dragging, setDragging] = useState(false);
  const [folderDragging, setFolderDragging] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [folderToChangeColor, setFolderToChangeColor] = useState(null);
  const [newColor, setNewColor] = useState(null);
  const [draggedInto, setDraggedInto] = useState("");

  const renameRef = useRef(null);

  const navigate = useNavigate();
  const textThemeString = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const openFolder = (folder: Folder): void => {
    setNesting((prev) => [...prev, { title: folder.title, id: folder.folderid }]);
    setNotes([]);
    setFolder(folder);
    const newPreferences = {
      ...userPreferences,
      savedFolder: folder.folderid
    };
    setUserPreferences(newPreferences);
    localStorage.setItem("preferences", JSON.stringify(newPreferences));
  };

  const confirmDelete = (folder: Folder): void => {
    const newConfirmation = {
      show: true,
      title: `Delete ${folder.title}`,
      text: "Are you sure you want to delete? This will delete all of the contents forever",
      color: "bg-red-400",
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: () =>
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            })
        },
        { text: "delete", func: () => deleteFolder(folder.folderid) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const createNestedFolder = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setSelectedFolder(folder);
    navigate("/newfolder");
  };

  const createNestedNote = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    try {
      const tempId = uuidv4();
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
        locked: false
      };
      setAllData((prevData) => {
        const newData = {
          ...prevData,
          notes: [...prevData.notes, noteToPush]
        };
        return newData;
      });
      setFolder(folder);
      setNote(noteToPush);
      createNewNote(token, newNote)
        .then((res) => {
          const newId = res.data.data[0].notesid;
          setAllData((prevData) => {
            const newNotes = prevData.notes.map((aNote) => {
              if (aNote.noteid === tempId) {
                return { ...aNote, noteid: newId };
              }
              return aNote;
            });
            return { ...prevData, notes: newNotes };
          });
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const newNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
            return { ...prevData, notes: newNotes };
          });
          setNote(null);
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Creating Note",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => createNestedNote(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => createNestedNote(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      setNote(null);
      const newError = {
        show: true,
        title: "Issues Creating Note",
        text: "Please contact the developer if this issue persists. We seemed to have a problem creating a new note. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const moveFolder = (folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setMove({
      isMoving: true,
      from: folder.folderid,
      itemTitle: folder.title,
      item: [folder],
      type: "folder"
    });
  };

  // const moveFolderContents = (folderId):void => {
  //   const foldersOfFolder = allData.folders.filter((fold) => fold.parentFolderId === folderId);
  //   const notesOfFolder = allData.notes.filter((aNote) => aNote.folderid === folderId);
  //   setMove({
  //     isMoving: true,
  //     from: folder.folderid,
  //     itemTitle: folder.title,
  //     item: folder,
  //     type: "folder"
  //   })
  // };

  const confirmDup = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const newConfirmation = {
      show: true,
      title: `Duplicate ${folder.title}`,
      text: "Would you like to duplicate this folder and all of its contents or only the folder?",
      color: folder.color,
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: () =>
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            })
        },
        { text: "duplicate all", func: (): void => dupAll(folder) },
        { text: "duplicate folder", func: (): void => dupFolder(folder) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const buildChildFolders = (
    aFoldId: string,
    newFolders: { folderid: string; title: string; color: string; parentFolderId: string }[]
  ): void => {
    const childFolders = allData.folders.filter((fold) => fold.parentFolderId === aFoldId);
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
      buildChildFolders(child.folderid, newFolders);
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
    }[]
  ): void => {
    for (let i = 0; i < folderIds.length; i++) {
      const childNotes = allData.notes.filter((aNote) => aNote.folderId === folderIds[i]);
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

  const getNestedFoldersIds = (folderId: string, folderIds: string[]): void => {
    const childFolders = allData.folders.filter((fold) => fold.parentFolderId === folderId);
    if (childFolders.length === 0) {
      return;
    }
    childFolders.forEach((child) => {
      folderIds.push(child.folderid);
      getNestedFoldersIds(child.folderid, folderIds);
    });
  };

  const dupAll = (folder: Folder): void => {
    const oldFolders = allData.folders;
    const oldNotes = allData.notes;
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
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
    getNestedFoldersIds(folder.folderid, folderIds);
    buildChildFolders(folder.folderid, newFolders);
    buildChildNotes(folderIds, newNotes);
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
    setAllData((prev) => {
      const newData = {
        ...prev,
        folders: [...prev.folders, ...newFolders],
        notes: [...prev.notes, ...newNotes]
      };
      return newData;
    });
    try {
      duplicateMultipleContents(token, newFolders, newNotes)
        .then((res) => {
          const updatedData = res.data.data;
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
          setAllData((prev) => {
            return {
              ...prev,
              folders: [...oldFolders, ...newFoldersArray],
              notes: [...oldNotes, ...newNotesArray]
            };
          });
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Duplicated All Content",
              text: res.data.message,
              color: "bg-green-300",
              hasCancel: true,
              actions: [
                {
                  text: "close",
                  func: () =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prev) => {
            return {
              ...prev,
              folders: oldFolders,
              notes: oldNotes
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Duplicating Content",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => dupAll(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => dupAll(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Duplicating Content",
        text: "Please contact the developer if this issue persists. We seemed to have a problem duplicating your folders and notes. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const dupFolder = (folder: Folder): void => {
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    const tempId = uuidv4();
    const newFolder = {
      title: folder.title,
      color: folder.color,
      parentFolderId: folder.parentFolderId
    };
    try {
      setAllData((prevData: AllData) => {
        const newFolders = [...prevData.folders, { ...newFolder, folderid: tempId }];
        return { ...prevData, folders: newFolders };
      });
      createNewFolder(token, newFolder)
        .then((res) => {
          const newId = res.data.data[0].folderid;
          setAllData((prevData) => {
            const updatedFolders = prevData.folders.map((fold) => {
              if (fold.folderid === tempId) {
                return { ...fold, folderid: newId };
              }
              return fold;
            });
            return {
              ...prevData,
              folders: updatedFolders
            };
          });
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Folder Duplicated",
              text: "Successfully duplicated your folder",
              color: "bg-green-300",
              hasCancel: false,
              actions: [
                {
                  text: "close",
                  func: (): void =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                },
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          setAllData((prevData) => {
            const updatedFolders = prevData.folders.filter((fold) => fold.folderid !== tempId);
            return {
              ...prevData,
              folders: updatedFolders
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Duplicating Folder",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => dupFolder(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => dupFolder(folder) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Duplicating Folder",
        text: "Please contact the developer if this issue persists. We seemed to have a problem duplicating your folder. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const renameFolder = (folder: Folder): void => {
    setFolderToRename(folder);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    if (renameRef.current) {
      renameRef.current.focus();
    }
    setTimeout(() => {
      renameRef.current.focus();
    }, 250);
  };

  const handleRename = (e): void => {
    e.preventDefault();
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
    const oldTitle = folderToRename.title;
    const newFolder = {
      folderId: folderToRename.folderid,
      title: renameText,
      color: folderToRename.color,
      parentFolderId: folderToRename.parentFolderId
    };
    try {
      setAllData((prevData) => {
        const newFolders = prevData.folders
          .map((fold: Folder): Folder => {
            if (fold.folderid === folderToRename.folderid) {
              return { ...fold, title: renameText };
            }
            return fold;
          })
          .sort((a, b) => a.title.localeCompare(b.title));
        return {
          ...prevData,
          folders: newFolders
        };
      });
      setFolderToRename(null);
      setRenameText("");
      updateFolder(token, newFolder)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Folder Re-Named",
              text: "Successfully renamed your folder",
              color: "bg-green-300",
              hasCancel: false,
              actions: [
                {
                  text: "close",
                  func: (): void =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                },
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const newFolders = prevData.folders
              .map((fold: Folder): Folder => {
                if (fold.folderid === folderToRename.folderid) {
                  return { ...fold, title: oldTitle };
                }
                return fold;
              })
              .sort((a, b) => a.title.localeCompare(b.title));
            return {
              ...prevData,
              folders: newFolders
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Renaming Folder",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => handleRename(e) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => handleRename(e) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Renaming Folder",
        text: "Please contact the developer if this issue persists. We seemed to have a problem renaming your folder. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const changeFolderColor = (folder: Folder): void => {
    setFolderToChangeColor(folder);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
  };

  const changeColor = (): void => {
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
    const tempId = folderToChangeColor.folderid;
    const oldColor = folderToChangeColor.color;
    const newFolder = {
      folderId: folderToChangeColor.folderid,
      title: folderToChangeColor.title,
      color: newColor,
      parentFolderId: folderToChangeColor.parentFolderId
    };
    try {
      setAllData((prevData) => {
        const newFolders = prevData.folders.map((fold) => {
          if (fold.folderid === tempId) {
            return { ...fold, color: newColor };
          }
          return fold;
        });
        return {
          ...prevData,
          folders: newFolders
        };
      });
      setFolderToChangeColor(false);
      setNewColor(null);
      updateFolder(token, newFolder)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "New Folder Color",
              text: "Your folder color is now updated",
              color: "bg-green-300",
              hasCancel: false,
              actions: [
                {
                  text: "close",
                  func: (): void =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                },
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const newFolders = prevData.folders.map((fold) => {
              if (fold.folderid === tempId) {
                return { ...fold, color: oldColor };
              }
              return fold;
            });
            return {
              ...prevData,
              folders: newFolders
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Updating Folder",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: (): void =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      setAllData((prevData) => {
        const newFolders = prevData.folders.map((fold) => {
          if (fold.folderid === tempId) {
            return { ...fold, color: oldColor };
          }
          return fold;
        });
        return {
          ...prevData,
          folders: newFolders
        };
      });
      const newError = {
        show: true,
        title: "Issues Updating Folder",
        text: "Please contact the developer if this issue persists. We seemed to have a problem changing your folders color. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const deleteFolder = (folderId: string): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const oldFolder = allData.folders.filter((fold) => fold.folderid == folderId)[0];
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    try {
      setAllData((prevData) => {
        const newFolders = prevData.folders.filter((fold) => fold.folderid !== folderId);
        return { ...prevData, folders: newFolders };
      });
      deleteAFolder(token, folderId)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Folder Deleted",
              text: "Successfully deleted your folder!!",
              color: "bg-green-300",
              hasCancel: false,
              actions: [
                {
                  text: "close",
                  func: (): void =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                },
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const newFolders = [...prevData.folders, oldFolder];
            return {
              ...prevData,
              folders: newFolders
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Deleting Folder",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => deleteFolder(folderId) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: (): void =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => deleteFolder(folderId) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Deleting Folder",
        text: "Please contact the developer if this issue persists. We seemed to have a problem deleting your folder. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const openOptions = (event, folder: Folder): void => {
    event.preventDefault();
    event.stopPropagation();
    const { clientX, clientY } = event;
    let dynamicTop = clientY;
    let dynamicLeft = clientX;
    if (clientY + 270 > window.innerHeight) {
      dynamicTop -= 270;
    }
    if (clientX + 200 > window.innerWidth) {
      dynamicLeft -= 250;
    }
    setPosition({ top: dynamicTop, left: dynamicLeft });
    const newMenu = {
      show: true,
      meta: {
        title: folder.title,
        color: folder.color
      },
      options: [
        {
          title: "new folder",
          icon: <FaFolderPlus />,
          func: (): void => createNestedFolder(folder)
        },
        {
          title: "new note",
          icon: <FaPlusSquare />,
          func: (): void => createNestedNote(folder)
        },
        {
          title: "move",
          icon: <FaArrowCircleRight />,
          func: (): void => moveFolder(folder)
        },
        // {
        //   title: "move contents",
        //   icon: <FaArrowCircleRight />,
        //   // func: () => moveFolderCOntents(folder.folderid);
        //   func: (): void => {}
        // },
        {
          title: "duplicate",
          icon: <FaCopy />,
          func: (): void => (userPreferences.confirm ? confirmDup(folder) : dupFolder(folder))
        },
        {
          title: "rename",
          icon: <FaEdit />,
          func: (): void => renameFolder(folder)
        },
        {
          title: "change color",
          icon: <FaPaintBrush />,
          func: (): void => changeFolderColor(folder)
        },
        {
          title: "delete",
          icon: <FaWindowClose />,
          func: (): void =>
            userPreferences.confirm ? confirmDelete(folder) : deleteFolder(folder.folderid)
        }
      ]
    };
    setContextMenu(newMenu);
  };

  const select = (folderId: string): void => {
    if (selectedForEdit.length === 0) {
      return setSelectedForEdit([folderId]);
    }
    if (selectedForEdit.includes(folderId)) {
      const newSelected = selectedForEdit.filter((id) => id !== folderId);
      return setSelectedForEdit(newSelected);
    }
    setSelectedForEdit((prev) => [...prev, folderId]);
  };

  const onDragStart = (e, folder: Folder): void => {
    e.preventDefault();
    setFolderDragging(folder);
  };

  const handleDragOver = (e, folder: Folder): void => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Drag over event triggered for folder:", folder);
    setDraggedOverFolder(folder);
  };

  const handleDrag = (e): void => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragEnd = (e): void => {
    e.preventDefault();
    setDragging(false);
    if (!draggedOverFolder) {
      cancelMove();
      return;
    }
    if (!userPreferences.confirm) {
      return moveFolderAndContents();
    }
    const newConfirmation = {
      show: true,
      title: `Move ${folderDragging.title} to ${draggedOverFolder.title}`,
      text: `Are you sure you want to move your ${folderDragging.title} folder and all of its contents?`,
      color: "bg-cyan-300",
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: (): void => {
            setDraggedInto("");
            cancelMove();
          }
        },
        { text: "move", func: (): void => moveFolderAndContents() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const cancelMove = (): void => {
    setDraggedInto("");
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
    setDraggedOverFolder(null);
    setDragging(false);
    setFolderDragging(null);
  };

  const moveFolderAndContents = (): void => {
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    const folderUpdate = {
      ...folderDragging,
      folderId: folderDragging.folderid,
      parentFolderId: draggedOverFolder.folderid
    };
    try {
      setAllData((prevData) => {
        const newFolders = prevData.folders.map((fold: Folder): Folder => {
          if (fold.folderid === folderDragging.folderid) {
            return { ...fold, parentFolderId: draggedOverFolder.folderid };
          }
          return fold;
        });
        return { ...prevData, folders: newFolders };
      });
      setDraggedInto("");
      updateFolder(token, folderUpdate)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Moved Folder",
              text: "Successfully moved your folder",
              color: "bg-green-300",
              hasCancel: false,
              actions: [
                {
                  text: "close",
                  func: (): void =>
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    })
                },
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
          setFolderDragging(null);
          setDraggedOverFolder(null);
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const newFolders = prevData.folders.map((fold: Folder): Folder => {
              if (fold.folderid === folderDragging.folderid) {
                return { ...fold, parentFolderId: folderDragging.parentFolderId };
              }
              return fold;
            });
            return { ...prevData, folders: newFolders };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Moving Folder",
                text: err.response.message,
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: () =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => moveFolderAndContents() },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Network Error",
                text: "Our application was not able to reach the server, please check your internet connection and try again",
                color: "bg-red-300",
                hasCancel: true,
                actions: [
                  {
                    text: "close",
                    func: (): void =>
                      setSystemNotif({
                        show: false,
                        title: "",
                        text: "",
                        color: "",
                        hasCancel: false,
                        actions: []
                      })
                  },
                  { text: "re-try", func: () => moveFolderAndContents() },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Moving Folder",
        text: "Please contact the developer if this issue persists. We seemed to have a problem moving your folder. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const listenForRenameCancel = (e): void => {
    if (e.key === "Escape" || e.key === "Delete") {
      setRenameText("");
      setFolderToRename(null);
    }
  };

  return (
    <div className="flex flex-wrap justify-start items-start gap-5 w-full mt-5">
      {folders.map((folder: Folder) => (
        <motion.div
          drag={!edit && !folderToChangeColor && !folderToRename && !editCurrentFolder}
          onDrag={handleDrag}
          dragSnapToOrigin={draggedInto === folder.folderid ? false : true}
          whileDrag={{ zIndex: 900, pointerEvents: "none" }}
          onContextMenu={(e) => openOptions(e, folder)}
          onDragStart={(e) => onDragStart(e, folder)}
          onDragEnd={(e) => {
            setDraggedInto(folder.folderid);
            onDragEnd(e);
          }}
          animate={draggedInto == folder.folderid ? { scale: 0 } : { scale: 1 }}
          onMouseEnter={(e) => (dragging ? handleDragOver(e, folder) : null)}
          whileHover={
            !folderToChangeColor
              ? draggedInto === folder.folderid
                ? { scale: 0 }
                : { scale: 1.1 }
              : { scale: 1 }
          }
          key={folder.folderid}
          className={`relative w-60 h-40 ${
            userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
          } will-change-transform rounded-md shadow-lg p-2 flex flex-col justify-between cursor-pointer`}
          onClick={() =>
            !edit &&
            !folderToRename &&
            !folderToChangeColor &&
            !editCurrentFolder &&
            openFolder(folder)
          }
        >
          {folderToChangeColor && folderToChangeColor.folderid === folder.folderid && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute inset-0 p-3 z-[999] flex flex-col justify-end items-start rounded-md shadow-md ${
                userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setFolderToChangeColor(null);
              }}
            >
              <div
                className={`z-10 absolute top-0 right-0 w-[50%] h-3 rounded-bl-md rounded-tr-md ${newColor} bg-amber-300`}
              ></div>
              <Colors setColor={setNewColor} />
              <button
                onClick={() => changeColor()}
                className="py-1 px-3 mt-3 duration-200 hover:bg-amber-200 rounded-md bg-amber-300 text-black"
              >
                Change Color &rarr;
              </button>
            </motion.div>
          )}
          <div
            className={`z-10 absolute top-0 right-0 w-[50%] h-3 rounded-bl-md rounded-tr-md ${folder.color} bg-amber-300`}
          ></div>
          <div className="flex justify-start items-start gap-x-2">
            <p className="flex justify-center items-center gap-x-1 font-bold text-sm">
              <CiFolderOn />
              {allData.folders.filter((fold) => fold.parentFolderId === folder.folderid).length}
            </p>
            <p className="flex justify-center items-center gap-x-1 font-bold text-sm">
              <TbNotes />
              {allData.notes.filter((aNote) => aNote.folderId === folder.folderid).length}
            </p>
          </div>
          {folderToRename && folderToRename.folderid === folder.folderid ? (
            <form
              onSubmit={handleRename}
              onClick={(e) => {
                e.stopPropagation();
                setFolderToRename(null);
              }}
            >
              <input
                ref={renameRef}
                onKeyUp={(e) => listenForRenameCancel(e)}
                placeholder={folder.title}
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                className="font-semibold bg-transparent focus:outline-none"
              />
            </form>
          ) : (
            <h2 className="font-semibold">{folder.title}</h2>
          )}
          {edit && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                select(folder.folderid);
              }}
              className="absolute right-3 bottom-3"
            >
              {selectedForEdit.length > 0 && selectedForEdit.includes(folder.folderid) ? (
                <FaCheckCircle
                  className={`${textThemeString ? textThemeString : "text-amber-300"}`}
                />
              ) : (
                <FaRegCheckCircle />
              )}
            </motion.button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Folders;
