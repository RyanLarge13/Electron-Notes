import { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";
import UserContext from "@renderer/contexxt/UserContext";
import { FaEdit, FaFolderPlus, FaList, FaPlusSquare, FaSearch } from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import { PiSwap } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";
import { BiSearch } from "react-icons/bi";
import { TbFolderSearch } from "react-icons/tb";
import { LuFileSearch } from "react-icons/lu";

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
    if (note && Escape) {
      setNote(null);
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

  const openOptions = (e): void => {
    if (!user || loading || note || noteToEdit) return;
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
      options: [
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
      ]
    };
    setContextMenu(newMenu);
  };

  const openFolderFromSearch = (): void => {
    if (folderSearchText === "") {
      return;
    }
    const foldersAvailable = folders.filter((aFold) =>
      aFold.title.toLowerCase().includes(folderSearchText.toLowerCase())
    );
    if (foldersAvailable.length > 1) {
      return;
    } else {
      setFolder(foldersAvailable[0]);
      setFolderSearchText("");
    }
  };

  return (
    <section
      onContextMenu={(e) => openOptions(e)}
      className={`${
        userPreferences?.darkMode ? "bg-[#222] text-white" : "bg-slate-100 text=black"
      } min-h-screen scrollbar-hide`}
    >
      <div className="text-rose-300 text-red-300 text-amber-300 text-yellow-300 text-lime-300 text-green-300 text-emerald-300 text-cyan-300 text-sky-300 text-blue-300 text-indigo-300 text-violet-300 text-fuchsia-300 text-pink-300"></div>
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
                  className={`fixed top-10 left-10 z-40 ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"} p-3 rounded-md shadow-md`}
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
