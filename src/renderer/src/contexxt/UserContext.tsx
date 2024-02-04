import { createContext, useState, useEffect, ReactNode } from "react";
import { ContextProps } from "@renderer/types/types";
import { getuserData } from "@renderer/utils/api";

const UserContext = createContext({} as ContextProps);

export const UserProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesToRender, setNotesToRender] = useState([]);
  const [order, setOrder] = useState(true);
  const [filter, setFilter] = useState("Title");
  const [note, setNote] = useState(null);
  const [mainTitle, setMainTitle] = useState("Folders");
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [menu, setMenu] = useState(false);
  const [view, setView] = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [nesting, setNesting] = useState([]);
  const [edit, setEdit] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState([]);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [settings, setSettings] = useState(false);
  const [move, setMove] = useState(null);
  const [editCurrentFolder, setEditCurrentFolder] = useState(false);
  const [systemNotif, setSystemNotif] = useState({
    show: false,
    title: "",
    text: "",
    color: "",
    hasCancel: false,
    actions: []
  });
  const [contextMenu, setContextMenu] = useState({
    show: false,
    meta: { title: "", color: "" },
    options: []
  });
  const [userPreferences, setUserPreferences] = useState({
    confirm: true,
    darkMode: true,
    lockPin: [1, 2, 3, 4],
    theme: "bg-amber-300",
    commands: []
  });

  useEffect(() => {
    //preferences settings
    const preferences = localStorage.getItem("preferences");
    if (!preferences) {
      const defaultPreferences = {
        darkMode: true,
        theme: "",
        confirm: true,
        notify: {
          notifyAll: true,
          notifySuccess: true,
          notifyErrors: true
        },
        lockPin: [1, 2, 3, 4],
        commands: [
          { text: "new folder", command: "ctrl + f", active: true },
          { text: "new note", command: "ctrl + n", active: true },
          { text: "open menu", command: "ctrl + m", active: true },
          { text: "reorder notes", command: "ctrl + o", active: true },
          { text: "edit", command: "ctrl + e", active: true },
          { text: "search", command: "ctrl + s", active: true }
        ]
      };
      localStorage.setItem("preferences", JSON.stringify(defaultPreferences));
      setUserPreferences(defaultPreferences);
    }
    if (preferences) {
      try {
        const parsedPreferences = JSON.parse(preferences);
        setUserPreferences(parsedPreferences);
      } catch (err) {
        console.log(err);
        const newError = {
          show: true,
          title: "Loading PReferences",
          text: "The application is having issues uploading your app preferences. Please reload and try again. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev",
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
        };
        setSystemNotif(newError);
      }
    }
    //Login and token handling
    if (token) {
      fetchUser(token);
    }
    if (!token) {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!folder && allData) {
      const topFolders = allData.folders.filter((fold) => fold.parentFolderId === null);
      const topNotes = allData.notes.filter((aNote) => aNote.folderId === null);
      setFolders(topFolders);
      setNotes(topNotes);
      setMainTitle("Folders");
    }
    if (folder) {
      const subFolders = allData.folders.filter((fold) => fold.parentFolderId === folder.folderid);
      const nestedNotes = allData.notes.filter((aNote) => aNote.folderId === folder.folderid);
      setFolders(subFolders);
      setNotes(nestedNotes);
      setMainTitle(folder.title);
    }
  }, [folder, allData]);

  useEffect(() => {
    const copyOfNotes = [...notes];
    if (order) {
      const sortedNotesAsc = copyOfNotes.sort((a, b) =>
        filter === "Title"
          ? a.title.localeCompare(b.title)
          : filter === "Date"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new DataTransfer(a.createdAt) - new Date(b.createdAt)
      );
      return setNotesToRender(sortedNotesAsc);
    }
    if (!order) {
      const sortedNotesAsc = copyOfNotes.sort((a, b) =>
        filter === "Title"
          ? b.title.localeCompare(a.title)
          : filter === "Date"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new DataTransfer(b.createdAt) - new Date(a.createdAt)
      );
      return setNotesToRender(sortedNotesAsc);
    }
  }, [order, notes, filter]);

  const fetchUser = (token: string): void => {
    getuserData(token)
      .then((res) => {
        const data = res.data.data;
        console.log(data);
        setAllData(data);
        setUser(data.user);
        setFolder(null);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        localStorage.removeItem("authToken");
        setToken(null);
        if (err.code === "ERR_NETWORK") {
          const newError = {
            show: true,
            title: "Network Error",
            text: "Please check your internet connection and try logging in again",
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
              { text: "reload", func: () => window.location.reload() }
            ]
          };
          return setSystemNotif(newError);
        }
        const status = err.response.status;
        if (status === 401) {
          const newError = {
            show: true,
            title: "Login Again",
            text: "Please login again to confirm your identity",
            color: "bg-red-300",
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
              }
            ]
          };
          return setSystemNotif(newError);
        }
      });
  };

  return (
    <UserContext.Provider
      value={{
        folders,
        setFolders,
        mainTitle,
        setMainTitle,
        notes,
        setNotes,
        user,
        setUser,
        token,
        setToken,
        fetchUser,
        folder,
        setLoading,
        loading,
        setFolder,
        note,
        setNote,
        selectedFolder,
        setSelectedFolder,
        position,
        setPosition,
        contextMenu,
        setContextMenu,
        menu,
        editCurrentFolder,
        setEditCurrentFolder,
        setMenu,
        systemNotif,
        setSystemNotif,
        view,
        setView,
        allData,
        setAllData,
        nesting,
        setNesting,
        notesToRender,
        setNotesToRender,
        order,
        setOrder,
        filter,
        setFilter,
        edit,
        setEdit,
        selectedForEdit,
        setSelectedForEdit,
        draggedOverFolder,
        setDraggedOverFolder,
        noteToEdit,
        setNoteToEdit,
        settings,
        setSettings,
        userPreferences,
        setUserPreferences,
        move,
        setMove
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
