import { SetStateAction, Dispatch } from "react";

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
  setNote: Dispatch<SetStateAction<Note>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  setContextMenu?: Dispatch<SetStateAction<ContextMenu>>;
  setSystemNotif?: Dispatch<SetStateAction<SystemNotif>>;
  setAllData: Dispatch<SetStateAction<AllData>>;
  setNotesToRender: Dispatch<SetStateAction<Note[]>>;
  setDraggedOverFolder: Dispatch<SetStateAction<Folder | null>>;
  setNoteToEdit: Dispatch<SetStateAction<Note | null>>;
  setSettings: Dispatch<SetStateAction<boolean>>;
  fetchUser: (token: string, cacheInstalled: boolean) => void;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
  setMove: Dispatch<SetStateAction<Move | null>>;
  setDrafts: Dispatch<SetStateAction<Note[]>>;
  setTrashedNotes: Dispatch<SetStateAction<Note[]>>;
  setEditDraft: Dispatch<SetStateAction<boolean>>;
  setSearch: Dispatch<SetStateAction<boolean>>;
  setCreateCon: Dispatch<SetStateAction<boolean>>;
  folders: Folder[];
  mainTitle: string;
  notes: Note[];
  user: User;
  token: string;
  folder: Folder;
  loading: boolean;
  note: Note;
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
  noteToEdit: Note | null;
  settings: boolean;
  userPreferences: UserPreferences;
  move: Move | null;
  trashedNotes: Note[];
  drafts: Note[];
  editDraft: boolean;
  search: boolean;
  createCon: boolean;
}
