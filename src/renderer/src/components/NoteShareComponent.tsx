import { motion } from "framer-motion";
import { useContext } from "react";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection, Note, NoteShare } from "@renderer/types/types";

const NoteShareComponent = () => {
  const { noteShare, connections, allData, userPreferences, setNoteShare } =
    useContext(UserContext);

  const setShareInfo = (conId: string | null, noteId: string | null): void => {
    setNoteShare((prev: NoteShare): NoteShare => {
      if (conId === null) {
        if (prev.notes.includes(noteId)) {
          return { ...prev, notes: prev.notes.filter((id: string): boolean => id !== noteId) };
        } else {
          return { ...prev, show: true, notes: [...prev.notes, noteId] };
        }
      } else {
        if (prev.connections.includes(conId)) {
          return {
            ...prev,
            connections: prev.connections.filter((con: string): boolean => con !== conId)
          };
        } else {
          return { ...prev, show: true, connections: [...prev.connections, conId] };
        }
      }
    });
  };

  const sendShareInfo = (): void => {};

  const cancelShare = (): void => {
    setNoteShare(() => {
      return {
        show: false,
        notes: [],
        connections: []
      };
    });
  };

  return noteShare.show ? (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed inset-5 rounded-md shadow-md p-5 ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"} z-[999]`}
    >
      <div className="flex justify-between items-center">
        <div>
          {connections.map((con: Connection) => (
            <div
              onClick={() => setShareInfo(con.id, null)}
              key={con.id}
              className={`${noteShare.connections.includes(con.id) ? "outline outline-white" : ""} overflow-y-auto`}
            >
              {con.email}
            </div>
          ))}
        </div>
        <div className="overflow-y-auto grid grid-cols-3 text-xs gap-2">
          {allData?.notes?.map((note: Note) => (
            <div
              onClick={() => setShareInfo(null, note.noteid)}
              key={note.noteid}
              className={`${noteShare.notes.includes(note.noteid) ? "outline outline-white text-red-300" : ""} rounded-md shadow-ms p-3`}
            >
              {note.title}
            </div>
          ))}
        </div>
      </div>
      <div>
        <button onClick={() => cancelShare()}>Cancel</button>
        <button onClick={() => sendShareInfo()}>Send</button>
      </div>
    </motion.div>
  ) : null;
};

export default NoteShareComponent;
