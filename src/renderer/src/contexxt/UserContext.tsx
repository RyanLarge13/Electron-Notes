import { createContext, useState, useEffect } from "react";
import { getuserData } from "@renderer/utils/api";

const UserContext = createContext({});

export const UserProvider = ({ children }: any): JSX.Element => {
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
  const [contextMenu, setContextMenu] = useState({ show: false });
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [menu, setMenu] = useState(false);
  const [systemNotif, setSystemNotif] = useState({ show: false });
  const [view, setView] = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [nesting, setNesting] = useState([]);
  const [edit, setEdit] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState([]);
  const [open, setOpen] = useState({ show: false, folder: null });
  const [pickFolder, setPickFolder] = useState(false);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);

  useEffect(() => {
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
              { text: "close", func: () => setSystemNotif({ show: false }) },
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
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
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
        open,
        setOpen,
        pickFolder,
        setPickFolder,
        draggedOverFolder,
        setDraggedOverFolder,
        noteToEdit,
        setNoteToEdit
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
