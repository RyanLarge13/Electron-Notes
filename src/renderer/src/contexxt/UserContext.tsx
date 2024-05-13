import { createContext, useState, useEffect, ReactNode } from "react";
import { ContextProps, Folder, Note } from "@renderer/types/types";
import { getuserData } from "@renderer/utils/api";
import "@renderer/threads/handleConnections";
import LocalCache from "../utils/cache";

const UserContext = createContext({} as ContextProps);

export const UserProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [hoverConnections, setHoverConnections] = useState(false);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [consSent, setConsSent] = useState([]);
  const [shareRequests, setShareRequests] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
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
  const [editDraft, setEditDraft] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState([]);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [settings, setSettings] = useState(false);
  const [move, setMove] = useState(null);
  const [editCurrentFolder, setEditCurrentFolder] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [search, setSearch] = useState(false);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [createCon, setCreateCon] = useState(false);
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
    grid: false,
    notify: {
      notifyAll: true,
      notifySuccess: true,
      notifyErrors: true
    },
    lockPin: [1, 2, 3, 4],
    theme: "bg-amber-300",
    commands: []
  });

  const cacheHandler = new LocalCache();

  useEffect(() => {
    //preferences settings
    const preferences = localStorage.getItem("preferences");
    if (!preferences) {
      const defaultPreferences = {
        darkMode: true,
        theme: "",
        confirm: true,
        grid: false,
        order: order,
        filter: filter,
        notify: {
          notifyAll: true,
          notifySuccess: true,
          notifyErrors: true
        },
        lockPin: [1, 2, 3, 4],
        commands: [
          { text: "new folder", command: "ctrl + alt + f", active: true },
          { text: "new note", command: "ctrl + alt + n", active: true },
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
        const newCommands = (parsedPreferences.commands = [
          { text: "new folder", command: "ctrl + alt + f", active: true },
          { text: "new note", command: "ctrl + alt + n", active: true },
          { text: "open menu", command: "ctrl + m", active: true },
          { text: "reorder notes", command: "ctrl + o", active: true },
          { text: "edit", command: "ctrl + e", active: true },
          { text: "search", command: "ctrl + s", active: true }
        ]);
        parsedPreferences.commands = newCommands;
        if ("grid" in parsedPreferences) {
          null;
        } else {
          console.log("No grid in parsed prefs");
          parsedPreferences.grid = false;
        }
        if ("order" in parsedPreferences) {
          null;
        } else {
          console.log("No order in preferences");
          parsedPreferences.order = true;
        }
        if ("filter" in parsedPreferences) {
          null;
        } else {
          console.log("no filter in preferences");
          parsedPreferences.filter = "Title";
        }
        parsedPreferences.order ? setOrder(parsedPreferences.order) : setOrder(true);
        parsedPreferences.filter ? setFilter(parsedPreferences.filter) : setFilter("Title");
        parsedPreferences.grid ? setView("grid") : setView("list");
        setUserPreferences(parsedPreferences);
        localStorage.setItem("preferences", JSON.stringify(parsedPreferences));
      } catch (err) {
        console.log(err);
        const newError = {
          show: true,
          title: "Loading Preferences",
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
  }, []);

  useEffect(() => {
    if (token) {
      cacheHandler
        .fetchAllLocalData(["user", "folders", "notes"])
        .then((res) => {
          if (res[0].length > 0) {
            installCache(res);
            fetchUser(token, true);
          } else {
            fetchUser(token, false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!folder && allData) {
      const topFolders = allData.folders.filter((fold: Folder) => fold.parentFolderId === null);
      const topNotes = allData.notes.filter(
        (aNote: Note) => aNote.folderId === null && !aNote.trashed
      );
      setFolders(topFolders);
      setNotes(topNotes);
      setMainTitle("Folders");
    }
    if (folder) {
      const subFolders = allData.folders.filter((fold) => fold.parentFolderId === folder.folderid);
      const nestedNotes = allData.notes.filter(
        (aNote: Note) => aNote.folderId === folder.folderid && !aNote.trashed
      );
      setFolders(subFolders);
      setNotes(nestedNotes);
      setMainTitle(folder.title);
    }
  }, [folder, allData]);

  useEffect(() => {
    let copyOfNotes: Note[];
    if (mainTitle === "Trashed") {
      copyOfNotes = notes.filter((aNote) => aNote.trashed);
    } else {
      copyOfNotes = notes.filter((aNote) => !aNote.trashed);
    }
    if (order) {
      const sortedNotesAsc = copyOfNotes.sort((a, b): number =>
        filter === "Title"
          ? a.title.localeCompare(b.title)
          : filter === "Date"
            ? +new Date(a.createdAt) - +new Date(b.createdAt)
            : +new Date(a.updated) - +new Date(b.updated)
      );
      return setNotesToRender(sortedNotesAsc);
    }
    if (!order) {
      const sortedNotesAsc = copyOfNotes.sort((a, b): number =>
        filter === "Title"
          ? b.title.localeCompare(a.title)
          : filter === "Date"
            ? +new Date(b.createdAt) - +new Date(a.createdAt)
            : +new Date(b.updated) - +new Date(a.updated)
      );
      return setNotesToRender(sortedNotesAsc);
    }
  }, [order, notes, filter]);

  const installCache = (data): void => {
    const cachedAllData = {
      user: data[0][0],
      folders: data[1],
      notes: data[2]
    };
    setAllData(cachedAllData);
    setTrashedNotes(cachedAllData.notes.filter((aNote: Note) => aNote.trashed));
    setUser(cachedAllData.user);
    setFolder(null);
    setLoading(false);
  };

  const uploadCache = async (data): Promise<void> => {
    await cacheHandler.updateData("user", data.user);
    await cacheHandler.updateData("folders", data.folders);
    await cacheHandler.updateData("notes", data.notes);
  };

  const handleConnections = (cons, conReqs, shareReqs, shareNotes, userEmail): void => {
    const connectionWorker = new Worker("/src/threads/handleConnections.js");
    connectionWorker.onmessage = (event): void => {
      const {
        filteredConnections,
        filteredConnectionRequests,
        filteredShareRequests,
        filteredSharedNotes
      } = event.data;
      setConnections(filteredConnections);
      setConnectionRequests(filteredConnectionRequests);
      setShareRequests(filteredShareRequests);
      setSharedNotes(filteredSharedNotes);
    };
    connectionWorker.postMessage({
      connections: cons,
      connectionRequests: conReqs,
      shareRequests: shareReqs,
      sharedNotes: shareNotes,
      userEmail: userEmail
    });
  };

  const fetchUser = (token: string, cacheInstalled: boolean): void => {
    getuserData(token)
      .then((res) => {
        const data = res.data.data;
        const newAllData = {
          user: data.user,
          folders: data.folders,
          notes: data.notes
        };
        handleConnections(
          data.connections,
          data.connectionRequests,
          data.shareRequests,
          data.sharedNotes,
          data.user.email
        );
        setAllData(newAllData);
        setTrashedNotes(data.notes.filter((aNote: Note) => aNote.trashed));
        setUser(data.user);
        setFolder(null);
        setLoading(false);
        uploadCache(data);
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "ERR_NETWORK") {
          if (cacheInstalled) {
            const newError = {
              show: true,
              title: "Offline Mode",
              text: "You are offline. Any changes made on another device will load once an internet connection is established",
              color: "bg-yellow-300",
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
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(false);
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
        hoverConnections,
        setHoverConnections,
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
        setMove,
        drafts,
        setDrafts,
        trashedNotes,
        setTrashedNotes,
        editDraft,
        setEditDraft,
        search,
        setSearch,
        createCon,
        setCreateCon,
        connections,
        setConsSent,
        consSent,
        setConnections,
        connectionRequests,
        setConnectionRequests,
        shareRequests,
        setShareRequests,
        sharedNotes,
        setSharedNotes
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
