import "@renderer/threads/handleConnections";

import { createContext, ReactNode, useEffect, useState } from "react";

import { ContextProps, Folder, Note, SystemNotifAction } from "@renderer/types/types";
import { getUserData } from "@renderer/utils/api";

import LocalCache from "../utils/cache";

const UserContext = createContext({} as ContextProps);

export const UserProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  // const [homeFolders, setHomeFolders] = useState([]);
  // const [prevFolders, setPrevFolders] = useState([]);
  // const [nextFolders, setNextFolders] = useState([]);
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
  const [note, setNote] = useState<Note[] | []>([]);
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
  const [noteToEdit, setNoteToEdit] = useState<Note[] | []>([]);
  const [settings, setSettings] = useState(false);
  const [move, setMove] = useState(null);

  const [noteDrag, setNoteDrag] = useState(false);
  const [noteDragging, setNoteDragging] = useState(null);
  const [noteDragFolder, setNoteDragFolder] = useState(null);
  const [noteIsMoving, setNoteIsMoving] = useState(false);

  const [minimizeArray, setMinimizeArray] = useState<string[]>([]);

  const [editCurrentFolder, setEditCurrentFolder] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState(false);
  const [folderSearch, setFolderSearch] = useState(false);
  const [folderSearchText, setFolderSearchText] = useState("");
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

  const [userPreferences, setUserPreferences] = useState(
    JSON.parse(localStorage.getItem("preferences"))
  );

  const cacheHandler = new LocalCache();

  useEffect(() => {
    //preferences settings
    const preferences = localStorage.getItem("preferences");
    if (!preferences) {
      const defaultPreferences = {
        darkMode: true,
        theme: "",
        confirm: true,
        layout: "masonry",
        order: order,
        filter: filter,
        savedFolder: null,
        autoSave: false,
        unsavedNotes: [],
        notify: {
          notifyAll: true,
          notifySuccess: true,
          notifyErrors: true
        },
        quickActions: [0, 1],
        lockPin: [1, 2, 3, 4],
        commands: [
          { text: "new folder", command: "ctrl + alt + f", active: true },
          { text: "new note", command: "ctrl + alt + n", active: true },
          { text: "open menu", command: "ctrl + m", active: true },
          { text: "reorder notes", command: "ctrl + o", active: true },
          { text: "edit", command: "ctrl + e", active: true },
          { text: "search", command: "ctrl + s", active: true }
        ],
        menuWidth: 45,
        settingsWidth: 45,
        noteDems: []
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
        if ("layout" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.layout = "masonry";
        }
        if ("order" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.order = true;
        }
        if ("filter" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.filter = "Title";
        }
        if ("unsavedNotes" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.unsavedNotes = [];
        }
        if ("autosave" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.autosave = false;
        }
        if ("quickActions" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.quickActions = [0, 1];
        }
        if ("menuWidth" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.menuWidth = 45;
        }
        if ("settingsWidth" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.settingsWidth = 45;
        }
        if ("noteDems" in parsedPreferences) {
          null;
        } else {
          parsedPreferences.noteDems = [];
        }

        parsedPreferences.order ? setOrder(parsedPreferences.order) : setOrder(true);
        parsedPreferences.filter ? setFilter(parsedPreferences.filter) : setFilter("Title");
        parsedPreferences.layout === "grid"
          ? setView("grid")
          : parsedPreferences.layout === "list"
            ? setView("list")
            : setView("masonry");
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
          fetchUser(token, false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isInitialLoad && allData) {
      const storedFolder = JSON.parse(localStorage.getItem("preferences")).savedFolder;
      if (storedFolder && storedFolder != null) {
        const folderToSet = allData.folders.filter((aFold) => aFold.folderid === storedFolder);
        const childFolders = allData.folders.filter(
          (aFold) => aFold.parentFolderId === storedFolder
        );
        const notesToSet = allData.notes.filter((aNote) => aNote.folderId == storedFolder);
        setFolder(folderToSet[0]);
        setNotes(notesToSet);
        setFolders(childFolders);
        setMainTitle(folderToSet[0]?.title || "Folders");
      } else {
        setIsInitialLoad(false);
        setFolder(null);
        const childFolders = allData.folders.filter((aFold) => aFold.parentFolderId === null);
        setFolders(childFolders);
      }
    }
  }, [isInitialLoad, allData]);

  useEffect(() => {
    if (!isInitialLoad && allData) {
      if (!folder) {
        const topFolders = allData.folders.filter((fold: Folder) => fold.parentFolderId === null);
        topFolders.sort((a: Folder, b: Folder) => a.title.localeCompare(b.title));
        const topNotes = allData.notes.filter(
          (aNote: Note) => aNote.folderId === null && !aNote.trashed
        );
        setNotes(topNotes);
        setFolders(topFolders);
        setMainTitle("Folders");
      } else {
        const subFolders = allData.folders.filter(
          (fold: Folder) => fold.parentFolderId === folder.folderid
        );
        subFolders.sort((a, b) => a.title.localeCompare(b.title));
        const nestedNotes = allData.notes.filter(
          (aNote: Note) => aNote.folderId === folder.folderid && !aNote.trashed
        );
        setNotes(nestedNotes);
        setFolders(subFolders);
        setMainTitle(folder.title);
      }
    }
  }, [folder, allData]);

  useEffect(() => {
    let copyOfNotes: Note[];
    if (mainTitle === "Trashed") {
      copyOfNotes = notes.filter((aNote) => aNote.trashed);
    } else if (mainTitle === "favorites") {
      copyOfNotes = notes.filter((aNote) => aNote.favorite);
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
  }, [order, notes, filter, mainTitle]);

  const installCache = (data): void => {
    const cachedAllData = {
      user: data[0][0],
      folders: data[1].sort((a: Folder, b: Folder) => a.title.localeCompare(b.title)),
      notes: data[2]
    };
    setAllData(cachedAllData);
    setTrashedNotes(cachedAllData.notes.filter((aNote: Note) => aNote.trashed));
    setFavorites(cachedAllData.notes.filter((aNote) => aNote.favorite));
    setUser(cachedAllData.user);
    setLoading(false);
  };

  const uploadCache = async (data): Promise<void> => {
    await cacheHandler.updateData("user", data.user);
    await cacheHandler.updateData(
      "folders",
      data.folders.sort((a, b) => a.title.localeCompare(b.title))
    );
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
    getUserData(token)
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
        setFavorites(data.notes.filter((aNote) => aNote.favorite));
        setUser(data.user);
        setLoading(false);
        setIsInitialLoad(false);
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

  const resetSystemNotification = (): void => {
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
  };

  const networkNotificationError = (actions: SystemNotifAction[]): void => {
    if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
      const newError = {
        show: true,
        title: "Network Error",
        text: "Our application was not able to reach the server, please check your internet connection and try again",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void => resetSystemNotification()
          },
          ...actions
        ]
      };
      setSystemNotif(newError);
    }
  };

  const showErrorNotification = (
    title: string,
    text: string,
    hasCancel: boolean,
    actions: SystemNotifAction[]
  ): void => {
    if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
      setSystemNotif({
        show: true,
        title,
        text,
        color: "bg-red-300",
        hasCancel,
        actions: [
          {
            text: "close",
            func: () => resetSystemNotification()
          },
          ...actions
        ]
      });
    }
  };

  const showSuccessNotification = (
    title: string,
    text: string,
    hasCancel: boolean,
    actions: SystemNotifAction[]
  ): void => {
    if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
      setSystemNotif({
        show: true,
        title,
        text,
        color: userPreferences.theme || "bg-amber-300",
        hasCancel,
        actions: [
          {
            text: "close",
            func: () => resetSystemNotification()
          },
          ...actions
        ]
      });
    }
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
        favorites,
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
        setSharedNotes,
        noteDrag,
        setNoteDrag,
        noteIsMoving,
        setNoteIsMoving,
        noteDragFolder,
        setNoteDragFolder,
        noteDragging,
        setNoteDragging,
        folderSearch,
        setFolderSearch,
        folderSearchText,
        setFolderSearchText,
        minimizeArray,
        setMinimizeArray,
        networkNotificationError,
        resetSystemNotification,
        showErrorNotification,
        showSuccessNotification
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
