import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { CiFolderOn } from "react-icons/ci";
import {
  FaArrowCircleRight,
  FaCheckCircle,
  FaCopy,
  FaEdit,
  FaFolderPlus,
  FaPaintBrush,
  FaPlusSquare,
  FaRegCheckCircle,
  FaWindowClose
} from "react-icons/fa";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import UserContext from "@renderer/contexxt/UserContext";
import { AllData, Folder } from "@renderer/types/types";
import {
  createNewFolder,
  createNewNote,
  deleteAFolder,
  duplicateMultipleContents,
  updateFolder
} from "@renderer/utils/api";

import Colors from "./Colors";

const Folders = (): JSX.Element => {
  const {
    folderSearchText,
    noteIsMoving,
    noteDrag,
    noteDragging,
    editCurrentFolder,
    userPreferences,
    folders,
    token,
    edit,
    selectedForEdit,
    draggedOverFolder,
    allData,
    setNoteDragFolder,
    setPosition,
    setFolder,
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
    networkNotificationError,
    resetSystemNotification,
    showSuccessNotification,
    showErrorNotification
  } = useContext(UserContext);

  const [dragging, setDragging] = useState(false);
  const [folderDragging, setFolderDragging] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [folderToChangeColor, setFolderToChangeColor] = useState(null);
  const [newColor, setNewColor] = useState(null);
  const [draggedInto, setDraggedInto] = useState("");

  const renameRef = useRef(null);
  const folderRefs = useRef([]);

  const navigate = useNavigate();
  const textThemeString = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  useEffect(() => {
    if (folderSearchText !== "" && folderRefs.current && folderRefs.current.length > 0) {
      const search = folderSearchText.toLowerCase();
      const possibleElements = folderRefs.current.filter(
        (refData) => refData && refData.title && refData?.title?.includes(search)
      );
      if (possibleElements.length === 1) {
        if (possibleElements[0].el) {
          const elem = possibleElements[0].el;
          requestAnimationFrame(() => {
            elem.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }
    }
  }, [folderSearchText]);

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
    showSuccessNotification(
      `Delete ${folder.title}`,
      "Are you sure you want to delete? This will delete all of the contents within this folder as well, forever",
      true,
      [{ text: "delete", func: () => deleteFolder(folder.folderid) }]
    );
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
        locked: false,
        createdAt: new Date(),
        updated: new Date(),
        trashed: false
      };
      setAllData((prevData: AllData) => {
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
            showErrorNotification("Creating Note", err.response.message, true, [
              { text: "re-try", func: () => createNestedNote(folder) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => createNestedNote(folder) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      setNote(null);
      networkNotificationError([]);
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

  const confirmDup = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    showSuccessNotification(
      `Duplicate ${folder.title}`,
      "Would you like to duplicate this folder and all of its contents or only the folder?",
      true,
      [
        { text: "duplicate all", func: (): void => dupAll(folder) },
        { text: "duplicate folder", func: (): void => dupFolder(folder) }
      ]
    );
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
    resetSystemNotification();
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
          showSuccessNotification("Duplicated All Content", res.data.message, true, []);
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
            showErrorNotification("Duplicating Content", err.response.message, true, [
              { text: "re-try", func: () => dupAll(folder) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => dupAll(folder) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Duplicating Content",
        "Please contact the developer if this issue persists. We seemed to have a problem duplicating your folders and notes. Please close the application, reload it and try the operation again",
        true,
        []
      );
    }
  };

  const dupFolder = (folder: Folder): void => {
    resetSystemNotification();
    const tempId = uuidv4();
    const newFolder = {
      title: folder.title,
      color: folder.color,
      parentFolderId: folder.parentFolderId,
      createdAt: new Date()
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
          showSuccessNotification(
            "Folder Duplicated",
            "Successfully duplicated your folder",
            false,
            [{ text: "undo", func: (): void => {} }]
          );
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
            showErrorNotification("Duplicating Folder", err.response.message, true, [
              { text: "re-try", func: () => dupFolder(folder) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => dupFolder(folder) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Duplicating Folder",
        "Please contact the developer if this issue persists. We seemed to have a problem duplicating your folder. Please close the application, reload it and try the operation again",
        true,
        []
      );
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
    resetSystemNotification();
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
          showSuccessNotification("Folder Re-named", "Successfully re-named your folder", false, [
            { text: "undo", func: (): void => {} }
          ]);
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
            showErrorNotification("Re-Naming Folder", err.response.message, true, [
              { text: "re-try", func: () => handleRename(e) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => handleRename(e) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Re-naming Folder",
        "Please contact the developer if this issue persists. We seemed to have a problem renaming your folder. Please close the application, reload it and try the operation again",
        true,
        []
      );
    }
  };

  const changeFolderColor = (folder: Folder): void => {
    setFolderToChangeColor(folder);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
  };

  const changeColor = (): void => {
    resetSystemNotification();
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
          showSuccessNotification("New Folder Color", "Your folder color is now updated", false, [
            { text: "undo", func: (): void => {} }
          ]);
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
            showErrorNotification("Updating Folder", err.response.message, true, [
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "reload app", func: () => window.location.reload() }
              ]);
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
      showErrorNotification(
        "Updating Folder",
        "Please contact the developer if this issue persists. We seemed to have a problem changing your folders color. Please close the application, reload it and try the operation again",
        true,
        []
      );
    }
  };

  const deleteFolder = (folderId: string): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const oldFolder = allData.folders.filter((fold) => fold.folderid == folderId)[0];
    resetSystemNotification();
    try {
      setAllData((prevData) => {
        const newFolders = prevData.folders.filter((fold) => fold.folderid !== folderId);
        return { ...prevData, folders: newFolders };
      });
      deleteAFolder(token, folderId)
        .then(() => {
          showSuccessNotification("Folder Deleted", "Successfully deleted your folder", false, [
            { text: "undo", func: (): void => {} }
          ]);
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
            showErrorNotification("Deleting Folder", err.response.message, true, [
              { text: "re-try", func: () => deleteFolder(folderId) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => deleteFolder(folderId) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Deleting Folder",
        "Please contact the developer if this issue persists. We seemed to have a problem deleting your folder. Please close the application, reload it and try the operation again",
        true,
        []
      );
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
    if (folderDragging.folderid === draggedOverFolder.folderid) {
      cancelMove();
      return;
    }
    if (!userPreferences.confirm) {
      return moveFolderAndContents();
    }
    showSuccessNotification(
      `Move ${folderDragging.title} to ${draggedOverFolder.title}`,
      `Are you sure you want to move your ${folderDragging.title} folder and all of its contents?`,
      true,
      [{ text: "move", func: (): void => moveFolderAndContents() }]
    );
  };

  const cancelMove = (): void => {
    setDraggedInto("");
    resetSystemNotification();
    setDraggedOverFolder(null);
    setDragging(false);
    setFolderDragging(null);
  };

  const moveFolderAndContents = (): void => {
    resetSystemNotification();
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
          showSuccessNotification("Moved Folder", "Successfully moved your folder", false, [
            { text: "undo", func: (): void => {} }
          ]);
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
            showErrorNotification("Moving Folder", err.response.message, true, [
              { text: "re-try", func: () => moveFolderAndContents() },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => moveFolderAndContents() },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Moving Folder",
        "Please contact the developer if this issue persists. We seemed to have a problem moving your folder. Please close the application, reload it and try the operation again",
        true,
        []
      );
    }
  };

  const listenForRenameCancel = (e): void => {
    if (e.key === "Escape" || e.key === "Delete") {
      setRenameText("");
      setFolderToRename(null);
    }
  };

  const handleNoteDrag = (folder): void => {
    if (noteIsMoving) {
      return;
    }
    if (noteDrag && noteDragging !== null) {
      setNoteDragFolder(folder);
    }
  };

  return (
    <div className="flex flex-wrap justify-start items-start gap-5 w-full mt-5">
      {folders.map((folder: Folder, index: number) => (
        <motion.div
          ref={(el) => {
            if (el) {
              folderRefs.current[index] = { el, title: folder.title.toLowerCase() };
            } else {
              folderRefs.current[index] = null;
            }
          }}
          drag={!edit && !folderToChangeColor && !folderToRename && !editCurrentFolder}
          onDrag={handleDrag}
          dragSnapToOrigin={draggedInto === folder.folderid ? false : true}
          whileDrag={{
            zIndex: 900,
            pointerEvents: "none",
            boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`
          }}
          onContextMenu={(e) => openOptions(e, folder)}
          onDragStart={(e) => onDragStart(e, folder)}
          onDragEnd={(e) => {
            setDraggedInto(folder.folderid);
            onDragEnd(e);
          }}
          animate={{
            scale: draggedInto == folder.folderid ? 0 : 1,
            outline:
              folder.title.toLowerCase().includes(folderSearchText.toLowerCase()) &&
              folderSearchText !== ""
                ? `2px solid ${userPreferences.darkMode ? "#eee" : "#111"}`
                : "0px"
          }}
          onMouseEnter={(e) => (dragging ? handleDragOver(e, folder) : handleNoteDrag(folder))}
          whileHover={
            !folderToChangeColor
              ? draggedInto === folder.folderid
                ? { scale: 0 }
                : { scale: 1.1 }
              : { scale: 1 }
          }
          key={folder.folderid}
          className={`relative w-60 h-40 scroll-m-40 ${
            userPreferences.darkMode ? "bg-[#333]" : "bg-slate-200"
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
