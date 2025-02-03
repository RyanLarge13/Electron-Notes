import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { BiShareAlt } from "react-icons/bi";
import { MdCancel } from "react-icons/md";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection, Note, NoteShare, ShareReq } from "@renderer/types/types";
import { createShareNoteRequest } from "@renderer/utils/api";

import ConnectionRequestsSent from "./ConnectionRequestsSent";

const NoteShareComponent = (): JSX.Element => {
  const {
    noteShare,
    connections,
    allData,
    userPreferences,
    token,
    user,
    shareRequestsFrom,
    sharedNotes,
    setNoteShare,
    networkNotificationError,
    showSuccessNotification,
    showErrorNotification,
    setShareRequestsFrom
  } = useContext(UserContext);

  // Filter out notes below by users who you have shared notes previously with in the future
  const [notesToShow] = useState(allData.notes);

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

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

  const sendShareInfo = async (): Promise<void> => {
    try {
      const conEmails: string[] = connections
        .filter((aCon: Connection) =>
          noteShare.connections.some((anId: string) => anId === aCon.id)
        )
        .map((aCon) => aCon.email);

      const notesToSend: Note[] = allData.notes.filter((aNote: Note) =>
        noteShare.notes.some((noteid: string) => noteid === aNote.noteid)
      );

      const response = await createShareNoteRequest(conEmails[0], notesToSend[0], token);

      console.log(response);

      showSuccessNotification("Shared Note", response.data.message, false, []);

      const newShare: ShareReq = {
        id: response.data.data.notetoshareid,
        from: user.email,
        to: conEmails[0],
        note: {
          noteId: notesToSend[0].noteid,
          title: notesToSend[0].title,
          createdAt: new Date(notesToSend[0].createdAt).toLocaleDateString()
        }
      };
      setShareRequestsFrom((prev) => [...prev, newShare]);

      setNoteShare({ show: false, connections: [], notes: [] });
    } catch (err) {
      console.log(err);
      if (err.response) {
        showErrorNotification(
          "Sharing Note",
          `We could not complete your request to share this note`,
          true,
          []
        );
      }
      if (err.request) {
        networkNotificationError([]);
      }
    }
  };

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
      className={`fixed flex justify-evenly items-stretch inset-0 overflow-hidden rounded-md shadow-md p-5 ${userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"} z-[999]`}
    >
      <div className="basis-1/5 p-3">
        <p className="text-xl font-semibold mb-3 pb-2 border-b border-b-slate-200">
          Your Connections
        </p>
        <div>
          {connections.map((con: Connection) => (
            <button
              key={con.id}
              onClick={() => setShareInfo(con.id, null)}
              className={`flex pl-2 pr-5 py-2 duration-200 rounded-md shadow-md w-full justify-between gap-x-3 my-2 items-center ${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-400"} ${noteShare.connections.includes(con.id) ? `${outlineThemeString} outline outline-1` : ""}`}
            >
              <div
                className={`rounded-full w-10 h-10 shadow-md flex justify-center items-center ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"}`}
              >
                {con.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs">{con.email}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xl mt-5 font-semibold mb-3 pb-2 border-b border-b-slate-200">
          Your Pending Connections
        </p>
        <ConnectionRequestsSent />
      </div>
      <div className="basis-3/5 p-3 overflow-y-auto no-scroll-bar">
        <div
          className={`rounded-md shadow-md h-40 flex justify-center items-center mb-3 ${userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"}`}
        >
          <p className="text-xl font-semibold">Your Notes</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {allData.notes.map((note: Note, index: number) => (
            <button
              key={note.noteid}
              onClick={() => setShareInfo(null, note.noteid)}
              className={`${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-300 hover:bg-slate-400"} ${index % 3 === 0 ? "col-span-2" : "col-span-1"} p-3 rounded-md shadow-md duration-200 ${noteShare.notes.includes(note.noteid) ? `${outlineThemeString} outline outline-1` : ""}`}
            >
              <p className="text-2xl font-semibold mb-3 flex flex-col justify-start items-start">
                {note.title}
              </p>
              <p
                className="text-left"
                dangerouslySetInnerHTML={{ __html: note.htmlText.slice(0, 150) }}
              ></p>
            </button>
          ))}
        </div>
      </div>
      <div className="basis-1/5 p-3 h-full flex flex-col justify-between">
        <div>
          <p className="text-xl font-semibold mb-3 pb-2 border-b border-b-slate-200 text-center">
            Share Notes
          </p>
          <p className="text-3xl text-center font-semibold my-10">{user.username}</p>
          <div className="my-5">
            {noteShare.notes.length > 0 ? (
              <div>
                <p className="text-xl mb-2">
                  {noteShare.notes.length === 1 ? "Share Note" : "Share Notes"}
                </p>
                <div
                  className={`px-2 py-1 rounded-md shadow-md outline outline-1 ${outlineThemeString} overflow-y-auto`}
                >
                  {allData.notes
                    .filter((aNote: Note) =>
                      noteShare.notes.some((id: string) => id === aNote.noteid)
                    )
                    .map((aNote) => (
                      <div
                        key={aNote.noteid}
                        className={`${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-300 hover:bg-slate-400"} p-3 my-2 rounded-md shadow-md`}
                      >
                        <p>{aNote.title}</p>
                      </div>
                    ))}
                </div>
                <p className="text-xl my-2">With</p>
                <div>
                  {connections
                    .filter((aCon: Connection) =>
                      noteShare.connections.some((anId: string) => anId === aCon.id)
                    )
                    .map((recipient: Connection) => (
                      <div
                        key={recipient.id}
                        className={`flex pl-2 pr-5 py-2 duration-200 rounded-md shadow-md w-full justify-between gap-x-3 items-center my-2 ${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-400"}`}
                      >
                        <div
                          className={`rounded-full  w-10 h-10 shadow-md flex justify-center items-center ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"}`}
                        >
                          {recipient.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs">{recipient.email}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => sendShareInfo()}
            disabled={noteShare.connections.length < 1 || noteShare.notes.length < 1}
            className={`w-full disabled:opacity-25 p-2 flex justify-between items-center ${themeStringText} ${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-300 hover:bg-slate-400"} duration-200 rounded-md shadow-md`}
          >
            Share
            <BiShareAlt />
          </button>
          <button
            onClick={() => cancelShare()}
            className={`w-full p-2 flex justify-between items-center text-red-300 rounded-md shadow-md ${userPreferences.darkMode ? "bg-[#444] hover:bg-[#555]" : "bg-slate-300 hover:bg-slate-400"} duration-200`}
          >
            Cancel
            <MdCancel />
          </button>
        </div>
      </div>
    </motion.div>
  ) : null;
};

export default NoteShareComponent;
