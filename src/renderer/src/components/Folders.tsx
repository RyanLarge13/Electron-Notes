import { useContext, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Folder } from "@renderer/types/types";
import {
  createNewFolder,
  createNewNote,
  updateFolder,
  updateMultiFolders,
  updateMultiNotes,
  deleteAFolder
} from "@renderer/utils/api";
import { CiFolderOn } from "react-icons/ci";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";
import Colors from "./Colors";
import UserContext from "@renderer/contexxt/UserContext";

const Folders = (): JSX.Element => {
  const {
    folders,
    allData,
    setFolder,
    setPosition,
    setSystemNotif,
    setContextMenu,
    setSelectedFolder,
    token,
    setAllData,
    setNesting,
    edit,
    setNote,
    selectedForEdit,
    setSelectedForEdit,
    draggedOverFolder,
    setDraggedOverFolder,
    setMove
  } = useContext(UserContext);

  const [dragging, setDragging] = useState(false);
  const [folderDragging, setFolderDragging] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [folderToChangeColor, setFolderToChangeColor] = useState(null);
  const [newColor, setNewColor] = useState(null);

  const renameRef = useRef(null);

  const navigate = useNavigate();

  const openFolder = (folder: Folder): void => {
    setNesting((prev) => [...prev, folder.title]);
    setFolder(folder);
  };

  const confirmDelete = (folder) => {
    setContextMenu({ show: false });
    const newConfirmation = {
      show: true,
      title: `Delete ${folder.title}`,
      text: "Are you sure you want to delete? This will delete all of the contents forever",
      color: "bg-red-400",
      hasCancel: true,
      actions: [
        { text: "cancel", func: () => setSystemNotif({ show: false }) },
        { text: "delete", func: () => deleteFolder(folder.folderid) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const createNestedFolder = (folder) => {
    setContextMenu({ show: false });
    setSelectedFolder(folder);
    navigate("/newfolder");
  };

  const createNestedNote = (folder) => {
    setFolder(folder);
    const newNote = {
      folderId: folder.folderid,
      title: `New Note inside of the ${folder.title} folder`,
      htmlNotes: "<p>Change me!!</p>"
    };
    createNewNote(token, newNote).then((res) => {
      const returnedNote = res.data.data[0];
      const noteToPush = {
        title: returnedNote.title,
        createdAt: returnedNote.createdat,
        noteid: returnedNote.notesid,
        htmlText: returnedNote.htmlnotes,
        locked: returnedNote.locked,
        folderId: returnedNote.folderid
      };
      setAllData((prevData) => {
        const newData = {
          ...prevData,
          notes: [...prevData.notes, noteToPush]
        };
        return newData;
      });
      setNote(noteToPush);
    });
    setContextMenu({ show: false });
  };

  const moveFolder = (folder) => {
    setContextMenu({ show: false });
    setMove({
      isMoving: true,
      from: folder.folderid,
      itemTitle: folder.title,
      item: folder,
      type: "folder"
    });
  };

  // const moveFolderCOntents = (folderId):void => {
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

  const confirmDup = (folder): void => {
    setContextMenu({ show: false });
    const newConfirmation = {
      show: true,
      title: `Duplicate ${folder.title}`,
      text: "Would you like to duplicate this folder and all of its contents or only the folder?",
      color: folder.color,
      hasCancel: true,
      actions: [
        { text: "cancel", func: () => setSystemNotif({ show: false }) },
        { text: "duplicate all", func: () => dupAll(folder) },
        { text: "du[plicate folder", func: () => dupFolder(folder) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const dupAll = (folder) => {};

  const dupFolder = (folder) => {
    setSystemNotif({ show: false });
    const newFolder = {
      title: folder.title,
      color: folder.color,
      parentFolderId: folder.parentFolderId
    };
    createNewFolder(token, newFolder)
      .then((res) => {
        setAllData((prevData) => {
          const resFolder = res.data.data[0];
          const folderToPush = {
            folderid: resFolder.folderid,
            title: resFolder.foldertitle,
            color: resFolder.foldercolor,
            parentFolderId: resFolder.parentfolderid
          };
          const newData = {
            ...prevData,
            folders: [...prevData.folders, folderToPush]
          };
          return newData;
        });
      })
      .catch((err) => {
        console.log(err);
        const newError = {
          show: true,
          title: "Error duplicating",
          text: err.response.message,
          color: "bg-red-300",
          hasCancel: true,
          actions: [
            { text: "close", func: () => setSystemNotif({ show: false }) },
            { text: "retry", func: () => dupFolder(folder) }
          ]
        };
        setSystemNotif(newError);
      });
  };

  const renameFolder = (folder): void => {
    setFolderToRename(folder);
    setContextMenu({ show: false });
    if (renameRef.current) {
      renameRef.current.focus();
    }
    setTimeout(() => {
      renameRef.current.focus();
    }, 250);
  };

  const handleRename = (e): void => {
    setSystemNotif({ show: false });
    e.preventDefault();
    const newFolder = {
      folderId: folderToRename.folderid,
      title: renameText,
      color: folderToRename.color,
      parentFolderId: folderToRename.parentFolderId
    };
    updateFolder(token, newFolder)
      .then((res) => {
        const resFolder = res.data.data[0];
        const folderToPush = {
          folderid: resFolder.folderid,
          title: resFolder.title,
          color: resFolder.color,
          parentFolderId: resFolder.parentfolderid
        };
        setAllData((prevUser) => {
          const newFolders = prevUser.folders.filter(
            (fold) => fold.folderid !== resFolder.folderid
          );
          newFolders.push(folderToPush);
          const newData = {
            ...prevUser,
            folders: newFolders
          };
          return newData;
        });
        setFolderToRename(null);
        setRenameText("");
      })
      .catch((err) => {
        console.log(err);
        const newError = {
          show: true,
          title: "Error Renaming Folder",
          text: err.response.data.message,
          color: "bg-red-300",
          hasCancel: true,
          actions: [
            { text: "close", func: () => setSystemNotif({ show: false }) },
            { text: "retry", func: () => handleRename(e) }
          ]
        };
        setSystemNotif(newError);
      });
  };

  const changeFolderColor = (folder) => {
    setFolderToChangeColor(folder);
    setContextMenu({ show: false });
  };

  const changeColor = (): void => {
    setSystemNotif({ show: false });
    const newFolder = {
      folderId: folderToChangeColor.folderid,
      title: folderToChangeColor.title,
      color: newColor,
      parentFolderId: folderToChangeColor.parentFolderId
    };
    updateFolder(token, newFolder)
      .then((res) => {
        const resFolder = res.data.data[0];
        const folderToPush = {
          folderid: resFolder.folderid,
          title: resFolder.title,
          color: resFolder.color,
          parentFolderId: resFolder.parentfolderid
        };
        setAllData((prevUser) => {
          const newFolders = prevUser.folders.filter(
            (fold) => fold.folderid !== resFolder.folderid
          );
          newFolders.push(folderToPush);
          const newData = {
            ...prevUser,
            folders: newFolders
          };
          return newData;
        });
        setFolderToChangeColor(false);
        setNewColor(null);
      })
      .catch((err) => {
        console.log(err);
        const newError = {
          show: true,
          title: "Error Renaming Folder",
          text: err.response.data.message,
          color: "bg-red-300",
          hasCancel: true,
          actions: [
            { text: "close", func: () => setSystemNotif({ show: false }) },
            { text: "retry", func: () => handleRename(e) }
          ]
        };
        setSystemNotif(newError);
      });
  };

  const deleteFolder = (folderId: number): void => {
    deleteAFolder(token, folderId)
      .then((res) => {
        const folderIdToDelete = res.data.data[0].folderid;
        const newFolders = allData.folders.filter((fold) => fold.folderid !== folderIdToDelete);
        setAllData((prevData) => {
          const newData = {
            ...prevData,
            folders: newFolders
          };
          return newData;
        });
        setSystemNotif({ show: false });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished attempting to delete a folder");
      });
  };

  const openOptions = (event, folder) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setPosition({ top: clientY, left: clientX });
    const newMenu = {
      show: true,
      meta: {
        title: folder.title,
        color: folder.color
      },
      options: [
        {
          title: "new folder",
          func: () => createNestedFolder(folder)
        },
        {
          title: "new note",
          func: () => createNestedNote(folder)
        },
        {
          title: "move",
          func: () => moveFolder(folder)
        },
        {
          title: "move contents",
          // func: () => moveFolderCOntents(folder.folderid);
          func: () => {}
        },
        {
          title: "duplicate",
          func: () => confirmDup(folder)
        },
        {
          title: "rename",
          func: () => renameFolder(folder)
        },
        {
          title: "change color",
          func: () => changeFolderColor(folder)
        },
        {
          title: "delete",
          func: () => confirmDelete(folder)
        }
      ]
    };
    setContextMenu(newMenu);
  };

  const select = (folderId: number): void => {
    if (selectedForEdit.length === 0) {
      return setSelectedForEdit([folderId]);
    }
    if (selectedForEdit.includes(folderId)) {
      const newSelected = selectedForEdit.filter((id) => id !== folderId);
      return setSelectedForEdit(newSelected);
    }
    setSelectedForEdit((prev) => [...prev, folderId]);
  };

  const onDragStart = (e, folder) => {
    e.preventDefault();
    setFolderDragging(folder);
  };

  const handleDragOver = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Drag over event triggered for folder:", folder);
    setDraggedOverFolder(folder);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragEnd = (e) => {
    e.preventDefault();
    setDragging(false);
    const newConfirmation = {
      show: true,
      title: `Move ${folderDragging.title} to ${draggedOverFolder.title}`,
      text: `Are you sure you want to move your ${folderDragging.title} folder and all of its contents?`,
      color: "bg-cyan-300",
      hasCancel: true,
      actions: [
        { text: "cancel", func: () => cancelMove() },
        { text: "move", func: () => moveFolderAndContents() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const cancelMove = () => {
    setSystemNotif({ show: false });
    setDraggedOverFolder(null);
    setDragging(false);
    setFolderDragging(null);
  };

  const moveFolderAndContents = () => {
    const folderUpdate = {
      ...folderDragging,
      folderId: folderDragging.folderid,
      parentFolderId: draggedOverFolder.folderid
    };
    updateFolder(token, folderUpdate)
      .then((res) => {
        const resFolder = res.data.data[0];
        const folderToPush = {
          title: resFolder.title,
          color: resFolder.color,
          folderid: resFolder.folderid,
          parentFolderId: resFolder.parentfolderid
        };
        setAllData((prevData) => {
          const newFolders = prevData.folders.filter(
            (fold) => fold.folderid !== resFolder.folderid
          );
          newFolders.push(folderToPush);
          const newData = {
            ...prevData,
            folders: newFolders
          };
          return newData;
        });
        setSystemNotif({ show: false });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished moving folder atttempt");
      });
  };

  return (
    <div className="flex flex-wrap justify-start items-start gap-5 w-full mt-5">
      {folders.map((folder: Folder) => (
        <motion.div
          drag
          onDrag={handleDrag}
          dragSnapToOrigin={true}
          whileDrag={{ zIndex: 900, pointerEvents: "none" }}
          onContextMenu={(e) => openOptions(e, folder)}
          onDragStart={(e) => onDragStart(e, folder)}
          onDragEnd={onDragEnd}
          onMouseEnter={(e) => (dragging ? handleDragOver(e, folder) : null)}
          whileHover={!folderToChangeColor && { scale: 1.1 }}
          key={folder.folderid}
          className="relative w-60 h-40 bg-slate-900 rounded-md shadow-lg p-2 flex flex-col justify-between cursor-pointer"
          onClick={() => !edit && !folderToRename && !folderToChangeColor && openFolder(folder)}
        >
          {folderToChangeColor && folderToChangeColor.folderid === folder.folderid && (
            <>
              <div
                className="fixed z-40 inset-0 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderToChangeColor(null);
                }}
              ></div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-[110%] p-3 z-[990] rounded-md shadow-md bg-slate-900"
              >
                <div
                  className={`z-10 absolute top-0 right-0 w-[50%] h-3 rounded-bl-md rounded-tr-md ${newColor} bg-amber-300`}
                ></div>
                <Colors setColor={setNewColor} />
                <button
                  onClick={() => changeColor()}
                  className="py-1 px-3 mt-2 duration-200 hover:bg-slate-700 rounded-md"
                >
                  Change Color on {folderToChangeColor.title}
                </button>
              </motion.div>
            </>
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
            <form onSubmit={handleRename}>
              <input
                ref={renameRef}
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
                <FaCheckCircle className="text-amber-300" />
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
