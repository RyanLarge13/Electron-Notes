import { useContext, useState } from "react";
import { updateNote, updateFolder } from "@renderer/utils/api";
import { useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
// import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { TbFilters } from "react-icons/tb";
import { LuArrowDownWideNarrow, LuArrowUpWideNarrow } from "react-icons/lu";
import { IoMdShare } from "react-icons/io";
import {
  MdCancel,
  MdDelete,
  MdDriveFileMove,
  MdOutlineNoteAdd,
  MdGroupAdd,
  MdSelectAll,
  MdTabUnselected,
  MdNotes
} from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import {
  FaArrowAltCircleDown,
  FaArrowCircleRight,
  FaFolder,
  FaFolderPlus,
  FaHome,
  FaPlus
} from "react-icons/fa";
import { deleteMultipleFolders, moveManyFolders } from "@renderer/utils/api";
import { AllData, Folder, Note } from "@renderer/types/types";
import Folders from "@renderer/components/Folders";
import Header from "@renderer/components/Header";
import Notes from "@renderer/components/Notes";
import UserContext from "@renderer/contexxt/UserContext";
import NoteView from "@renderer/components/NoteView";
import Menu from "@renderer/components/Menu";
import Settings from "@renderer/components/Settings";
import Tree from "@renderer/components/Tree";
import Colors from "@renderer/components/Colors";
import { BsArrowReturnRight, BsArrowRight } from "react-icons/bs";
// import Connections from "@renderer/components/Connections";
// import ConBubbles from "@renderer/components/ConBubbles";

const Account = (): JSX.Element => {
  const {
    setNesting,
    setFilter,
    setAllData,
    setOrder,
    setSelectedForEdit,
    setEditCurrentFolder,
    setSelectedFolder,
    setEdit,
    setMove,
    setFolder,
    setSystemNotif,
    setCreateCon,
    setHoverConnections,
    hoverConnections,
    // createCon,
    token,
    edit,
    editCurrentFolder,
    selectedForEdit,
    selectedFolder,
    settings,
    move,
    nesting,
    folder,
    order,
    allData,
    mainTitle,
    note,
    notes,
    folders,
    menu,
    filter,
    userPreferences
  } = useContext(UserContext);

  const [filterOptions, setFilterOptions] = useState(false);
  const [options, setOptions] = useState(false);
  const [conOptions, setConOptions] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(folder ? folder.color : "bg-amber-300");

  const navigate = useNavigate();
  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const addNewFolder = (): void => {
    navigate("/newfolder");
  };

  const addNewNote = (): void => {
    navigate("/newnote");
  };

  const cancelEdit = (): void => {
    setSelectedForEdit([]);
    setEdit(false);
  };

  const moveAllSelected = (): void => {
    const foldersToMove = allData.folders.map((fold: Folder) => {
      if (selectedForEdit.some((id) => id === fold.folderid)) {
        return fold;
      }
    });
    setMove({
      isMoving: true,
      from: folder ? folder.folderid : null,
      itemTitle: "Many",
      item: foldersToMove,
      type: "many"
    });
  };

  const moveMultipleFolders = (): void => {
    setAllData((prevData: AllData): AllData => {
      const newFolders = prevData.folders.map((fold: Folder) => {
        if (!selectedForEdit.some((id) => id === fold.folderid)) {
          return fold;
        } else {
          return {
            ...fold,
            parentFolderId: selectedFolder ? selectedFolder.folderid : null
          };
        }
      });
      const newData = {
        ...prevData,
        folders: newFolders
      };
      return newData;
    });
    setMove({
      isMoving: false,
      from: "",
      itemTitle: "",
      item: null,
      type: ""
    });
    setEdit(false);
    moveManyFolders(token, selectedForEdit, selectedFolder ? selectedFolder.folderid : null)
      .then(() => {
        setSelectedForEdit([]);
        setSelectedFolder(null);
        if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
          const newSuccess = {
            show: true,
            title: "Moved Folders",
            text: "Successfully moved your folders",
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
        // Handle the failed case on the server side to revert the changes made to the moved contents
      });
  };

  const deleteAllSelected = (): void => {
    setAllData((prevData) => {
      const newFoldersArray = prevData.folders.filter(
        (fold: Folder) => !selectedForEdit.includes(fold.folderid)
      );
      const newData = { ...prevData, folders: newFoldersArray };
      return newData;
    });
    const temp = allData.folders.filter((fold: Folder) =>
      selectedForEdit.some((foldId: string) => fold.folderid === foldId)
    );
    setEdit(false);
    deleteMultipleFolders(token, selectedForEdit)
      .then((res) => {
        if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
          const deletedFoldersString = temp.map((fold: Folder) => `${fold.title}`).join("\n");
          const newSuccess = {
            show: true,
            title: "Successfully Deleted",
            text: `Deleted folders: \n ${deletedFoldersString} \n\n ${res.data.message}`,
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
        setSelectedForEdit([]);
      })
      .catch((err) => {
        console.log(err);
        setAllData((prevData) => {
          const newFoldersArray = [...prevData.folders, ...temp];
          const newData = { ...prevData, folders: newFoldersArray };
          return newData;
        });
        if (err.response) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            const newError = {
              show: true,
              title: "Issues Deleting Folders",
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
                { text: "re-try", func: () => deleteAllSelected() },
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
                { text: "re-try", func: () => deleteAllSelected() },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
      });
  };

  const undoMove = (): void => {};

  const moveItem = (): void => {
    if (move.type === "note") {
      const noteMoving = move.item[0];
      const prevIdFolderId = noteMoving.folderId;
      const newNote = {
        notesId: noteMoving.noteid,
        htmlNotes: noteMoving.htmlText,
        locked: noteMoving.locked,
        title: noteMoving.title,
        folderId: selectedFolder ? selectedFolder.folderid : null
      };
      setAllData((prevUser) => {
        const newNotes = prevUser.notes.map((note: Note) => {
          if (note.noteid === noteMoving.noteid) {
            return { ...note, folderId: selectedFolder ? selectedFolder.folderid : null };
          }
          return note;
        });
        const newData = {
          ...prevUser,
          notes: newNotes
        };
        return newData;
      });
      setMove(null);
      setSelectedFolder(null);
      updateNote(token, newNote)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Successfully Moved",
              text: `${move.item.title} was successfully moved to ${
                selectedFolder ? selectedFolder.title : "home"
              }`,
              color: "bg-green-300",
              hasCancel: false,
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
                { text: "undo", func: () => undoMove() }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevUser) => {
            const newNotes = prevUser.notes.map((note) => {
              if (note.noteid === noteMoving.noteid) {
                return { ...note, folderId: prevIdFolderId };
              }
              return note;
            });
            const newData = {
              ...prevUser,
              notes: newNotes
            };
            return newData;
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Moving Note",
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
                  { text: "re-try", func: () => moveItem() },
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
                  { text: "re-try", func: () => moveItem() },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    }
    if (move.type === "folder") {
      const folderMoving = move.item[0];
      const prevIdFolderId = folderMoving.folderid;
      const newFolder = {
        folderId: folderMoving.folderid,
        title: folderMoving.title,
        color: folderMoving.color,
        parentFolderId: selectedFolder ? selectedFolder.folderid : null
      };
      setAllData((prevUser) => {
        const newFolders = prevUser.folders.map((fold) => {
          if (fold.folderid === folderMoving.folderid) {
            const updatedFold = {
              ...fold,
              parentFolderId: selectedFolder ? selectedFolder.folderid : null
            };
            return updatedFold;
          }
          return fold;
        });
        const newData = {
          ...prevUser,
          folders: newFolders
        };
        return newData;
      });
      setMove(null);
      updateFolder(token, newFolder)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Successfully Moved",
              text: `${move.item.title} was successfully moved to ${
                selectedFolder ? selectedFolder.title : "home"
              }`,
              color: "bg-green-300",
              hasCancel: false,
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
                { text: "undo", func: () => undoMove() }
              ]
            };
            setSystemNotif(newSuccess);
          }
          setSelectedFolder(null);
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevUser) => {
            const newFolders = prevUser.folders.map((fold: Folder) => {
              if (fold.folderid === folderMoving.folderid) {
                return { ...fold, folderid: prevIdFolderId };
              }
              return fold;
            });
            const newData = {
              ...prevUser,
              folders: newFolders
            };
            return newData;
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
                  { text: "re-try", func: () => moveItem() },
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
                  { text: "re-try", func: () => moveItem() },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    }
  };

  const editMyFolder = (): void => {
    const prevTitle = folder.title;
    const prevColor = folder.color;
    const folderUpdate = {
      folderId: folder.folderid,
      title: newTitle,
      color: newColor,
      parentFolderId: folder.parentFolderId
    };
    setAllData((prevData) => {
      const newFolders = prevData.folders.map((fold) => {
        if (fold.folderid === folder.folderid) {
          return { ...fold, title: newTitle, color: newColor };
        }
        return fold;
      });
      const newData = {
        ...prevData,
        folders: newFolders
      };
      return newData;
    });
    setFolder({ ...folder, title: newTitle, color: newColor });
    setEditCurrentFolder(false);
    updateFolder(token, folderUpdate)
      .then((res) => {
        const resFolder = res.data.data[0];
        const folderToPush = {
          title: resFolder.title,
          color: resFolder.color,
          folderid: resFolder.folderid,
          parentFolderId: resFolder.parentfolderid
        };
        setNewTitle("");
        setNesting((prev) => {
          const nestCopy = [...prev];
          nestCopy.pop();
          nestCopy.push({ title: folderToPush.title, id: folderToPush.folderid });
          return nestCopy;
        });
      })
      .catch((err) => {
        console.log(err);
        setAllData((prevData) => {
          const newFolders = prevData.folders.map((fold) => {
            if (fold.folderid === folder.folderid) {
              return { ...fold, title: prevTitle, color: prevColor };
            }
            return fold;
          });
          const newData = {
            ...prevData,
            folders: newFolders
          };
          return newData;
        });
        setFolder({ ...folder, title: prevTitle, color: prevColor });
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
                { text: "re-try", func: () => editMyFolder() },
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
                { text: "re-try", func: () => editMyFolder() },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
      });
  };

  const navigateFolder = (folderId: string, index: number): void => {
    const folderToSet = allData.folders.filter((fold: Folder) => fold.folderid === folderId)[0];
    setNesting((prev) => {
      const length = nesting.length;
      const diff = length - index + 1;
      const copyArr = [...prev];
      copyArr.splice(index + 1, diff);
      return copyArr;
    });
    setFolder(folderToSet);
  };

  const selectAllFolders = (): void => {
    const allFolders = folders.map((fold) => fold.folderid);
    setSelectedForEdit(allFolders);
  };

  return (
    <section className="flex justify-center items-center flex-col pt-20 mx-10 lg:mx-60">
      {nesting.length > 0 && (
        <div className="flex justify-end items-center font-semibold gap-x-3 fixed top-5 left-5">
          {nesting.map((folderMeta: { title: string; id: string }, index: number) => (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              key={index}
              className="text-xs inline whitespace-nowrap"
              onClick={() => navigateFolder(folderMeta.id, index)}
            >
              {folderMeta.title}
            </motion.button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {edit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            exit={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-5 left-5 padding-3 z-50 ${
              userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
            } rounded-md shadow-md flex justify-evenly items-center gap-3`}
          >
            <button
              onClick={() => cancelEdit()}
              className={`flex justify-between items-center text-xs p-3 ${
                userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
              } duration-200 w-40`}
            >
              Cancel
              <MdCancel />
            </button>
            <button
              onClick={() => selectAllFolders()}
              className={`flex justify-between items-center text-xs p-3 ${
                userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
              } duration-200 w-40`}
            >
              Select All
              <MdSelectAll />
            </button>
            {selectedForEdit.length > 0 && (
              <button
                onClick={() => setSelectedForEdit([])}
                className={`flex justify-between items-center text-xs p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-40`}
              >
                Un-Select All
                <MdTabUnselected />
              </button>
            )}
            {selectedForEdit.length > 0 && (
              <>
                <button
                  onClick={() => deleteAllSelected()}
                  className={`flex justify-between items-center text-xs p-3 ${
                    userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                  } duration-200 w-40`}
                >
                  {selectedForEdit.length < 2 ? "Delete" : "Delete All"}
                  <MdDelete />
                </button>
                <button
                  onClick={() => moveAllSelected()}
                  className={`flex justify-between items-center text-xs p-3 ${
                    userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                  } duration-200 w-40`}
                >
                  {selectedForEdit.length < 2 ? "Move" : "Move All"}
                  <MdDriveFileMove />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {editCurrentFolder ? (
        <input
          placeholder={mainTitle}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="text-3xl font-semibold focus:outline-none text-white text-center bg-transparent"
          autoFocus={true}
        />
      ) : (
        <h2 className="text-3xl font-semibold">{mainTitle}</h2>
      )}
      <div className="mt-3">
        <p className="font-semibold">
          {folders.length} {folders.length === 1 ? "folder" : "folders"}, {notes.length}{" "}
          {notes.length === 1 ? "note" : "notes"}
        </p>
      </div>
      {editCurrentFolder && (
        <div>
          <Colors setColor={setNewColor} />
          <div className={`${newColor} w-full h-1 rounded-md mt-2`}></div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setEditCurrentFolder(false)}
              className="hover:text-slate-200 duration-200"
            >
              Cancel
            </button>
            <button onClick={() => editMyFolder()} className="hover:text-slate-200 duration-200">
              Submit
            </button>
          </div>
        </div>
      )}
      <Header />
      <Folders />
      <div className="flex justify-end items-center w-full mt-5 gap-x-3 relative">
        {filterOptions && (
          <>
            <div
              onClick={() => setFilterOptions(false)}
              className="fixed bg-transparent inset-0"
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
              } z-40 rounded-md shadow-md absolute top-0 right-5 flex flex-col justify-between items-start w-40 text-sm`}
            >
              <button
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Title");
                  userPreferences.filter = "Title";
                  try {
                    localStorage.setItem("preferences", JSON.stringify(userPreferences));
                  } catch (err) {
                    console.log(err);
                    setSystemNotif({
                      show: true,
                      title: "Saving Settings",
                      text: "We ran into an error when trying to update the filter option in your settings. Please reload the application and try again to save your settings and if the error persists contact the developer at ryanlarge@ryanlarge.dev",
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
                    });
                  }
                }}
              >
                Title
              </button>
              <button
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Date");
                  userPreferences.filter = "Date";
                  try {
                    localStorage.setItem("preferences", JSON.stringify(userPreferences));
                  } catch (err) {
                    console.log(err);
                    setSystemNotif({
                      show: true,
                      title: "Saving Settings",
                      text: "We ran into an error when trying to update the filter option in your settings. Please reload the application and try again to save your settings and if the error persists contact the developer at ryanlarge@ryanlarge.dev",
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
                    });
                  }
                }}
              >
                Date
              </button>
              <button
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Updated");
                  userPreferences.filter = "Update";
                  try {
                    localStorage.setItem("preferences", JSON.stringify(userPreferences));
                  } catch (err) {
                    console.log(err);
                    setSystemNotif({
                      show: true,
                      title: "Saving Settings",
                      text: "We ran into an error when trying to update the filter option in your settings. Please reload the application and try again to save your settings and if the error persists contact the developer at ryanlarge@ryanlarge.dev",
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
                    });
                  }
                }}
              >
                Updated
              </button>
            </motion.div>
          </>
        )}
        <button
          onClick={() => setFilterOptions((prev) => !prev)}
          className="flex justify-start items-center gap-x-1"
        >
          <TbFilters />
          <p>{filter}</p>
        </button>
        <button onClick={() => setOrder((prev) => !prev)}>
          {order ? <LuArrowDownWideNarrow /> : <LuArrowUpWideNarrow />}
        </button>
      </div>
      <Notes />
      {/* <div className="hover:bg-rose-200 hover:bg-red-200 hover:bg-amber-200 hover:bg-yellow-200 hover:bg-lime-200 hover:bg-green-200 hover:bg-cyan-200 hover:bg-sky-200 hover:bg-blue-200 hover:bg-indigo-200 hover:bg-violet-200 hover:bg-fuchsia-200 hover:bg-pink-200"></div> */}
      <div
        className="bg-transparent"
        onMouseLeave={() => {
          if (hoverConnections) {
            setTimeout(() => {
              setHoverConnections(false);
            }, 250);
          }
        }}
      >
        {/* <button
          onMouseEnter={() => {
            setTimeout(() => {
              setHoverConnections(true);
            }, 750);
          }}
          className={`fixed top-3 right-3 rounded-full ${
            userPreferences.theme ? themeStringText : "text-amber-300"
          } ${
            userPreferences.darkMode
              ? "bg-slate-600 hover:bg-slate-500"
              : "bg-slate-300 hover:bg-slate-400"
          } duration-200 w-10 h-10 flex justify-center items-center shadow-sm z-[999]`}
          onClick={() => setConOptions((prev) => !prev)}
        >
          <AiOutlineUsergroupAdd />
        </button> */}
        {/* <ConBubbles /> */}
      </div>
      {conOptions && (
        <>
          <div onClick={() => setConOptions(false)} className="fixed bg-transparent inset-0"></div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-md shadow-md fixed top-10 right-10 ${
              userPreferences.darkMode ? "bg-slate-700" : "bg-slate-200"
            } flex flex-col justify-center items-center font-bold w-40`}
          >
            <button
              className={`flex justify-between items-center w-full py-3 px-4 ${
                userPreferences.darkMode ? "hover:bg-slate-600" : "hover:bg-slate-300"
              }`}
              onClick={() => {
                setConOptions(false);
                setCreateCon(true);
              }}
            >
              Connect
              <MdGroupAdd />
            </button>
            <button
              className={`flex justify-between items-center w-full py-3 px-4 ${
                userPreferences.darkMode ? "hover:bg-slate-600" : "hover:bg-slate-300"
              }`}
              onClick={() => {
                setConOptions(false);
                // addNewNote();
              }}
            >
              Share Note
              <IoMdShare />
            </button>
          </motion.div>
        </>
      )}
      <button
        className={`fixed bottom-3 right-3 rounded-full ${
          userPreferences.theme ? themeStringText : "text-amber-300"
        } ${
          userPreferences.darkMode
            ? "bg-slate-600 hover:bg-slate-500"
            : "bg-slate-300 hover:bg-slate-400"
        } duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
        onClick={() => setOptions((prev) => !prev)}
      >
        <FiEdit />
      </button>
      {options && (
        <>
          <div onClick={() => setOptions(false)} className="fixed bg-transparent inset-0"></div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-md shadow-md fixed bottom-10 right-10 ${
              userPreferences.darkMode ? "bg-slate-700" : "bg-slate-200"
            } flex flex-col justify-center items-center font-bold w-40`}
          >
            <button
              className={`flex justify-between items-center w-full py-3 px-4 ${
                userPreferences.darkMode ? "hover:bg-slate-600" : "hover:bg-slate-300"
              }`}
              onClick={() => {
                setOptions(false);
                addNewFolder();
              }}
            >
              New Folder
              <FaFolderPlus />
            </button>
            <button
              className={`flex justify-between items-center w-full py-3 px-4 ${
                userPreferences.darkMode ? "hover:bg-slate-600" : "hover:bg-slate-300"
              }`}
              onClick={() => {
                setOptions(false);
                addNewNote();
              }}
            >
              New Note
              <MdOutlineNoteAdd />
            </button>
          </motion.div>
        </>
      )}
      {note && <NoteView />}
      {menu && <Menu />}
      {settings && <Settings />}
      {/* {createCon && <Connections />} */}
      {move && move.isMoving && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed z-[990] inset-0 bg-black backdrop-blur-sm bg-opacity-20"
            onClick={() => setMove(null)}
          ></motion.div>
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`fixed z-[999] right-0 top-0 w-[80%] lg:w-[30%] p-5 rounded-l-md overflow-y-auto no-scroll-bar bottom-0 ${userPreferences.darkMode ? "bg-slate-900" : "bg-slate-300"} `}
          >
            <Tree
              moving={true}
              folders={allData.folders.filter((fold) => fold.folderid !== move.from)}
              // folders={allData.folders.filter((fold) => move.from.some((f) => f !== fold.folderid))}
              parentId={null}
              level={0}
              open={{ item: { title: null } }}
            />
            <div className="flex justify-center items-center gap-x-5">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`p-2 mt-3 flex justify-center items-center shadow-md flex-1 gap-x-3 rounded-md text-black ${userPreferences.theme}`}
              >
                Move <FaHome />
              </button>
              <button
                onClick={() => navigate("/newfolder")}
                className="p-2 mt-3 rounded-md bg-amber-300 shadow-md flex-1 hover:bg-amber-200 text-black duration-200 flex justify-center items-center gap-x-2"
              >
                Create Folder <FaPlus />
              </button>
            </div>
            <div className="mt-5">
              <div className="flex justify-start items-center gap-x-2">
                <FaFolder className="inline" /> {folder ? folder.title : "Home"}
              </div>
              <div className="ml-2 flex justify-start items-center gap-x-2">
                <BsArrowReturnRight className="inline" />{" "}
                {move.type === "folder" || move.type === "many" ? <FaFolder /> : <MdNotes />}
                {move.itemTitle}
                <BsArrowRight className="inline" />
                <FaFolder />
                {selectedFolder ? selectedFolder.title : "Home"}
              </div>
              <button
                onClick={() => (move.type === "many" ? moveMultipleFolders() : moveItem())}
                className="py-2 px-3 w-full mt-3 rounded-md bg-green-300 shadow-md text-black hover:bg-green-200 duration-200 flex justify-center items-center gap-x-2"
              >
                Move <FaArrowCircleRight />
              </button>
            </div>
          </motion.div>
        </>
      )}
      <Outlet />
    </section>
  );
};
export default Account;
