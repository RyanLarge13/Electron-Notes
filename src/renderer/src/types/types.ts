import { SetStateAction, Dispatch } from "react";

// Public
export type Folder = {
  folderid: number;
  title: string;
  color: string;
  folders: Folder[];
};

export type apiFolder = {
  folderid: string;
  title: string;
  color: string;
  folders: Folder[];
};

export type Note = {
  noteid: number;
  notetitle: string;
  htmlnotes: string;
  parentfolderid: number;
};

export type User = {
  id: number;
  username: string;
};

// Private
type Position = {
  top: number;
  right: number;
};

type ContextMenuMeta = {
  title: string;
  color: string;
};

type ContextMenuOptions = {
  title: string;
  func: CallableFunction;
};

type ContextMenu = {
  show: boolean;
  meta: ContextMenuMeta;
  options: ContextMenuOptions[];
};

type AllData = {
  user: User;
  folders: Folder[];
  notes: Note[];
};

type SystemNotifActions = {
  text: string;
  func: () => void;
};

type SystemNotif = {
  show: boolean;
  title: string;
  text: string;
  color: string;
  hasCancel: boolean;
  actions: SystemNotifActions[];
};

type Commands = {
  text: string;
  command: string;
  active: boolean;
};

type UserPreferences = {
  confirm: boolean;
  darkMode: boolean;
  lockPin: number[];
  theme: string;
  commands: Commands[];
};

type Move = {
  isMoving: boolean;
  from: string;
  itemTitle: string;
  item: Note | Folder | null;
  type: string;
};

export interface ContextProps {
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  setNotes: Dispatch<SetStateAction<Note[]>>;
  setNested: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setFoldersLength: Dispatch<SetStateAction<number>>;
  setNotesLength: Dispatch<SetStateAction<number>>;
  setMainTitle: Dispatch<SetStateAction<string>>;
  setToken: Dispatch<SetStateAction<string>>;
  setMenu: Dispatch<SetStateAction<boolean>>;
  setEditCurrentFolder: Dispatch<SetStateAction<boolean>>;
  setOrder: Dispatch<SetStateAction<boolean>>;
  setEdit: Dispatch<SetStateAction<boolean>>;
  setFilter: Dispatch<SetStateAction<string>>;
  setView: Dispatch<SetStateAction<string>>;
  setNesting: Dispatch<SetStateAction<string[]>>;
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
  fetchUser: (token: string) => void;
  setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
  setMove: Dispatch<SetStateAction<Move | null>>;
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
  nesting: string[];
  notesToRender: Note[];
  selectedForEdit: string[];
  draggedOverFolder: Folder | null;
  noteToEdit: Note | null;
  settings: boolean;
  userPreferences: UserPreferences;
  move: Move | null;
  foldersLength: number;
  notesLength: number;
}
