import { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";
import UserContext from "@renderer/contexxt/UserContext";

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
    Escape: false
  });

  const navigate = useNavigate();

  const handleKeyPress = (e): void => {
    const key: string = e.key;
    if (keyPresses.hasOwnProperty(key)) {
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
    if (keyPresses.hasOwnProperty(key)) {
      setKeyPressed((prevPresses) => {
        return {
          ...prevPresses,
          [key]: false
        };
      });
    }
  };

  useEffect(() => {
    const { Alt, Control, f, n, e, o, m, Escape } = keyPresses;

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
      setOrder((prev) => !prev);
    }
    if (Control && m) {
      setMenu((prev) => !prev);
    }
    if (edit && Escape) {
      setEdit(false);
      setSelectedForEdit([]);
    }
  }, [keyPresses]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyPress);
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
    e.preventDefault();
    if (!user || loading || note || noteToEdit) return;
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
        color: "bg-amber-300"
      },
      options: [
        {
          title: "new folder",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            navigate("/newfolder");
          }
        },
        {
          title: "new note",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            navigate("/newnote");
          }
        },
        {
          title: "menu",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            setMenu(true);
          }
        },
        {
          title: "edit",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            setEdit(true);
          }
        },
        {
          title: "change view",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            setView((prevView) => (prevView === "list" ? "grid" : "list"));
          }
        },
        {
          title: "change order",
          func: (): void => {
            setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
            setOrder((prevOrder) => !prevOrder);
          }
        },
        {
          title: "edit current folder",
          func: (): void => editCurrentFolder()
        },
        {
          title: "settings",
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

  return (
    <section
      onContextMenu={(e) => openOptions(e)}
      className={`${
        userPreferences.darkMode ? "bg-[#223] text-white" : "bg-slate-100 text=black"
      } min-h-screen scrollbar-hide`}
    >
      <ContextMenu />
      <SystemNotif />
      {!loading ? (
        !user ? (
          <Login />
        ) : (
          <Account />
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
