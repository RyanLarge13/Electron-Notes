import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import UserContext from "@renderer/contexxt/UserContext";

const NoteView = (): JSX.Element => {
  const { setNote, setNoteToEdit, note } = useContext(UserContext);

  const navigate = useNavigate();

  const editNote = (): void => {
    setNoteToEdit(note);
    setNote(null);
    navigate("/newnote");
  };

  return (
    <>
      <div
        className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
        onClick={() => setNote(null)}
      ></div>
      <div className="fixed z-40 bg-black inset-10 overflow-y-auto no-scroll-bar rounded-md shadow-md px-5 pb-5">
        <div className="flex justify-between items-start sticky top-0 right-0 left-0 bg-black bg-opacity-20 backdrop-blur-sm p-4">
          <p className="text-3xl">{note.title}</p>
          <button onClick={() => editNote()}>
            <FaEdit />
          </button>
        </div>
        <div className="renderHtml mt-5" dangerouslySetInnerHTML={{ __html: note.htmlText }}></div>
      </div>
    </>
  );
};

export default NoteView;
