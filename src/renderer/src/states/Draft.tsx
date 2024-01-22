import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaSave, FaUnlock } from "react-icons/fa";
import { createNewNote, updateNote } from "@renderer/utils/api";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import UserContext from "@renderer/contexxt/UserContext";
import { ClipLoader } from "react-spinners";

const Draft = () => {
  const { token, folder, setAllData, noteToEdit, setNoteToEdit } = useContext(UserContext);

  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : "");
  const [value, setValue] = useState(noteToEdit ? noteToEdit.htmlText : "");
  const [locked, setLocked] = useState(noteToEdit ? noteToEdit.locked : false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const saveNote = () => {
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }
    const newNote = {
      title: title,
      htmlNotes: value,
      folderId: folder ? folder.folderid : null,
      locked: locked
    };
    if (noteToEdit) {
      const updatedNote = {
        notesId: noteToEdit.noteid,
        title: title,
        htmlNotes: value,
        locked: locked,
        folderId: noteToEdit.folderId
      };
      return updateNote(token, updatedNote)
        .then((res) => {
          const resNote = res.data.data[0];
          const noteToPush = {
            title: resNote.title,
            createdAt: resNote.createdat,
            noteid: resNote.notesid,
            htmlText: resNote.htmlnotes,
            locked: resNote.locked,
            folderId: resNote.folderid
          };
          setAllData((prevUser) => {
            const newNotes = prevUser.notes.filter((note) => note.noteid !== resNote.notesid);
            newNotes.push(noteToPush);
            const newData = {
              ...prevUser,
              notes: newNotes
            };
            return newData;
          });
          setLoading(false);
          navigate("/");
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
    createNewNote(token, newNote)
      .then((res) => {
        const returnedNote = res.data.data[0];
        const noteToPush = {
          title: returnedNote.title,
          createdAt: returnedNote.createdat,
          noteid: returnedNote.notesid,
          htmlText: returnedNote.htmlnotes,
          locked: returnedNote.locked,
          folderId: returnedNote.folderid
        };
        setAllData((prevData) => {
          const newData = {
            ...prevData,
            notes: [...prevData.notes, noteToPush]
          };
          return newData;
        });
        setLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  return (
    <>
      <div
        className="fixed z-10 inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
        onClick={() => {
          noteToEdit && setNoteToEdit(null);
          navigate("/");
        }}
      ></div>
      <div className="fixed top-20 right-5 left-5 lg:right-60 lg:left-60 bottom-20 rounded-md shadow-md bg-black z-40">
        <div className="flex justify-between items-center pr-5">
          <input
            type="text"
            placeholder="Title"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 text-xl bg-black focus:outline-none"
          />
          <div className="flex gap-x-3">
            <button onClick={() => setLocked((prev) => !prev)}>
              {locked ? <FaLock className="text-amber-300" /> : <FaUnlock />}
            </button>
            <button onClick={() => saveNote()} className="text-slate-200">
              {loading ? <ClipLoader size={16} color="#fff" /> : <FaSave />}
            </button>
          </div>
        </div>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          style={{ color: "#fff", height: "80%" }}
        />
      </div>
    </>
  );
};

export default Draft;
