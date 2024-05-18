import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCopy, FaEdit, FaShareAlt, FaTrashAlt } from "react-icons/fa";
import UserContext from "@renderer/contexxt/UserContext";

const NoteView = (): JSX.Element => {
  const { note, userPreferences, setNote, setNoteToEdit, setSystemNotif } = useContext(UserContext);

  const [htmlToRender, setHtmlToRender] = useState(note.htmlText);

  const navigate = useNavigate();

  useEffect(() => {
    const contains = userPreferences.unsavedNotes.filter((unsaved) => unsaved.id === note.noteid);
    if (contains.length > 0) {
      setHtmlToRender(contains[0].htmlText);
    }
  }, []);

  const editNote = (): void => {
    setNoteToEdit(note);
    setNote(null);
    navigate("/newnote");
  };

  const copyNoteText = (): void => {
    const noteText = note.htmlText;
    navigator.clipboard
      .writeText(noteText)
      .then(() => {
        setSystemNotif({
          show: true,
          title: "Copied",
          text: "Your note has been copied as HTML to your clipboard",
          color: "bg-green-300",
          hasCancel: false,
          actions: [
            {
              text: "close",
              func: (): void =>
                setSystemNotif({
                  show: false,
                  title: "",
                  text: "",
                  color: "",
                  hasCancel: false,
                  actions: []
                })
            }
          ]
        });
      })
      .catch((err) => {
        console.log(err);
        setSystemNotif({
          show: true,
          title: "Copy Failed",
          text: "We cannot copy your not to the clip board. Try using the context menu to save your note text as a plain text document instead.",
          color: "bg-red-300",
          hasCancel: false,
          actions: [
            {
              text: "close",
              func: (): void =>
                setSystemNotif({
                  show: false,
                  title: "",
                  text: "",
                  color: "",
                  hasCancel: false,
                  actions: []
                })
            }
          ]
        });
      });
  };

  // const trashNote = (): void => {
  //   setSystemNotif({
  //     show: true,
  //     title: `Delete Note ${note.title}`,
  //     text: `Are you sure you want to delete note ${note.title}?`,
  //     color: "bg-red-300",
  //     hasCancel: true,
  //     actions: [
  //       {
  //         text: "close",
  //         func: (): void =>
  //           setSystemNotif({
  //             show: false,
  //             title: "",
  //             text: "",
  //             color: "",
  //             hasCancel: false,
  //             actions: []
  //           })
  //       },
  //       { text: "trash note", func: (): void => {} },
  //       { text: "delete", func: (): void => {} }
  //     ]
  //   });
  // };

  // const shareNote = (): void => {};

  return (
    <>
      <div
        className={`fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20`}
        onClick={() => setNote(null)}
      ></div>
      <div
        className={`fixed z-40 ${
          userPreferences.darkMode ? "bg-black" : "bg-white"
        } inset-10 overflow-y-auto no-scroll-bar rounded-md shadow-md px-5 pb-5`}
      >
        <div
          className={`flex justify-between items-center sticky top-0 right-0 left-0 ${
            userPreferences.darkMode ? "bg-black" : "bg-white"
          } bg-opacity-20 backdrop-blur-sm`}
        >
          <p className="text-3xl py-4">{note.title}</p>
          <div className="flex justify-center items-center gap-x-3">
            <button onClick={() => copyNoteText()}>
              <FaCopy />
            </button>
            {/* <button onClick={() => shareNote()}>
              <FaShareAlt />
            </button> */}
            <button onClick={() => editNote()}>
              <FaEdit />
            </button>
            {/* <button onClick={() => trashNote()}>
              <FaTrashAlt />
            </button> */}
          </div>
        </div>
        <div className="renderHtml mt-5" dangerouslySetInnerHTML={{ __html: htmlToRender }}></div>
      </div>
    </>
  );
};

export default NoteView;
