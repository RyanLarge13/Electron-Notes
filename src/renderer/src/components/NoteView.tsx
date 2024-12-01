import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCopy, FaEdit, FaShareAlt, FaTrashAlt } from "react-icons/fa";
import UserContext from "@renderer/contexxt/UserContext";
import { IoCloseCircle } from "react-icons/io5";
import { MdDragHandle } from "react-icons/md";
import { CiDesktop, CiMaximize1, CiMinimize1 } from "react-icons/ci";
import { Tooltip } from "react-tooltip";

const NoteView = (): JSX.Element => {
  const { note, userPreferences, setNote, setNoteToEdit, setSystemNotif } = useContext(UserContext);

  const [htmlToRender, setHtmlToRender] = useState(note.htmlText);
  const [minimize, setMinimize] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const contains = userPreferences.unsavedNotes.filter((unsaved) => unsaved.id === note.noteid);
    if (contains.length > 0) {
      setHtmlToRender(contains[0].htmlText);
    }
  }, []);

  const minimizeWin = () => {
    setMinimize(true);
  };

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
      {/* {!minimize ? ( */}
      <div
        className={`${minimize ? "bg-transparent pointer-events-none" : "bg-black backdrop-blur-sm bg-opacity-20"} fixed z-40 inset-0`}
        onClick={() => (minimize ? setMinimize(false) : setNote(null))}
      ></div>
      {/* ) : null} */}
      <motion.div
        drag={true}
        dragConstraints={{ top: 0, bottom: 250, right: 1000, left: 0 }}
        dragSnapToOrigin={minimize}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          width: minimize ? "30px" : null,
          height: minimize ? "300px" : null,
          left: minimize ? 0 : null,
          top: minimize ? 150 : null
        }}
        whileDrag={{ outline: "2px solid rgba(255,255,255,0.5" }}
        className={`${minimize ? "bg-[#444]" : ""} fixed z-40 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-white"
        } inset-10 right-[55%] overflow-y-auto origin-bottom no-scroll-bar rounded-md shadow-md pb-5`}
      >
        {minimize ? (
          <div className="p-2">
            <button onClick={() => setMinimize(false)}>
              <CiMaximize1 />
            </button>
            <p className="mode-vert mt-10 ml-[-5px]">{note.title}</p>
          </div>
        ) : null}
        <div
          className={`p-2 sticky z-[40] top-0 bg-[#333] rounded-t-md flex justify-between items-center ${minimize ? "hidden" : ""}`}
        >
          <p>
            Created On{" "}
            {new Date(note.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </p>
          <div className="flex justify-between items-center gap-x-3">
            <Tooltip id="move-note" />
            <Tooltip id="pin-note" />
            <Tooltip id="new-win-note" />
            <Tooltip id="close-note" />
            <button
              className="cursor-move text-xl"
              data-tooltip-id="move-note"
              data-tooltip-content="Move Around Your Note"
            >
              <MdDragHandle />
            </button>
            <button
              onClick={() => minimizeWin()}
              data-tooltip-id="pin-note"
              data-tooltip-content="Minimize Your Note"
            >
              <CiMinimize1 />
            </button>
            <button
              data-tooltip-id="new-win-note"
              data-tooltip-content="Open Your Note In New Window"
            >
              <CiDesktop />
            </button>
            <button
              data-tooltip-id="close-note"
              data-tooltip-content="Close Note"
              onClick={() => setNote(null)}
            >
              <IoCloseCircle />
            </button>
          </div>
        </div>
        <div
          className={`${minimize ? "hidden" : ""} flex justify-between items-center sticky top-10 right-0 left-0 ${
            userPreferences.darkMode ? "bg-[#444]" : "bg-white"
          } p-3 rounded-b-md`}
        >
          <p className="text-3xl">{note.title}</p>
          <div className="flex justify-center items-center gap-x-3">
            <Tooltip id="copy-note" />
            <Tooltip id="edit-note" />
            <button
              data-tooltip-id="copy-note"
              data-tooltip-content="Copy Note As HTML"
              onClick={() => copyNoteText()}
            >
              <FaCopy />
            </button>
            {/* <button onClick={() => shareNote()}>
              <FaShareAlt />
            </button> */}
            <button
              data-tooltip-id="edit-note"
              data-tooltip-content="Edit Your Note"
              onClick={() => editNote()}
            >
              <FaEdit />
            </button>
            {/* <button onClick={() => trashNote()}>
              <FaTrashAlt />
            </button> */}
          </div>
        </div>
        <div
          className={`renderHtml mt-5 px-5 ${minimize ? "hidden" : ""}`}
          dangerouslySetInnerHTML={{ __html: htmlToRender }}
        ></div>
      </motion.div>
      {/* <div
        className={`fixed z-40 ${
          userPreferences.darkMode ? "" : ""
        } inset-10 hidden md:block md:left-[63%] bg-black bg-opacity-20 overflow-y-auto no-scroll-bar rounded-md shadow-md px-5 pb-5`}
      ></div> */}
    </>
  );
};

export default NoteView;
