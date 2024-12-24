import { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";
import UserContext from "@renderer/contexxt/UserContext";
import { FaEdit, FaFolderPlus, FaList, FaPlusSquare } from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import { PiPlusMinus, PiSwap } from "react-icons/pi";
import { TbFolderSearch } from "react-icons/tb";
import { LuFileSearch } from "react-icons/lu";
import { Tooltip } from "react-tooltip";
import { ContextMenuOption } from "@renderer/types/types";
import { IoSettings } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";

const MainPage = (): JSX.Element => {
  const {
    setOrder,
    setEdit,
    setMenu,
    setContextMenu,
    setEditCurrentFolder,
    setSelectedForEdit,
    setPosition,
    setView,
    setSettings,
    setSystemNotif,
    setSearch,
    setUserPreferences,
    setNotes,
    setNote,
    setFolder,
    setNoteToEdit,
    folders,
    setFolderSearchText,
    setFolderSearch,
    folderSearch,
    folderSearchText,
    allData,
    order,
    view,
    menu,
    search,
    settings,
    systemNotif,
    contextMenu,
    loading,
    user,
    edit,
    folder,
    note,
    noteToEdit,
    userPreferences
  } = useContext(UserContext);

  const [keyPresses, setKeyPressed] = useState({
    n: false,
    f: false,
    Control: false,
    Alt: false,
    m: false,
    e: false,
    o: false,
    s: false,
    g: false,
    Escape: false
  });
  const [quickActionsNew, setQuickActionsNew] = useState(false);

  const navigate = useNavigate();

  const handleKeyPress = (e): void => {
    const key: string = e.key;
    if (key in keyPresses) {
      setKeyPressed((prevPresses) => {
        return {
          ...prevPresses,
          [key]: true
        };
      });
    }
  };

  const handleKeyUp = (e): void => {
    const key: string = e.key;
    if (key in keyPresses) {
      setKeyPressed((prevPresses) => {
        return {
          ...prevPresses,
          [key]: false
        };
      });
    }
  };

  useEffect(() => {
    const { Alt, Control, f, n, e, o, m, s, g, Escape } = keyPresses;

    if (Alt && Control && n) {
      navigate("/newnote");
    }
    if (Alt && Control && f) {
      navigate("/newfolder");
    }
    if (Control && e) {
      setEdit((prev) => !prev);
    }
    if (Control && o) {
      const newPreferences = {
        ...userPreferences,
        order: order ? false : true
      };
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
      setOrder((prev) => !prev);
    }
    if (Control && m) {
      setMenu((prev) => !prev);
    }
    if (Control && s) {
      setSearch((prev) => !prev);
    }
    if (Control && g) {
      const newPreferences = {
        ...userPreferences,
        grid: view === "list" ? true : false
      };
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
      setView((prev) => (prev === "list" ? "grid" : "list"));
    }
    if (edit && Escape) {
      setEdit(false);
      setSelectedForEdit([]);
    }
    if (contextMenu.show && Escape) {
      setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    }
    if (systemNotif.show && Escape) {
      setSystemNotif({
        show: false,
        title: "",
        text: "",
        color: "",
        hasCancel: false,
        actions: []
      });
    }
    if (menu && Escape) {
      setMenu(false);
    }
    if (settings && Escape) {
      setSettings(false);
    }
    if (search && Escape) {
      setSearch(false);
    }
    if (note.length > 0 && Escape) {
      setNote((prev) => {
        if (prev.length === 1) {
          return [];
        } else {
          return prev.splice(prev.length - 1, 1);
        }
      });
    }
    if (contextMenu && Escape) {
      setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    }
    if (folderSearch && Escape) {
      setFolderSearch(false);
      setFolderSearchText("");
    }
  }, [keyPresses]);

  const handleUnloadChecks = (e): void => {
    const unsavedChanges = userPreferences.unsavedNotes;
    const unsavedNotes = [];
    if (unsavedChanges.length > 0) {
      unsavedChanges.forEach((unsaved) => {
        const note = allData.notes.map((aNote) => aNote.noteid === unsaved.id);
        if (!note[0]) {
          // renmove that from storage
        } else {
          unsavedNotes.push(note[0]);
        }
      });
      setNotes(unsavedNotes);
      e.preventDefault();
      setSystemNotif({
        show: true,
        title: "Unsaved Notes",
        text: `You have unsaved changes to some notes, are you sure you don't want to save first?`,
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void => {
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              });
            }
          },
          {
            text: "exit",
            func: async (): Promise<void> => {
              window.removeEventListener("beforeunload", handleUnloadChecks);
              await window.closeWin.closeMainWin();
            }
          }
        ]
      });
    } else {
      null;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("beforeunload", handleUnloadChecks);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("beforeunload", handleUnloadChecks);
    };
  }, []);

  const editCurrentFolder = (): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    if (!folder) {
      if (userPreferences.notify.notifyErrors) {
        const newError = {
          show: true,
          title: "Cannot Edit Home",
          text: "This is your home folder, you cannot edit the name or color, sorry.",
          color: "bg-red-300",
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
            }
          ]
        };
        setSystemNotif(newError);
      }
      return;
    }
    setEditCurrentFolder(true);
  };

  const quickActions: ContextMenuOption[] = [
    {
      title: "new folder",
      icon: <FaFolderPlus />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        navigate("/newfolder");
      }
    },
    {
      title: "new note",
      icon: <FaPlusSquare />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setNoteToEdit((prev) => [
          ...prev,
          {
            title: "New Note",
            noteid: uuidv4(),
            locked: false,
            htmlText: "",
            folderId: folder?.folderid || null,
            createdAt: new Date(),
            updated: new Date(),
            trashed: false,
            favorite: false,
            isNew: true
          }
        ]);
        navigate("/newnote");
      }
    },
    {
      title: "search folders",
      icon: <TbFolderSearch />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setFolderSearchText("");
        setFolderSearch(true);
      }
    },
    {
      title: "search notes",
      icon: <LuFileSearch />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setSearch(true);
      }
    },
    {
      title: "menu",
      icon: <MdOutlineMenu />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setMenu(true);
      }
    },
    {
      title: "edit",
      icon: <FaEdit />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setEdit(true);
      }
    },
    {
      title: "change view",
      icon: <PiSwap />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        const newPreferences = {
          ...userPreferences,
          layout: view === "list" ? "masonry" : view === "grid" ? "list" : "grid"
        };
        localStorage.setItem("preferences", JSON.stringify(newPreferences));
        setUserPreferences(newPreferences);
        setView((prevView) =>
          prevView === "list" ? "masonry" : view === "grid" ? "list" : "grid"
        );
      }
    },
    {
      title: "change order",
      icon: <FaList />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setOrder((prevOrder) => !prevOrder);
      }
    },
    {
      title: "edit current folder",
      icon: <FaEdit />,
      func: (): void => editCurrentFolder()
    },
    {
      title: "settings",
      icon: <IoSettings />,
      func: (): void => {
        setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
        setMenu(true);
        setSettings(true);
      }
    }
  ];

  const openOptions = (e): void => {
    if (!user || loading || note.length > 0 || noteToEdit.length > 0) return;
    e.preventDefault();
    const { clientX, clientY } = e;
    let dynamicTop = clientY;
    let dynamicLeft = clientX;
    if (clientY + 250 > window.innerHeight) {
      dynamicTop -= 270;
    }
    if (clientX + 200 > window.innerWidth) {
      dynamicLeft -= 250;
    }
    setPosition({ top: dynamicTop, left: dynamicLeft });
    const newMenu = {
      show: true,
      meta: {
        title: "options",
        color: `${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`
      },
      options: quickActions
    };
    setContextMenu(newMenu);
  };

  const openFolderFromSearch = (): void => {
    if (folderSearchText === "") {
      return;
    }
    const foldersAvailable = folders.filter(
      (aFold) => aFold.title && aFold.title.toLowerCase().includes(folderSearchText.toLowerCase())
    );
    if (foldersAvailable && foldersAvailable.length > 1) {
      return;
    } else {
      if (foldersAvailable[0]) {
        setFolder(foldersAvailable[0]);
        setFolderSearchText("");
      } else {
        return;
      }
    }
  };

  const addActionToList = (index: number): void => {
    let found = false;
    const newActionsMap = userPreferences.quickActions.map((int) => {
      if (int === index) {
        found = true;
        return 999;
      } else {
        return int;
      }
    });
    const newActions = newActionsMap.filter((int) => int !== 999);
    if (!found) {
      newActions.push(index);
    }
    const newPreferences = { ...userPreferences, quickActions: newActions };
    setUserPreferences(newPreferences);
    localStorage.setItem("preferences", JSON.stringify(newPreferences));
  };

  return (
    <section
      onContextMenu={(e) => openOptions(e)}
      className={`${
        userPreferences?.darkMode ? "bg-[#222] text-white" : "bg-slate-100 text=black"
      } min-h-screen scrollbar-hide`}
    >
      <div
        className="
      text-rose-300 text-red-300 text-amber-300 text-yellow-300 text-lime-300 text-green-300 text-emerald-300 text-cyan-300 text-sky-300 text-blue-300 text-indigo-300 text-violet-300 text-fuchsia-300 text-pink-300 
      text-rose-600 text-red-600 text-amber-600 text-yellow-600 text-lime-600 text-green-600 text-emerald-600 text-cyan-600 text-sky-600 text-blue-600 text-indigo-600 text-violet-600 text-fuchsia-600 text-pink-600
      "
      ></div>
      <ContextMenu />
      <SystemNotif />
      {!loading ? (
        !user ? (
          <Login />
        ) : (
          <>
            {folderSearch ? (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => {
                    setFolderSearchText("");
                    setFolderSearch(false);
                  }}
                ></div>
                <div
                  className={`fixed top-20 left-10 z-40 ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"} p-3 rounded-md shadow-md`}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      openFolderFromSearch();
                    }}
                  >
                    <input
                      className="bg-transparent focus:outline-none outline-none w-full mr-5 text-sm"
                      autoFocus={true}
                      placeholder="Search Folders"
                      value={folderSearchText}
                      onChange={(e) => setFolderSearchText(e.target.value)}
                    />
                  </form>
                </div>
              </>
            ) : null}
            <Account />
            <Tooltip id="quick-actions" />
            <div className="fixed bottom-5 left-5 bg-transparent">
              {userPreferences.quickActions.map((actionIndex, index) => (
                <div key={index} className="flex flex-col gap-3 justify-end items-center">
                  <Tooltip id={quickActions[actionIndex].title} />
                  <button
                    onClick={() => quickActions[actionIndex].func()}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                    }}
                    data-tooltip-content={quickActions[actionIndex].title}
                    data-tooltip-id={quickActions[actionIndex].title}
                    className={`rounded-full p-3 shadow-md my-1 ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-300 text-black"} text-lg`}
                  >
                    {quickActions[actionIndex].icon}
                  </button>
                </div>
              ))}
              <button
                onClick={() => setQuickActionsNew((prev) => !prev)}
                data-tooltip-content="quick actions"
                data-tooltip-id="quick-actions"
                className={`${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-300 text-black"} mt-1 rounded-full p-3 shadow-md text-lg`}
              >
                <PiPlusMinus />
              </button>
            </div>
            {quickActionsNew ? (
              <>
                <div
                  className="fixed z-[999] inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
                  onClick={() => {
                    setQuickActionsNew(false);
                  }}
                ></div>
                <div
                  className={`rounded-md fixed inset-y-40 inset-x-60 z-[999] p-5 shadow-md ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"}`}
                >
                  <p className="text-lg">Quick Action Select</p>
                  <div className="grid grid-cols-4 p-10 justify-center items-center gap-1 h-full">
                    {quickActions.map((action, index) => (
                      <button
                        onClick={() => addActionToList(index)}
                        key={action.title}
                        className={`flex flex-col gap-y-1 w-full h-full duration-200 rounded-lg shadow-md justify-center items-center ${userPreferences.darkMode ? (userPreferences.quickActions.includes(index) ? "bg-[#555] text-white" : "bg-[#444] text-white") : userPreferences.quickActions.includes(index) ? "bg-slate-300 text-black" : "bg-slate-200 text-black"}`}
                      >
                        <div
                          className={`p-3 duration-200 rounded-full w-min ${userPreferences.darkMode ? (userPreferences.quickActions.includes(index) ? "bg-[#444] text-white" : "bg-[#555] text-white") : userPreferences.quickActions.includes(index) ? "bg-slate-400 text-black" : "bg-slate-300 text-black"} shadow-md`}
                        >
                          <p>{action.icon}</p>
                        </div>
                        <p className="text-xs text-center">{action.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )
      ) : (
        <div className="fixed z-[999] w-screen h-screen flex justify-center items-center">
          <ClipLoader color="#fff" />
        </div>
      )}
    </section>
  );
};

export default MainPage;
