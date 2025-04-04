import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { BiEdit, BiFolderPlus, BiGrid, BiListUl, BiMenuAltLeft } from "react-icons/bi";
import { BsStarFill, BsThreeDotsVertical } from "react-icons/bs";
import { CiGrid42 } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import UserContext from "@renderer/contexxt/UserContext";
import { Note } from "@renderer/types/types";

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
    setSettings,
    setPinFavs,
    pinFavs,
    settings,
    menu,
    allData,
    view,
    mainTitle,
    editCurrentFolder,
    folder,
    note,
    nesting,
    userPreferences,
    search
  } = useContext(UserContext);

  const [searchText, setSearchText] = useState("");
  const [optionMenu, setOptionMenu] = useState(false);

  const navigate = useNavigate();

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  useEffect(() => {
    const handleNavBack = (e: MouseEvent): void => {
      if (e.buttons === 8) {
        e.preventDefault();
        e.stopPropagation();
        goBack();
        return;
      }
    };
    window.addEventListener("mousedown", handleNavBack);
    return () => window.removeEventListener("mousedown", handleNavBack);
  }, [folder, mainTitle, note, settings, menu]);

  useEffect(() => {
    if (search && !searchText && folder === null) {
      setNotes([]);
    }
  }, [search]);

  useEffect(() => {
    if (!search) {
      const topLevelNotes = allData.notes.filter((aNote: Note) => aNote.folderId === null);
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
  }, [search, searchText]);

  const takeUserHome = (): void => {
    if (editCurrentFolder) {
      setEditCurrentFolder(false);
    }
    if (!checkFolder()) {
      const newPreferences = {
        ...userPreferences,
        savedFolder: null
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
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
    if (settings) {
      setSettings(false);
      return;
    }
    if (menu) {
      setMenu(false);
      return;
    }
    if (editCurrentFolder) {
      setEditCurrentFolder(false);
    }
    if (checkFolder()) {
      console.log("In custom sys folder");
      setNesting([]);
      setFolders(
        allData.folders
          .filter((fold) => fold.parentFolderId === null)
          .sort((a, b) => a.title.localeCompare(b.title))
      );
      setNotes(allData.notes.filter((aNote) => aNote.folderId === null));
      setMainTitle("Folders");
      const newPreferences = {
        ...userPreferences,
        savedFolder: null
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setFolder(null);
      return;
    }
    if (!folder?.parentFolderId) {
      setNesting([]);
      setFolder(folder);
      const newPreferences = {
        ...userPreferences,
        savedFolder: null
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setFolder(null);
      return;
    }
    if (folder.parentFolderId) {
      const foundFolder = allData.folders.filter(
        (fold) => fold.folderid === folder.parentFolderId
      )[0];
      const nestingCopy = [...nesting];
      nestingCopy.pop();
      setNesting(nestingCopy);
      setFolder(folder);
      const newPreferences = {
        ...userPreferences,
        savedFolder: folder.parentFolderId
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setFolder(foundFolder);
      return;
    }
  };

  const checkIfFolder = (): boolean => {
    if (folder) {
      return true;
    }
    return false;
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
    return false;
  };

  const pinFavoritesToTop = (): void => {
    setOptionMenu(false);
    setPinFavs((prev) => !prev);
    const newPreferences = {
      ...userPreferences,
      pinFavs: !userPreferences.pinFavs
    };
    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(
        `Error updating user preferences in local storage to pin favorites. Error: ${err}`
      );
    }
  };

  return (
    <>
      {optionMenu && (
        <div onClick={() => setOptionMenu(false)} className="fixed bg-transparent inset-0"></div>
      )}
      <div
        className={`${
          userPreferences.darkMode ? "bg-[#222]" : "bg-slate-100"
        } flex justify-between items-center w-full text-xl mt-20 sticky top-0 py-3 bg-opacity-75 backdrop-blur-sm bg-[#222] z-20`}
      >
        <div className={`flex justify-start items-center gap-x-3 ${themeStringText}`}>
          <button onClick={() => setMenu(true)}>
            <BiMenuAltLeft />
          </button>
          {checkFolder() || checkIfFolder() ? (
            <div>
              <button className="ml-3" onClick={() => goBack()}>
                <IoReturnUpBackSharp />
              </button>
              <button onClick={() => takeUserHome()} className="ml-3">
                <FaHome />
              </button>
            </div>
          ) : null}
        </div>
        {search && (
          <motion.input
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            autoFocus={true}
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={!folder ? "search all notes" : `search notes in ${folder.title}`}
            value={searchText}
            className="bg-transparent focus:outline-none text-sm text-center"
          />
        )}
        <div className="relative">
          <div className={`${themeStringText}`}>
            <button onClick={() => setSearch((prev) => !prev)}>
              <IoIosSearch />
            </button>
            <button onClick={() => setOptionMenu((prev) => !prev)}>
              <BsThreeDotsVertical />
            </button>
          </div>
          {optionMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${
                userPreferences.darkMode ? "bg-[#333]" : "bg-slate-200"
              } rounded-md shadow-md absolute top-0 right-5 overflow-hidden flex flex-col justify-between items-start w-40 text-sm`}
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
                  setView((prev) =>
                    prev === "list" ? "masonry" : view === "masonry" ? "grid" : "list"
                  );
                }}
                className={`text-left p-3 flex justify-between items-center ${
                  userPreferences.darkMode ? "hover:bg-[#444]" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                {view === "list" ? "Masonry" : view === "masonry" ? "Grid" : "List"}
                {view === "list" ? (
                  <CiGrid42 className={`${themeStringText}`} />
                ) : view === "masonry" ? (
                  <BiGrid className={`${themeStringText}`} />
                ) : (
                  <BiListUl className={`${themeStringText}`} />
                )}
              </button>
              <button
                onClick={() => {
                  navigate("/newfolder");
                  setOptionMenu(false);
                }}
                className={`text-left p-3 flex justify-between items-center ${
                  userPreferences.darkMode ? "hover:bg-[#444]" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                Create Folder
                <BiFolderPlus className={`${themeStringText}`} />
              </button>
              <button
                onClick={() => {
                  setOptionMenu(false);
                  setEdit(true);
                }}
                className={`text-left p-3 flex justify-between items-center ${
                  userPreferences.darkMode ? "hover:bg-[#444]" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                Edit
                <BiEdit className={`${themeStringText}`} />
              </button>
              <button
                onClick={() => pinFavoritesToTop()}
                className={`text-left p-3 flex justify-between items-center ${
                  userPreferences.darkMode ? "hover:bg-[#444]" : "hover:bg-slate-300"
                } duration-200 w-full`}
              >
                {pinFavs ? "Un-Pin Favorites" : "Pin Favorites"}
                <BsStarFill className={`${themeStringText}`} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
