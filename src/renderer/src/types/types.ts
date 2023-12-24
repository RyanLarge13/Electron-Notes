import { SetStateAction, Dispatch } from "react";

export type typeUser = {
  name: string;
  id: string;
} | null;

export type typeFolder = {
  title: string;
  color: string;
  id: string;
};

export type Folder = {
  folderid: number;
  title: string;
  color: string;
};

export type Note = {
  noteid: number;
  notetitle: string;
  htmlnotes: string;
  parentfolderid: number;
};

export interface FoldersProps {
  folders: Folder[];
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  setNotes: Dispatch<SetStateAction<Note[]>>;
  setNested: Dispatch<SetStateAction<boolean>>;
  setFoldersLength: Dispatch<SetStateAction<number>>;
  setNotesLength: Dispatch<SetStateAction<number>>;
  setMainTitle: Dispatch<SetStateAction<string>>;
}
