import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Folder } from "@renderer/types/types";
import { createNewNote, updateFolder } from "@renderer/utils/api";
import { CiFolderOn } from "react-icons/ci";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { deleteAFolder } from "@renderer/utils/api";
import { FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";
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
    setDraggedOverFolder
  } = useContext(UserContext);

  const [dragging, setDragging] = useState(false);
  const [folderDragging, setFolderDragging] = useState(null);

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
          func: () => {}
        },
        {
          title: "move contents",
          func: () => {}
        },
        {
          title: "duplicate",
          func: () => {}
        },
        {
          title: "rename",
          func: () => {}
        },
        {
          title: "change color",
          func: () => {}
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
          whileHover={{ scale: 1.1 }}
          key={folder.folderid}
          className="relative w-60 h-40 bg-slate-900 rounded-md shadow-lg p-2 flex flex-col justify-between cursor-pointer"
          onClick={() => !edit && openFolder(folder)}
        >
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
          <p className="font-semibold">{folder.title}</p>
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
