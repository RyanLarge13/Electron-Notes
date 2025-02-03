import { motion } from "framer-motion";
import { useContext, useRef, useState } from "react";
import { BsStarFill } from "react-icons/bs";
import { FaFirstdraft, FaLock, FaShareAlt, FaTrashAlt } from "react-icons/fa";
import { LuFileStack } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

import UserContext from "@renderer/contexxt/UserContext";
import { Note } from "@renderer/types/types";
import { deleteUser } from "@renderer/utils/api";

import Tree from "./Tree";

const MenuButton = ({ notes, title, userPreferences, color, click }): JSX.Element => {
  return (
    <button
      onClick={() => click()}
      className={`p-3 rounded-md shadow-md my-3 ${
        userPreferences.darkMode ? "bg-[#333] hover:bg-[#444]" : "bg-slate-300 hover:bg-slate-400"
      } w-full flex justify-between items-center duration-200`}
    >
      <p>{title}</p>
      <div className="flex justify-center items-center gap-x-3">
        <p className="font-semibold">{notes?.length || "0"}</p>
        <LuFileStack className={`${userPreferences.theme ? color : "text-amber-300"} text-sm`} />
      </div>
    </button>
  );
};

const Menu = (): JSX.Element => {
  const {
    setMenu,
    setUser,
    setNotes,
    setToken,
    setFolders,
    setMainTitle,
    setSettings,
    setUserPreferences,
    resetSystemNotification,
    networkNotificationError,
    showErrorNotification,
    confirmOperationNotification,
    userPreferences,
    favorites,
    user,
    allData,
    token,
    drafts,
    trashedNotes,
    sharedNotes
  } = useContext(UserContext);

  const [resizing, setResizing] = useState(false);
  const [menuWidth, setMenuWidth] = useState(userPreferences?.menuWidth || 33);

  const menuRef = useRef(null);

  const navigate = useNavigate();
  const hoverBgString = userPreferences?.theme
    ? userPreferences.theme.replace("300", "200")
    : "bg-amber-200";
  const textThemeString = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  // Network requests -------------------------------------------------------------------------
  const deleteAccount = (): void => {
    resetSystemNotification();

    const continueRequest = async (): Promise<void> => {
      try {
        await deleteUser(token);
        setUser(null);
        setToken(null);
        localStorage.removeItem("signedup");
        localStorage.removeItem("authToken");
        localStorage.removeItem("pin");
      } catch (err) {
        console.log(err);
        if (err.response) {
          showErrorNotification("Delete Account Failed", err.response.message, true, [
            { text: "re-try", func: () => deleteAccount() },
            { text: "reload app", func: () => window.location.reload() }
          ]);
          return;
        }
        if (err.request) {
          networkNotificationError([
            { text: "re-try", func: () => deleteAccount() },
            { text: "reload app", func: () => window.location.reload() }
          ]);
          return;
        }
        showErrorNotification(
          "Delete Account Failed",
          "There was an issue with deleting your account. Please try again and if the issue persists, contact the developer",
          true,
          [
            { text: "re-try", func: () => deleteAccount() },
            { text: "reload app", func: () => window.location.reload() }
          ]
        );
      }
    };

    confirmOperationNotification(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };
  // Network requests -------------------------------------------------------------------------

  // Helpers ----------------------------------------------------------------------------------
  const logout = (): void => {
    resetSystemNotification();

    const continueRequest = (): void => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("pin");
    };

    confirmOperationNotification(
      "Logout",
      "Are you sure you want to logout?",
      [{ text: "confirm", func: (): void => continueRequest() }],
      continueRequest
    );
  };

  const setFolderCategoryState = (title: string, folderSet: Note[]): void => {
    setMainTitle(title);
    setFolders([]);
    setNotes(folderSet);
    setMenu(false);
  };
  // Helpers ----------------------------------------------------------------------------------

  // Resizing operations -----------------------------------------------------------------------
  const handleResizeWidth = (e): void => {
    e.stopPropagation();
    if (menuRef && menuRef.current) {
      e.target.setPointerCapture(e.pointerId);
      setResizing(true);
      const rect = menuRef.current.getBoundingClientRect();
      const offsetX = e.pageX - rect.left;
      const percentagePointer = ((offsetX + menuWidth - 27) / window.innerWidth) * 100;
      setMenuWidth(percentagePointer);
    }
  };

  const handleResizeWidthMove = (e): void => {
    e.stopPropagation();
    if (menuRef && menuRef.current && resizing) {
      const rect = menuRef.current.getBoundingClientRect();
      const offsetX = e.pageX - rect.left;
      const percentagePointer = ((offsetX + menuWidth - 27) / window.innerWidth) * 100;
      setMenuWidth(percentagePointer);
    }
  };

  const handleResizeWidthUp = (e): void => {
    e.target.releasePointerCapture(e.pointerId);
    setResizing(false);
    setUserPreferences((prev) => {
      return { ...prev, menuWidth: menuWidth };
    });

    localStorage.setItem(
      "preferences",
      JSON.stringify({ ...userPreferences, menuWidth: menuWidth })
    );
  };
  // Resizing operations -----------------------------------------------------------------------

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
        onClick={() => setMenu(false)}
      ></motion.div>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, width: `${menuWidth}%` }}
        animate={{
          opacity: 1,
          width: `${menuWidth}%`,
          transition: { duration: resizing ? 0 : 0.25 }
        }}
        className={`fixed z-40 left-0 top-0 bottom-0 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-slate-200"
        } rounded-r-md`}
      >
        <div
          className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} absolute right-0 touch-none top-[50%] translate-y-[-50%] w-1 h-20 rounded-full cursor-grab`}
          onPointerDown={handleResizeWidth}
          onPointerMove={handleResizeWidthMove}
          onPointerUp={handleResizeWidthUp}
        ></div>
        <div className="overflow-y-auto h-full p-5 flex flex-col justify-between no-scroll-bar">
          <div className="mb-10">
            <h1 className="text-3xl">{user.username}</h1>
            <MenuButton
              notes={allData.notes}
              title={"All Notes"}
              userPreferences={userPreferences}
              color={textThemeString}
              click={() => setFolderCategoryState("All Notes", allData.notes)}
            />
            <button
              onClick={() => {
                const lockedNotes = allData.notes.filter((aNote) => aNote.locked);
                setFolderCategoryState("Locked Notes", lockedNotes);
              }}
              className={`p-3 rounded-md shadow-md my-3 ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-300 hover:bg-slate-400"
              } w-full flex justify-between items-center duration-200`}
            >
              <p>Locked Notes</p>
              <div className="flex justify-center items-center gap-x-3">
                <p className="font-semibold">
                  {allData?.notes?.filter((note) => note.locked).length}
                </p>
                <FaLock
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
                />
              </div>
            </button>
            <button
              onClick={() => setFolderCategoryState("Favorites", favorites)}
              className={`p-3 rounded-md shadow-md my-3 ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-300 hover:bg-slate-400"
              } w-full flex justify-between items-center duration-200`}
            >
              <p>Favorite Notes</p>
              <div className="flex justify-center items-center gap-x-3">
                <p className="font-semibold">
                  {allData?.notes?.filter((note) => note.favorite).length}
                </p>
                <BsStarFill
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
                />
              </div>
            </button>
            <button
              onClick={() => setFolderCategoryState("Drafts", drafts)}
              className={`p-3 rounded-md shadow-md my-3 ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-300 hover:bg-slate-400"
              } w-full flex justify-between items-center duration-200`}
            >
              <p>Draft Notes</p>
              <div className="flex justify-center items-center gap-x-3">
                <p className="font-semibold">{drafts.length}</p>
                <FaFirstdraft
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
                />
              </div>
            </button>
            <button
              onClick={(): void => setFolderCategoryState("Trashed", trashedNotes)}
              className={`p-3 rounded-md shadow-md my-3 w-full ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-300 hover:bg-slate-400"
              } flex justify-between items-center duration-200`}
            >
              <p>Trash Notes</p>
              <div className="flex justify-center items-center gap-x-3">
                <p className="font-semibold">{trashedNotes.length}</p>
                <FaTrashAlt
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
                />
              </div>
            </button>
            <button
              className={`p-3 rounded-md shadow-md my-3 w-full ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-300 hover:bg-slate-400"
              } flex justify-between items-center duration-200`}
            >
              <div className="flex justify-center items-center gap-x-5">
                <p>Shared Notes </p>
                <p
                  className={`${
                    userPreferences.theme ? textThemeString : "text-amber-300"
                  } text-sm font-bold`}
                >
                  Beta
                </p>
              </div>
              <div className="flex justify-center items-center gap-x-3">
                <p className="font-semibold">{sharedNotes.length}</p>
                <FaShareAlt
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
                />
              </div>
            </button>
            <p className="text-2xl my-5">Folders</p>
            <Tree
              moving={false}
              folders={allData.folders}
              parentId={null}
              level={0}
              open={{ item: { title: null } }}
            />
            <button
              onClick={() => navigate("/newfolder")}
              className={`p-2 mt-3 rounded-md text-black shadow-md duration-200 ${
                userPreferences.theme
                  ? `${userPreferences.theme} hover:${hoverBgString}`
                  : "bg-amber-300 hover:bg-amber-200"
              }`}
            >
              Create Folder +
            </button>
          </div>
          <div>
            <button
              onClick={() => setSettings(true)}
              className="p-2 rounded-md shadow-md bg-emerald-300 text-black w-full hover:bg-emerald-200 duration-200"
            >
              Settings
            </button>
            <button
              onClick={() => logout()}
              className={`p-2 rounded-md shadow-md ${
                userPreferences.theme
                  ? `${userPreferences.theme} hover:${hoverBgString}`
                  : "bg-amber-300 hover:bg-amber-200"
              } my-3 text-black w-full duration-200`}
            >
              Logout &rarr;
            </button>
            <a
              href="https://github.com/RyanLarge13/Electron-Notes/issues"
              target="_blank"
              rel="noreferrer"
              className={`p-2 rounded-md shadow-md ${
                userPreferences.theme
                  ? `${userPreferences.theme} hover:${hoverBgString}`
                  : "bg-amber-300 hover:bg-amber-200"
              } mb-3 text-center text-black w-full duration-200 block`}
            >
              Report A Bug
            </a>
            <button
              onClick={() => deleteAccount()}
              className="p-2 text-red-500 underline w-full text-sm duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
      ;
    </>
  );
};

export default Menu;
