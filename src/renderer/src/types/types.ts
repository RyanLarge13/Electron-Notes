import { SetStateAction, Dispatch } from "react";

export type Folder = {
  folderid: number;
  title: string;
  color: string;
  folders: 
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
