import { useContext, useEffect, useState } from "react";
import { BiMenuAltLeft } from "react-icons/bi";
import { IoIosSearch } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserContext from "@renderer/contexxt/UserContext";

const Header = (): JSX.Element => {
  const {
    setFolder,
    setFolders,
    setMainTitle,
    setMenu,
    setView,
    setEditCurrentFolder,
    setNotes,
    setNesting,
    setEdit,
    setSearch,
    setUserPreferences,
    allData,
    view,
    mainTitle,
    editCurrentFolder,
    folder,
    nesting,
    userPreferences,
    search
  } = useContext(UserContext);

  const [searchText, setSearchText] = useState("");
  const [optionMenu, setOptionMenu] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleNavBack = (e): void => {
      if (e.buttons === 8) {
        goBack();
        return;
      }
    };
    window.addEventListener("mousedown", handleNavBack);
    return () => window.removeEventListener("mousedown", handleNavBack);
  }, []);

  useEffect(() => {
    if (!search) {
      const topLevelNotes = allData.notes.filter((aNote) => aNote.folderId === null);
      return setNotes(topLevelNotes);
    }
    if (folder) {
      const folderNotes = allData.notes.filter((aNote) => aNote.folderId === folder.folderid);
      if (!searchText) {
        return setNotes(folderNotes);
      }
      const filteredFolderNotes = folderNotes.filter((aNote) => aNote.title.includes(searchText));
      setNotes(filteredFolderNotes);
    }
    if (!folder) {
      if (!searchText) {
        const topLevelNotes = allData.notes.filter((aNote) => aNote.folderId === null);
        return setNotes(topLevelNotes);
      }
      const searchedNotes = allData.notes.filter((aNote) => aNote.title.includes(searchText));
      setNotes(searchedNotes);
    }
  }, [searchText, search]);

  const takeUserHome = (): void => {
    if (editCurrentFolder) {
      setEditCurrentFolder(false);
    }
    if (checkFolder()) {
      setNesting([]);
      setFolders(allData.folders.filter((fold) => fold.parentFolderId === null));
      setNotes(allData.notes.filter((aNote) => aNote.folderId === null));
      setMainTitle("Folders");
      setFolder(null);
      return;
    }
    setFolder(null);
  };

  const goBack = (): void => {
    if (editCurrentFolder) {
      setEditCurrentFolder(false);
    }
    if (checkFolder() && !folder) {
      setNesting([]);
      setFolders(allData.folders.filter((fold) => fold.parentFolderId === null));
      setNotes(allData.notes.filter((aNote) => aNote.folderId === null));
      setMainTitle("Folders");
      return setFolder(null);
    }
    if (!folder?.parentFolderId) {
      setNesting([]);
      return setFolder(null);
    }
    if (folder.parentFolderId) {
      const foundFolder = allData.folders.filter(
        (fold) => fold.folderid === folder.parentFolderId
      )[0];
      const nestingCopy = [...nesting];
      nestingCopy.pop();
      setNesting(nestingCopy);
      return setFolder(foundFolder);
    }
  };

  const checkFolder = (): boolean => {
    if (
      mainTitle === "All Notes" ||
      mainTitle === "Locked Notes" ||
      mainTitle === "Drafts" ||
      mainTitle === "Trashed"
    ) {
      return true;
    }
    if (folder) {
      return true;
    }
    return false;
  };

  return (
    <>
      {optionMenu && (
        <div onClick={() => setOptionMenu(false)} className="fixed bg-transparent inset-0"></div>
      )}
      <div
        className={`${
          userPreferences.darkMode ? "bg-[#223]" : "bg-slate-100"
        } flex justify-between items-center w-full text-xl mt-20 sticky top-0 py-3 bg-opacity-75 backdrop-blur-sm bg-[#223] z-20`}
      >
        <div className="flex justify-start items-center gap-x-3">
          <button onClick={() => setMenu(true)}>
            <BiMenuAltLeft />
          </button>
          {checkFolder() && (
            <div>
              <button className="ml-3" onClick={() => goBack()}>
                <IoReturnUpBackSharp />
              </button>
              <button onClick={() => takeUserHome()} className="ml-3">
                <FaHome />
              </button>
            </div>
          )}
        </div>
        {search && (
          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={!folder ? "search all notes" : `search notes in ${folder.title}`}
            value={searchText}
            className="bg-transparent focus:outline-none text-sm text-center"
          />
        )}
        <div className="trelative">
          <button onClick={() => setSearch((prev) => !prev)}>
            <IoIosSearch />
          </button>
          <button onClick={() => setOptionMenu((prev) => !prev)}>
            <BsThreeDotsVertical />
          </button>
          {optionMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${
                userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
              } rounded-md shadow-md absolute top-0 right-5 flex flex-col justify-between items-start w-40 text-sm`}
            >
              <button
                onClick={() => {
                  setOptionMenu(false);
                  const newPreferences = {
                    ...userPreferences,
                    grid: view === "list" ? true : false
                  };
                  localStorage.setItem("preferences", JSON.stringify(newPreferences));
                  setUserPreferences(newPreferences);
                  setView((prev) => (prev === "list" ? "grid" : "list"));
                }}
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                {view === "list" ? "Grid" : "List"}
              </button>
              <button
                onClick={() => {
                  navigate("/newfolder");
                  setOptionMenu(false);
                }}
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                Create Folder
              </button>
              <button
                onClick={() => {
                  setOptionMenu(false);
                  setEdit(true);
                }}
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                Edit
              </button>
              <button
                className={`text-left p-3 ${
                  userPreferences.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                Pin Favorites
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
