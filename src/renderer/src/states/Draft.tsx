import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaSave, FaUnlock } from "react-icons/fa";
import { createNewNote } from "@renderer/utils/api";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import UserContext from "@renderer/contexxt/UserContext";

const Draft = ({ note }) => {
  const { token, folder, setAllData } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [value, setValue] = useState(note ? note : "");
  const [locked, setLocked] = useState(false);

  const navigate = useNavigate();

  const saveNote = (): void => {
    if (!token) {
      return;
    }
    const newNote = {
      title: title,
      htmlNotes: value,
      folderId: folder.folderid
    };
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
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished note upload attempt");
      });
  };

  return (
    <>
      <div
        className="fixed z-10 inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
        onClick={() => navigate("/")}
      ></div>
      <div className="fixed top-20 right-5 left-5 lg:right-60 lg:left-60 bottom-20 rounded-md shadow-md bg-black z-40">
        <div className="flex justify-between items-center pr-5">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 text-xl bg-black focus:outline-none"
          />
          <div className="flex gap-x-3">
            <button onClick={() => setLocked((prev) => !prev)}>
              {locked ? <FaLock className="text-amber-300" /> : <FaUnlock />}
            </button>
            <button onClick={() => saveNote()} className="text-slate-200">
              <FaSave />
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
