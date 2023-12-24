import { useContext } from "react";
import UserContext from "@renderer/contexxt/UserContext";
import { FaEdit } from "react-icons/fa";

const NoteView = (): JSX.Element => {
  const { note, setNote } = useContext(UserContext);

  return (
    <>
      <div
        className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
        onClick={() => setNote(null)}
      ></div>
      <div className="fixed z-40 bg-black inset-10 rounded-md shadow-md p-5">
        <div className="flex justify-between items-start">
          <p className="text-3xl mb-3">{note.title}</p>
          <button>
            <FaEdit />
          </button>
        </div>
        <div className="renderHtml" dangerouslySetInnerHTML={{ __html: note.htmlText }}></div>
      </div>
    </>
  );
};

export default NoteView;
