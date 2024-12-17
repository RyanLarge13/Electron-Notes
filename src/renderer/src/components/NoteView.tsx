import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCopy, FaEdit } from "react-icons/fa";
import UserContext from "@renderer/contexxt/UserContext";
import { IoCloseCircle } from "react-icons/io5";
import { MdDragHandle } from "react-icons/md";
import { CiDesktop } from "react-icons/ci";
import { Tooltip } from "react-tooltip";
import { Note } from "@renderer/types/types";

const NoteView = (): JSX.Element => {
  const { note, userPreferences, setUserPreferences, setNote, setNoteToEdit, setSystemNotif } =
    useContext(UserContext);

  const [resizing, setResizing] = useState(true);
  const [resizeXPxW, setResizeXPxW] = useState(0);
  const [initialX, setInitialX] = useState(0);
  const [isResizingX, setIsResizingX] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [initialY, setInitialY] = useState(0);

  const [htmlToRender, setHtmlToRender] = useState(note.htmlText);
  const [noteWidth, setNoteWidth] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.width || 45
  );
  const [noteHeight, setNoteHeight] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.height || 75
  );
  const [noteTop, setNoteTop] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.top || 50
  );
  const [noteLeft, setNoteLeft] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.left || 50
  );

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

  const openWindow = async (note: Note): Promise<void> => {
    await window.openNewWin.openNoteInNewWindow(note, userPreferences.darkMode);
    setNote(null);
  };

  const handleDragEnd = (e: DragEvent): void => {
    let newDems: { id: string; top: number; left: number; width: number; height: number }[] = [];
    if (!userPreferences?.noteDems || userPreferences.noteDems.length < 1) {
      newDems = [
        {
          id: note.noteid,
          // top: e.clientY - noteHeight / 2,
          // left: e.clientX - noteWidth / 2,
          top: 0,
          left: 0,
          height: noteHeight,
          width: noteWidth
        }
      ];
    } else {
      if (userPreferences.noteDems.find((dem) => dem.id === note.noteid)) {
        newDems = userPreferences.noteDems.map((dem) => {
          if (dem.id === note.noteid) {
            // return { ...dem, top: e.clientY - noteHeight / 2, left: e.clientX - noteWidth / 2 };
            return { ...dem, top: 0, left: 0 };
          } else {
            return dem;
          }
        });
      } else {
        newDems = [
          ...userPreferences.noteDems,
          {
            id: note.noteid,
            top: noteTop,
            left: noteLeft,
            width: noteWidth,
            height: noteHeight
          }
        ];
      }
    }

    const newPreferences = { ...userPreferences, noteDems: newDems };
    setUserPreferences(newPreferences);

    localStorage.setItem("preferences", JSON.stringify(newPreferences));
  };

  const handleResizeWidth = (e) => {
    const width = e.target.getBoundingClientRect().width;
    setResizeXPxW(width);
    setInitialX(e.clientX);
    setIsResizingX(true);
    setResizing(false);
  };

  const handleResizeWidthMove = (e) => {
    if (isResizingX) {
      const offset = e.clientX - initialX;
      setOffsetX(offset);
      const newPercentage = noteWidth + (offset / resizeXPxW) * 100;
      setNoteWidth(Math.max(0, Math.min(100, newPercentage)));
    }
  };

  const handleResizeWidthUp = (e) => {
    setIsResizingX(false);
  };

  const handleResizeHeight = (e) => {
    setResizing(false);
  };

  return (
    <>
      {/* {!minimize ? ( */}
      <div
        className="bg-black backdrop-blur-sm bg-opacity-20 fixed z-40 inset-0"
        onClick={() => setNote(null)}
      ></div>
      {/* ) : null} */}
      <motion.div
        drag={resizing}
        // dragConstraints={{ top: 0, bottom: 250, right: 1000, left: 0 }}
        dragSnapToOrigin={false}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          width: `${noteWidth}%`,
          height: `${noteHeight}%`,
          top: `${noteTop}px`,
          left: `${noteLeft}px`
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ outline: "2px solid rgba(255,255,255,0.5" }}
        className={`shadow-md fixed z-40 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-white"
        } inset-10 right-[55%] overflow-y-auto origin-bottom no-scroll-bar rounded-md shadow-md pb-5`}
      >
        <div
          className="absolute right-0 top-[50%] translate-y-[-50%] w-1 h-20 rounded-full bg-red-400 cursor-grab"
          onPointerDown={handleResizeWidth}
          onPointerMove={handleResizeWidthMove}
          onPointerUp={handleResizeWidthUp}
        ></div>
        <div
          className="absolute bottom-0 left-[50%] translate-x-[-50%] w-20 h-1 rounded-full bg-red-400 cursor-grab"
          onPointerDown={handleResizeHeight}
        ></div>
        <div
          className={`p-2 sticky z-[40] top-0 ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-200"} rounded-t-md flex justify-between items-center`}
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
              onClick={() => openWindow(note)}
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
          className={`flex justify-between items-center sticky top-10 right-0 left-0 ${
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
          className="renderHtml mt-5 px-5"
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
