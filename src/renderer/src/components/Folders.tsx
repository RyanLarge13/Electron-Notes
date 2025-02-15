import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
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
  FaRegCopy,
  FaWindowClose
} from "react-icons/fa";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import UserContext from "@renderer/contexxt/UserContext";
import { AllData, Folder, Note } from "@renderer/types/types";
import {
  createNewFolder,
  createNewNote,
  deleteAFolder,
  duplicateMultipleContents,
  updateFolder
} from "@renderer/utils/api";
import {
  createCopiesOfFoldersAndNotes,
  generateMockNotes,
  organizeNotesAndFolders
} from "@renderer/utils/helpers";

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
    showErrorNotification,
    confirmOperationNotification
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
        (refData: Folder) => refData && refData.title && refData?.title?.includes(search)
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

  // Network request and state logic --------------------------------------------------------------------
  const createNestedNote = async (folder: Folder): Promise<void> => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const resetState = (): void => {
      setAllData((prevData) => {
        const newNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
        return { ...prevData, notes: newNotes };
      });
      setNote(null);
    };
    const tempId = uuidv4();

    const { newNote, noteToPush } = generateMockNotes(folder, tempId);

    try {
      // Immediately update state
      setAllData((prevData: AllData) => {
        const newData = {
          ...prevData,
          notes: [...prevData.notes, noteToPush]
        };
        return newData;
      });
      setFolder(folder);
      setNote((prev: Note[]): Note[] => [...prev, noteToPush]);

      const response = await createNewNote(token, newNote);

      const resNote = response.data.data[0];

      setAllData((prevData) => {
        const newNotes = prevData.notes.map((aNote) => {
          if (aNote.noteid === tempId) {
            return { ...aNote, noteid: resNote.notesid };
          }
          return aNote;
        });
        return { ...prevData, notes: newNotes };
      });

      showSuccessNotification(
        "Note Created",
        `Note ${resNote.title} was created successfully`,
        false,
        []
      );
    } catch (err) {
      console.log(err);
      // Reset state
      resetState();
      if (err.request) {
        networkNotificationError([]);
        return;
      }
      if (err.response) {
        showErrorNotification("Creating Note", err.response.message, true, []);
        return;
      }
      showErrorNotification(
        "Creating Note",
        "We encountered a problem creating your note. If this issue persists, please contact the developer",
        true,
        []
      );
    }
  };

  const dupAll = (folder: Folder): void => {
    resetSystemNotification();

    const oldFolders = allData.folders;
    const oldNotes = allData.notes;

    const { copyFolders, copyNotes } = createCopiesOfFoldersAndNotes(
      folder,
      allData.folders,
      allData.notes
    );

    const continueRequest = async (): Promise<void> => {
      try {
        // Immediately update state
        setAllData((prev) => {
          const newData = {
            ...prev,
            folders: [...prev.folders, ...copyFolders],
            notes: [...prev.notes, ...copyNotes]
          };
          return newData;
        });

        const response = await duplicateMultipleContents(token, copyFolders, copyNotes);
        const updatedData = response.data.data;
        const { newFoldersArray, newNotesArray } = organizeNotesAndFolders(updatedData);

        // Update the local state with the server data to make sure ID's match correctly for
        // Future updating
        setAllData((prev) => {
          return {
            ...prev,
            folders: [...oldFolders, ...newFoldersArray],
            notes: [...oldNotes, ...newNotesArray]
          };
        });
        showSuccessNotification("Duplicated All Content", response.data.message, true, []);
      } catch (err) {
        console.log(err);

        // Reset state immediately
        setAllData((prev) => {
          return {
            ...prev,
            folders: oldFolders,
            notes: oldNotes
          };
        });

        if (err.request) {
          networkNotificationError([]);
          return;
        }
        if (err.response) {
          showErrorNotification("Duplicating Content", err.response.message, true, []);
          return;
        }
        showErrorNotification(
          "Duplicating Content",
          "We ran into an issue duplicating your content. Try again and if this issue persists. Please contact the developer",
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Duplicate All Content",
      `Are you sure you want to duplicate all of the contents of this folder? This could take a while`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
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

    const continueRequest = async (): Promise<void> => {
      try {
        // Immediately update state
        setAllData((prevData: AllData) => {
          const newFolders = [...prevData.folders, { ...newFolder, folderid: tempId }];
          return { ...prevData, folders: newFolders };
        });

        const response = await createNewFolder(token, newFolder);
        const newId = response.data.data[0].folderid;

        // Update new folder state with db ID for future updates
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
          []
        );
      } catch (err) {
        console.log(err);

        // Immediately revert state on failure
        setAllData((prevData) => {
          const updatedFolders = prevData.folders.filter((fold) => fold.folderid !== tempId);
          return {
            ...prevData,
            folders: updatedFolders
          };
        });
        if (err.response) {
          showErrorNotification("Duplicating Folder", err.response.message, true, []);
          return;
        }
        if (err.request) {
          networkNotificationError([]);
          return;
        }
        showErrorNotification(
          "Duplicating Folder",
          "We ran into an issue duplicating your folder. If this continues to happen, please contact the developer",
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Duplicate Folder",
      `Are you sure you want to duplicate this folder? ${folder.title || ""}?`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  const handleRename = async (e): Promise<void> => {
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
      // Immediately update state
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

      await updateFolder(token, newFolder);
      showSuccessNotification("Folder Re-named", "Successfully re-named your folder", false, []);
    } catch (err) {
      // Immediately reset state
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
      console.log(err);
      if (err.response) {
        showErrorNotification("Re-Naming Folder", err.response.message, true, []);
        return;
      }
      if (err.request) {
        networkNotificationError([]);
        return;
      }
      showErrorNotification(
        "Re-naming Folder",
        "There was an issue re-naming your folder. Try again and if this issue persists, please contact the developer",
        true,
        []
      );
    }
  };

  const changeColor = async (): Promise<void> => {
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
      // Immediately update state
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

      await updateFolder(token, newFolder);

      showSuccessNotification("New Color", "Your folder color is now updated", false, [
        { text: "undo", func: (): void => {} }
      ]);
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
      if (err.response) {
        showErrorNotification("Updating Folder", err.response.message, true, [
          { text: "reload app", func: () => window.location.reload() }
        ]);
        return;
      }
      if (err.request) {
        networkNotificationError([{ text: "reload app", func: () => window.location.reload() }]);
        return;
      }
      showErrorNotification(
        "Updating Folder",
        "There was an issue updating the color on your folder. Please try again and if the issue persists, contact the developer",
        true,
        []
      );
    }
  };

  const deleteFolder = (folderId: string): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const oldFolder = allData.folders.filter((fold) => fold.folderid == folderId)[0];

    const continueRequest = async (): Promise<void> => {
      resetSystemNotification();
      try {
        // Immediately update the state
        setAllData((prevData) => {
          const newFolders = prevData.folders.filter((fold) => fold.folderid !== folderId);
          return { ...prevData, folders: newFolders };
        });
        await deleteAFolder(token, folderId);
        showSuccessNotification(
          "Folder Deleted",
          `Successfully deleted ${oldFolder.title || "your folder"}`,
          false,
          []
        );
      } catch (err) {
        console.log(err);
        // reset the state to contain the original folder
        setAllData((prevData) => {
          const newFolders = [...prevData.folders, oldFolder];
          return {
            ...prevData,
            folders: newFolders
          };
        });

        if (err.request) {
          networkNotificationError([]);
          return;
        }
        if (err.response) {
          showErrorNotification("Deleting Folder", err.response.message, true, []);
          return;
        }
        showErrorNotification(
          "Deleting Folder",
          `We ran into issues deleting ${oldFolder.title}. If this issue persists, please contact the developer`,
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Delete Folder",
      `Are you sure you want to delete ${oldFolder.title || "this folder"}?`,
      [{ text: "delete", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  const moveFolderAndContents = (): void => {
    resetSystemNotification();
    const folderUpdate = {
      ...folderDragging,
      folderId: folderDragging.folderid,
      parentFolderId: draggedOverFolder.folderid
    };

    const continueRequest = async (): Promise<void> => {
      try {
        // Immediately update state
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

        await updateFolder(token, folderUpdate);

        showSuccessNotification("Moved Folder", "Successfully moved your folder", false, []);
        setFolderDragging(null);
        setDraggedOverFolder(null);
      } catch (err) {
        console.log(err);

        // Immediately update state
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
          return;
        }
        if (err.request) {
          networkNotificationError([
            { text: "re-try", func: () => moveFolderAndContents() },
            { text: "reload app", func: () => window.location.reload() }
          ]);
          return;
        }
        showErrorNotification(
          "Moving Folder",
          "There were issues moving your folder. Please try again and if the issue persists, contact the developer",
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Move Folder",
      `Are you sure you want to move your folder ${folderDragging.title || ""}?`,
      [
        {
          text: "confirm",
          func: (): Promise<void> => continueRequest()
        }
      ],
      continueRequest
    );
  };
  // Network request and state logic --------------------------------------------------------------------

  // Folder context menu --------------------------------------------------------------------------------
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
          title: "open",
          icon: <BiSend />,
          func: (): void => {
            setFolder(folder);
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
          }
        },
        {
          title: "new folder",
          icon: <FaFolderPlus />,
          func: (): void => createNestedFolder(folder)
        },
        {
          title: "new note",
          icon: <FaPlusSquare />,
          func: (): Promise<void> => createNestedNote(folder)
        },
        {
          title: "move",
          icon: <FaArrowCircleRight />,
          func: (): void => moveFolder(folder)
        },
        {
          title: "duplicate all",
          icon: <FaCopy />,
          func: (): void => dupAll(folder)
        },
        {
          title: "duplicate folder",
          icon: <FaRegCopy />,
          func: (): void => dupFolder(folder)
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
          func: (): void => deleteFolder(folder.folderid)
        }
      ]
    };
    setContextMenu(newMenu);
  };
  // Folder context menu --------------------------------------------------------------------------------

  // Helpers -------------------------------------------------------------------------------
  const moveFolder = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setMove({
      isMoving: true,
      from: folder.folderid,
      itemTitle: folder.title,
      item: [folder],
      type: "folder"
    });
  };

  const openFolder = (folder: Folder): void => {
    setNesting((prev) => [...prev, { title: folder.title, id: folder.folderid }]);
    setNotes([]);
    setFolder(folder);
    const newPreferences = {
      ...userPreferences,
      savedFolder: folder.folderid
    };
    setUserPreferences(newPreferences);

    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
    }
  };

  const createNestedFolder = (folder: Folder): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setSelectedFolder(folder);
    navigate("/newfolder");
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

  const changeFolderColor = (folder: Folder): void => {
    setFolderToChangeColor(folder);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
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

  const listenForRenameCancel = (e): void => {
    if (e.key === "Escape" || e.key === "Delete") {
      setRenameText("");
      setFolderToRename(null);
    }
  };
  // Helpers -------------------------------------------------------------------------------

  // Handling folder drag logic -----------------------------------------------------
  const handleNoteDrag = (folder): void => {
    if (noteIsMoving) {
      return;
    }
    if (noteDrag && noteDragging !== null) {
      setNoteDragFolder(folder);
    }
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

    const cancelMove = (): void => {
      setDraggedInto("");
      resetSystemNotification();
      setDraggedOverFolder(null);
      setDragging(false);
      setFolderDragging(null);
    };

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

    confirmOperationNotification(
      `Move ${folderDragging.title} to ${draggedOverFolder.title}`,
      `Are you sure you want to move your ${folderDragging.title} folder and all of its contents?`,
      [{ text: "move", func: (): void => moveFolderAndContents() }],
      moveFolderAndContents
    );
  };
  // Handling folder drag logic -----------------------------------------------------

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
                userPreferences.darkMode ? "bg-[#333]" : "bg-slate-200"
              }`}
              // onClick={(e) => {
              //   e.stopPropagation();
              //   setFolderToChangeColor(null);
              // }}
            >
              <Colors setColor={setNewColor} />
              <button
                onClick={() => changeColor()}
                className={`py-1 px-3 mt-3 duration-200 ${newColor} rounded-md text-black`}
              >
                Change Color &rarr;
              </button>
            </motion.div>
          )}
          <div
            className={`z-10 absolute top-0 right-0 w-[50%] shadow-md h-3 rounded-bl-md rounded-tr-md ${folder.color} bg-amber-300`}
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
