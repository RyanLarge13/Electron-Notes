import { Dispatch, SetStateAction } from "react";

// Public
export type Folder = {
  folderid: string;
  title: string;
  color: string;
  parentFolderId: string;
  createdAt: Date;
};

export type apiFolder = {
  folderid: string;
  title: string;
  color: string;
};

export type Note = {
  title: string;
  noteid: string;
  locked: boolean;
  htmlText: string;
  folderId: string | null;
  createdAt: Date;
  updated: Date;
  trashed: boolean;
  favorite: boolean;
  isNew?: boolean;
};

export type apiNote = {
  title: string;
  noteid: number;
  notetitle: string;
  htmlnotes: string;
  parentfolderid: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
};

export type ContextMenuOption = {
  title: string;
  icon: JSX.Element;
  func: CallableFunction;
};

export type SystemNotifAction = {
  text: string;
  func: () => void;
};

// Private
type Position = {
  top: number;
  left: number;
};

type ContextMenuMeta = {
  title: string;
  color: string;
};

type ContextMenu = {
  show: boolean;
  meta: ContextMenuMeta;
  options: ContextMenuOption[];
};

export type AllData = {
  user: User;
  folders: Folder[];
  notes: Note[];
};

type SystemNotif = {
  show: boolean;
  title: string;
  text: string;
  color: string;
  hasCancel: boolean;
  actions: SystemNotifAction[];
};

type Commands = {
  text: string;
  command: string;
  active: boolean;
};

type PreferencesNotify = {
  notifyAll: boolean;
  notifySuccess: boolean;
  notifyErrors: boolean;
};

type unsavedNotesArray = {
  id: string;
  htmlText: string;
};

type UserPreferences = {
  confirm: boolean;
  notify: PreferencesNotify;
  darkMode: boolean;
  lockPin: number[];
  theme: string;
  savedFolder: string | null;
  commands: Commands[];
  order: boolean;
  filter: string;
  layout: string;
  quickActions: number[];
  unsavedNotes: unsavedNotesArray[];
  autosave: boolean;
  menuWidth: number;
  settingsWidth: number;
  noteDems: { id: string; width: number; height: number; top: number; left: number }[];
};

type Move = {
  isMoving: boolean;
  from: string;
  itemTitle: string;
  item: Note[] | Folder[] | null;
  type: string;
};

type Nesting = {
  title: string;
  id: string;
};

export type Connection = {
  id: string;
  email: string;
};

export type ShareReq = {
  id: string;
  from: string;
  to: string;
  note: string;
};

export type NoteShare = {
  show: boolean;
  notes: string[];
  connections: string[];
};

export type ConReq = {
  id: string;
  from: string;
  to: string;
};

export interface ContextProps {
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  setNotes: Dispatch<SetStateAction<Note[]>>;
  // setNested: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  // setFoldersLength: Dispatch<SetStateAction<number>>;
  // setNotesLength: Dispatch<SetStateAction<number>>;
  setMainTitle: Dispatch<SetStateAction<string>>;
  setToken: Dispatch<SetStateAction<string>>;
  setMenu: Dispatch<SetStateAction<boolean>>;
  setEditCurrentFolder: Dispatch<SetStateAction<boolean>>;
  setOrder: Dispatch<SetStateAction<boolean>>;
  setEdit: Dispatch<SetStateAction<boolean>>;
  setFilter: Dispatch<SetStateAction<string>>;
  setView: Dispatch<SetStateAction<string>>;
  setNesting: Dispatch<SetStateAction<Nesting[]>>;
  setSelectedForEdit: Dispatch<SetStateAction<string[]>>;
  setUser: Dispatch<SetStateAction<User>>;
  setFolder: Dispatch<SetStateAction<Folder>>;
  setSelectedFolder: Dispatch<SetStateAction<Folder>>;
  setNote: Dispatch<SetStateAction<Note[] | []>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  setContextMenu?: Dispatch<SetStateAction<ContextMenu>>;
  setSystemNotif?: Dispatch<SetStateAction<SystemNotif>>;
  setAllData: Dispatch<SetStateAction<AllData>>;
  setNotesToRender: Dispatch<SetStateAction<Note[]>>;
  setDraggedOverFolder: Dispatch<SetStateAction<Folder | null>>;
  setNoteToEdit: Dispatch<SetStateAction<Note[] | []>>;
  setSettings: Dispatch<SetStateAction<boolean>>;
  fetchUser: (token: string, cacheInstalled: boolean) => void;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
  setMove: Dispatch<SetStateAction<Move | null>>;
  setDrafts: Dispatch<SetStateAction<Note[]>>;
  setTrashedNotes: Dispatch<SetStateAction<Note[]>>;
  setEditDraft: Dispatch<SetStateAction<boolean>>;
  setSearch: Dispatch<SetStateAction<boolean>>;
  setCreateCon: Dispatch<SetStateAction<boolean>>;
  setHoverConnections: Dispatch<SetStateAction<boolean>>;
  setConnections: Dispatch<SetStateAction<Connection[]>>;
  setConsSent: Dispatch<SetStateAction<Connection[]>>;
  setShareRequests: Dispatch<SetStateAction<ShareReq[]>>;
  setShareRequestsFrom: Dispatch<SetStateAction<ShareReq[]>>;
  setSharedNotes: Dispatch<SetStateAction<Note[]>>;
  setNoteDrag: Dispatch<SetStateAction<boolean>>;
  setNoteIsMoving: Dispatch<SetStateAction<boolean>>;
  setNoteDragFolder: Dispatch<SetStateAction<Note[]>>;
  setNoteDragging: Dispatch<SetStateAction<Note>>;
  setFolderSearch: Dispatch<SetStateAction<boolean>>;
  setFolderSearchText: Dispatch<SetStateAction<string>>;
  setMinimizeArray: Dispatch<SetStateAction<string[]>>;
  setPinnedFavorites: Dispatch<SetStateAction<Note[]>>;
  setPinFavs: Dispatch<SetStateAction<boolean>>;
  setNoteShare: Dispatch<SetStateAction<NoteShare>>;
  setConnectionRequestsReceived: Dispatch<SetStateAction<ConReq[]>>;
  setConnectionRequestsSent: Dispatch<SetStateAction<ConReq[]>>;
  minimizeArray: string[];
  folderSearchText: string;
  folderSearch: boolean;
  noteDragging: Note;
  noteDragFolder: Note;
  noteIsMoving: boolean;
  noteDrag: boolean;
  folders: Folder[];
  mainTitle: string;
  notes: Note[];
  user: User;
  token: string;
  folder: Folder;
  loading: boolean;
  note: Note[];
  selectedFolder: Folder;
  position: Position;
  contextMenu?: ContextMenu;
  menu: boolean;
  editCurrentFolder: boolean;
  order: boolean;
  filter: string;
  edit: boolean;
  allData: AllData;
  systemNotif: SystemNotif;
  view: string;
  nesting: Nesting[];
  notesToRender: Note[];
  selectedForEdit: string[];
  draggedOverFolder: Folder | null;
  noteToEdit: Note[] | [];
  settings: boolean;
  userPreferences: UserPreferences;
  move: Move | null;
  trashedNotes: Note[];
  drafts: Note[];
  editDraft: boolean;
  search: boolean;
  createCon: boolean;
  hoverConnections: boolean;
  favorites: Note[];
  connections: Connection[];
  consSent: Connection[];
  shareRequests: ShareReq[];
  sharedNotes: Note[];
  pinnedFavorites: Note[];
  pinFavs: boolean;
  noteShare: NoteShare;
  shareRequestsFrom: ShareReq[];
  connectionRequestsReceived: ConReq[];
  connectionRequestsSent: ConReq[];
  networkNotificationError: (actions: SystemNotifAction[]) => void;
  resetSystemNotification: () => void;
  showErrorNotification: (
    title: string,
    text: string,
    hasCancel: boolean,
    actions: SystemNotifAction[]
  ) => void;
  showSuccessNotification: (
    title: string,
    text: string,
    hasCancel: boolean,
    actions: SystemNotifAction[]
  ) => void;
}
