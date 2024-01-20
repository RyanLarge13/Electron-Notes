import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbFilters } from "react-icons/tb";
import { LuArrowDownWideNarrow, LuArrowUpWideNarrow } from "react-icons/lu";
import { updateNote, updateFolder } from "@renderer/utils/api";
import { FiEdit } from "react-icons/fi";
import { FaFolderPlus, FaHome } from "react-icons/fa";
import { MdCancel, MdDelete, MdDriveFileMove, MdOutlineNoteAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { deleteMultipleFolders } from "@renderer/utils/api";
import { Folder } from "@renderer/types/types";
import Folders from "@renderer/components/Folders";
import Header from "@renderer/components/Header";
import Notes from "@renderer/components/Notes";
import UserContext from "@renderer/contexxt/UserContext";
import NoteView from "@renderer/components/NoteView";
import Menu from "@renderer/components/Menu";
import Settings from "@renderer/components/Settings";
import Tree from "@renderer/components/Tree";
import Colors from "@renderer/components/Colors";

const Account = (): JSX.Element => {
  const {
    mainTitle,
    note,
    notes,
    folders,
    menu,
    filter,
    setNesting,
    setFilter,
    folder,
    order,
    allData,
    setAllData,
    token,
    setOrder,
    edit,
    selectedForEdit,
    setSelectedForEdit,
    editCurrentFolder,
    setEditCurrentFolder,
    selectedFolder,
    setSelectedFolder,
    setEdit,
    settings,
    move,
    setMove,
    nesting,
    setFolder
  } = useContext(UserContext);

  const [filterOptions, setFilterOptions] = useState(false);
  const [options, setOptions] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(folder ? folder.color : "bg-amber-300");

  const navigate = useNavigate();

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

  const moveAllSelected = (): void => {};

  const deleteAllSelected = (): void => {
    deleteMultipleFolders(token, selectedForEdit)
      .then(() => {
        setAllData((prevData) => {
          const newFoldersArray = prevData.folders.filter(
            (fold: Folder) => !selectedForEdit.includes(fold.folderid)
          );
          const newData = { ...prevData, folders: newFoldersArray };
          return newData;
        });
        setSelectedForEdit([]);
        setEdit(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Attempted to delete multiple folders");
      });
  };

  const moveItem = (): void => {
    if (move.type === "note") {
      const noteMoving = move.item;
      const newNote = {
        notesId: noteMoving.noteid,
        htmlNotes: noteMoving.htmlText,
        locked: noteMoving.locked,
        title: noteMoving.title,
        folderId: selectedFolder ? selectedFolder.folderid : null
      };
      updateNote(token, newNote)
        .then((res) => {
          const resNote = res.data.data[0];
          const noteToPush = {
            title: resNote.title,
            createdAt: resNote.createdat,
            noteid: resNote.notesid,
            htmlText: resNote.htmlnotes,
            locked: resNote.locked,
            folderId: resNote.folderid
          };
          setAllData((prevUser) => {
            const newNotes = prevUser.notes.filter((note) => note.noteid !== resNote.notesid);
            newNotes.push(noteToPush);
            const newData = {
              ...prevUser,
              notes: newNotes
            };
            return newData;
          });
          setMove(null);
          setSelectedFolder(null);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (move.type === "folder") {
      const folderMoving = move.item;
      const newFolder = {
        folderId: folderMoving.folderid,
        title: folderMoving.title,
        color: folderMoving.color,
        parentFolderId: selectedFolder ? selectedFolder.folderid : null
      };
      updateFolder(token, newFolder)
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
          setMove(null);
          setSelectedFolder(null);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          console.log("Finished moving folder attempt");
        });
    }
  };

  const editMyFolder = (): void => {
    const folderUpdate = {
      folderId: folder.folderid,
      title: newTitle,
      color: newColor,
      parentFolderId: folder.parentFolderId
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
        setNewTitle("");
        setNewColor(folderToPush.color);
        setFolder(folderToPush);
        setNesting((prev) => {
          const nestCopy = [...prev];
          nestCopy.pop();
          nestCopy.push({ title: folderToPush.title, id: folderToPush.folderid });
          return nestCopy;
        });
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
        setEditCurrentFolder(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished moving folder atttempt");
      });
  };

  const navigateFolder = (folderId: number, index: number): void => {
    const folderToSet = allData.folders.filter((fold: Folder) => fold.folderid === folderId)[0];
    setNesting((prev: { title: string; id: number }[]) => {
      const length = nesting.length;
      const diff = length - index + 1;
      const copyArr = [...prev];
      copyArr.splice(index + 1, diff);
      return copyArr;
    });
    setFolder(folderToSet);
  };

  return (
    <section className="flex justify-center items-center flex-col mt-20 mx-10 lg:mx-60">
      {nesting.length > 0 && (
        <div className="flex justify-end items-center font-semibold gap-x-3 fixed top-5 left-5">
          {nesting.map((folderMeta: { title: string; id: number }, index: number) => (
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
            className="fixed top-5 left-5 padding-3 bg-slate-900 rounded-md shadow-md flex justify-evenly items-center gap-3"
          >
            <button
              onClick={() => cancelEdit()}
              className="flex justify-between items-center text-xs p-3 hover:bg-slate-800 duration-200 w-40"
            >
              Cancel
              <MdCancel />
            </button>
            {selectedForEdit.length > 0 && (
              <>
                <button
                  onClick={() => deleteAllSelected()}
                  className="flex justify-between items-center text-xs p-3 hover:bg-slate-800 duration-200 w-40"
                >
                  {selectedForEdit.length < 2 ? "Delete" : "Delete All"}
                  <MdDelete />
                </button>
                <button
                  onClick={() => moveAllSelected()}
                  className="flex justify-between items-center text-xs p-3 hover:bg-slate-800 duration-200 w-40"
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
              className="bg-slate-900 z-40 rounded-md shadow-md absolute top-0 right-5 flex flex-col justify-between items-start w-40 text-sm"
            >
              <button
                className="text-left p-3 hover:bg-slate-800 duration-200 w-full"
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Title");
                }}
              >
                Title
              </button>
              <button
                className="text-left p-3 hover:bg-slate-800 duration-200 w-full"
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Date");
                }}
              >
                Date
              </button>
              <button
                className="text-left p-3 hover:bg-slate-800 duration-200 w-full"
                onClick={() => {
                  setFilterOptions(false);
                  setFilter("Updated");
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
      <button
        className="fixed bottom-3 right-3 rounded-full bg-slate-600 text-amber-300 w-10 h-10 flex justify-center items-center shadow-sm"
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
            className="rounded-md shadow-md fixed bottom-10 right-10 bg-slate-700 flex flex-col justify-center items-center font-bold w-40"
          >
            <button
              className="flex justify-between items-center w-full py-3 px-4 hover:bg-slate-600"
              onClick={() => {
                setOptions(false);
                addNewFolder();
              }}
            >
              New Folder
              <FaFolderPlus />
            </button>
            <button
              className="flex justify-between items-center w-full py-3 px-4 hover:bg-slate-600"
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
      {move && move.isMoving && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
            onClick={() => setMove(false)}
          ></motion.div>
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed z-40 right-0 top-0 w-[80%] lg:w-[30%] p-5 rounded-l-md overflow-y-auto no-scroll-bar bottom-0 bg-slate-900"
          >
            <Tree
              moving={true}
              folders={allData.folders.filter((fold) => fold.folderid !== move.from)}
              parentId={null}
              level={0}
              open={{ item: { title: null } }}
            />
            <div className="flex justify-start items-center gap-x-5">
              <button
                onClick={() => setSelectedFolder(null)}
                className="p-2 mt-3 flex  justify-center items-center gap-x-3 rounded-md bg-slate-700 shadow-md hover:bg-slate-800 duration-200"
              >
                Move <FaHome />
              </button>
              <button
                onClick={() => navigate("/newfolder")}
                className="p-2 mt-3 rounded-md bg-amber-300 shadow-md hover:bg-amber-200 text-black duration-200"
              >
                Create Folder +
              </button>
            </div>
            <div className="mt-3">
              <p>
                Move {move.itemTitle} from {folder ? folder.title : "Home"} &rarr;{" "}
                {selectedFolder ? selectedFolder.title : "Home"}
              </p>
              <button
                onClick={() => moveItem()}
                className="py-2 px-3 mt-3 rounded-md bg-green-300 shadow-md text-black hover:bg-green-200 duration-200"
              >
                Move &rarr;
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
