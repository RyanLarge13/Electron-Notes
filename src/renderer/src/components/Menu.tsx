import { useContext, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaTrashAlt, FaLock, FaFirstdraft } from "react-icons/fa";
import { LuFileStack } from "react-icons/lu";
import { deleteUser } from "@renderer/utils/api";
import { useNavigate } from "react-router-dom";
import UserContext from "@renderer/contexxt/UserContext";
import Tree from "./Tree";
import { BsStarFill } from "react-icons/bs";

const Menu = (): JSX.Element => {
  const {
    setMenu,
    setUser,
    setNotes,
    setToken,
    setFolders,
    setMainTitle,
    setSystemNotif,
    setSettings,
    setUserPreferences,
    userPreferences,
    favorites,
    user,
    allData,
    token,
    drafts,
    trashedNotes
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

  const confirmLogout = (): void => {
    const newConfirmation = {
      show: true,
      title: "Logout",
      text: "Are you sure you want to logout?",
      color: "bg-amber-300",
      hasCancel: false,
      actions: [
        {
          text: "cancel",
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
        { text: "logout", func: (): void => logout() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("pin");
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
  };

  const confirmDeleteAccount = (): void => {
    const newConfirmation = {
      show: true,
      title: `Delete Account`,
      text: "Are you sure deleting your entire account is what you want to do? You will lose all of your data",
      color: "bg-red-600",
      hasCancel: false,
      actions: [
        {
          text: "CANCEL",
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
        { text: "delete", func: (): void => deleteAccount() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const showAllNotes = (): void => {
    setMainTitle("All Notes");
    setFolders([]);
    setNotes(allData.notes);
    setMenu(false);
  };

  const showAllLocked = (): void => {
    const lockedNotes = allData.notes.filter((aNote) => aNote.locked);
    setMainTitle("Locked Notes");
    setFolders([]);
    setNotes(lockedNotes);
    setMenu(false);
  };

  const deleteAccount = (): void => {
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
    try {
      deleteUser(token)
        .then((res) => {
          console.log(res);
          setUser(null);
          setToken(null);
          localStorage.removeItem("signedup");
          localStorage.removeItem("authToken");
          localStorage.removeItem("pin");
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            const newError = {
              show: true,
              title: "Delete Account Failed",
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
                { text: "re-try", func: () => deleteAccount() },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
          if (err.request) {
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
                { text: "re-try", func: () => deleteAccount() },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Delete Account Failed",
        text: "There was an error with the application when trying to delete your account, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
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
          { text: "re-try", func: () => deleteAccount() },
          { text: "reload app", func: () => window.location.reload() }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const showAllDrafts = (): void => {
    setMainTitle("Drafts");
    setFolders([]);
    setNotes(drafts);
    setMenu(false);
  };

  const showAllTrashed = (): void => {
    setMainTitle("Trashed");
    setFolders([]);
    setNotes(trashedNotes);
    setMenu(false);
  };

  const showAllFavorites = (): void => {
    setMainTitle("Favorites");
    setFolders([]);
    setNotes(favorites);
    setMenu(false);
  };

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
        className={`fixed flex flex-col justify-between z-40 left-0 top-0 bottom-0 p-5 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-slate-200"
        } rounded-r-md overflow-y-auto no-scroll-bar`}
      >
        <div
          className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} absolute right-0 touch-none top-[50%] translate-y-[-50%] w-1 h-20 rounded-full cursor-grab`}
          onPointerDown={handleResizeWidth}
          onPointerMove={handleResizeWidthMove}
          onPointerUp={handleResizeWidthUp}
        ></div>
        <div className="mb-10">
          <h1 className="text-3xl">{user.username}</h1>
          <button
            onClick={() => showAllNotes()}
            className={`p-3 rounded-md shadow-md my-3 ${
              userPreferences.darkMode
                ? "bg-[#333] hover:bg-[#444]"
                : "bg-slate-300 hover:bg-slate-400"
            } w-full flex justify-between items-center duration-200`}
          >
            <p>All Notes</p>
            <div className="flex justify-center items-center gap-x-3">
              <p className="font-semibold">{allData?.notes?.length}</p>
              <LuFileStack
                className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
              />
            </div>
          </button>
          <button
            onClick={() => showAllLocked()}
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
            onClick={() => showAllFavorites()}
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
            onClick={() => showAllDrafts()}
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
            onClick={(): void => showAllTrashed()}
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
          {/* <button
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
              <p className="font-semibold">0</p>
              <FaShareAlt
                className={`${userPreferences.theme ? textThemeString : "text-amber-300"} text-sm`}
              />
            </div>
          </button> */}
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
            onClick={() => confirmLogout()}
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
            onClick={() => confirmDeleteAccount()}
            className="p-2 text-red-500 underline rounded-md shadow-md w-full text-sm duration-200"
          >
            Delete Account
          </button>
        </div>
      </motion.div>
      ;
    </>
  );
};

export default Menu;
