import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCopy, FaEdit } from "react-icons/fa";
import UserContext from "@renderer/contexxt/UserContext";
import { IoCloseCircle } from "react-icons/io5";
import { MdDragHandle, MdMinimize } from "react-icons/md";
import { CiDesktop } from "react-icons/ci";
import { Tooltip } from "react-tooltip";
import { Note } from "@renderer/types/types";

const NoteView = ({ note }: { note: Note }): JSX.Element => {
  const {
    userPreferences,
    minimizeArray,
    setMinimizeArray,
    setUserPreferences,
    setNote,
    setNoteToEdit,
    setSystemNotif
  } = useContext(UserContext);

  const [resizing, setResizing] = useState(false);

  const [includesMinimize, setIncludesMinimized] = useState(false);

  const [htmlToRender, setHtmlToRender] = useState(note.htmlText);

  const [noteWidth, setNoteWidth] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.width || 45
  );
  const [noteHeight, setNoteHeight] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.height || 10
  );
  const [noteTop, setNoteTop] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.top || 50
  );
  const [noteLeft, setNoteLeft] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === note.noteid)?.left || 50
  );
  const [offsets, setOffsets] = useState({ top: 0, left: 0 });

  const noteRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const contains = userPreferences.unsavedNotes.filter((unsaved) => unsaved.id === note.noteid);
    if (contains.length > 0) {
      setHtmlToRender(contains[0].htmlText);
    }
  }, []);

  useEffect(() => {
    if (minimizeArray.length > 0) {
      if (minimizeArray.includes(note.noteid)) {
        setIncludesMinimized(true);
      } else {
        setIncludesMinimized(false);
      }
    } else {
      setIncludesMinimized(false);
    }
  }, [minimizeArray]);

  const editNote = (): void => {
    setNoteToEdit((prev) => [...prev, note]);
    setNote((prev) => prev.filter((aNote) => aNote.noteid !== note.noteid));
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
    setNote([]);
  };

  const handleDragEnd = (): void => {
    let newDems: { id: string; top: number; left: number; width: number; height: number }[] = [];
    // const newTop = e.clientY - noteHeight / 2;
    // const newLeft = e.clientX - noteWidth / 2;

    const rect = noteRef.current.getBoundingClientRect();
    const totalHeight = window.innerHeight;
    const totalWidth = window.innerWidth;

    let newTop = rect.top;
    let newLeft = rect.left;

    setOffsets({ top: newTop - noteTop, left: newLeft - noteLeft });

    let newRectRight = rect.right;
    let newRectBottom = rect.bottom;

    if (newTop < 10) {
      newTop = 10;
    }

    if (newLeft < 10) {
      newLeft = 10;
    }

    if (rect.bottom > window.innerHeight) {
      newTop = window.innerHeight - rect.height - 10;
      newRectBottom = 10;
    }

    if (rect.right > window.innerWidth) {
      newLeft = window.innerWidth - rect.width - 10;
      newRectRight = 10;
    }

    const newWidth = 100 - (newRectRight / totalWidth) * 100;
    const newHeight = 100 - (newRectBottom / totalHeight) * 100;

    const preDefDems = {
      id: note.noteid,
      top: newTop,
      left: newLeft,
      height: newHeight,
      width: newWidth
    };

    if (!userPreferences?.noteDems || userPreferences.noteDems.length < 1) {
      newDems = [preDefDems];
    } else {
      if (userPreferences.noteDems.find((dem) => dem.id === note.noteid)) {
        newDems = userPreferences.noteDems.map((dem) => {
          if (dem.id === note.noteid) {
            return preDefDems;
          } else {
            return dem;
          }
        });
      } else {
        newDems = [...userPreferences.noteDems, preDefDems];
      }
    }

    const newPreferences = { ...userPreferences, noteDems: newDems };
    setUserPreferences(newPreferences);

    localStorage.setItem("preferences", JSON.stringify(newPreferences));
  };

  const handleResizeWidth = (e): void => {
    e.stopPropagation();
    if (noteRef && noteRef.current) {
      e.target.setPointerCapture(e.pointerId);
      setResizing(true);
      const rect = noteRef.current.getBoundingClientRect();
      const offsetX = e.pageX - rect.left;
      const percentagePointer = ((offsetX + noteLeft) / window.innerWidth) * 100;
      setNoteWidth(100 - percentagePointer);
    }
  };

  const handleResizeWidthMove = (e): void => {
    e.stopPropagation();
    if (noteRef && noteRef.current && resizing) {
      const rect = noteRef.current.getBoundingClientRect();
      const offsetX = e.pageX - rect.left;
      const percentagePointer = ((offsetX + noteLeft) / window.innerWidth) * 100;
      if (rect.width > 200 && rect.width < window.innerWidth - 40) {
        setNoteWidth(100 - percentagePointer);
      }
    }
  };

  const handleResizeWidthUp = (e): void => {
    e.target.releasePointerCapture(e.pointerId);
    setResizing(false);

    handleDragEnd();
  };

  const handleResizeHeight = (e): void => {
    e.stopPropagation();
    if (noteRef && noteRef.current) {
      e.target.setPointerCapture(e.pointerId);
      setResizing(true);
      const rect = noteRef.current.getBoundingClientRect();
      const offsetY = e.pageY - rect.top;
      const percentagePointer = ((offsetY + noteTop - 45) / window.innerHeight) * 100;
      setNoteHeight(100 - percentagePointer);
    }
  };

  const handleResizeHeightMove = (e): void => {
    if (noteRef && noteRef.current && resizing) {
      const rect = noteRef.current.getBoundingClientRect();
      const offsetY = e.pageY - rect.top;
      const percentagePointer = ((offsetY + noteTop - 45) / window.innerHeight) * 100;
      if (rect.height > 200 && rect.height < window.innerHeight - 40) {
        setNoteHeight(100 - percentagePointer);
      }
    }
  };

  const handleResizeHeightUp = (e): void => {
    e.target.releasePointerCapture(e.pointerId);
    setResizing(false);

    handleDragEnd();
  };

  const handleCancelH = (): void => {
    setResizing(false);
  };

  const handleCancelW = (): void => {
    setResizing(false);
  };

  const minimize = (): void => {
    if (noteRef.current) {
      const fromTop = noteRef.current.getBoundingClientRect().top;
      console.log(fromTop);
    }
  };

  const minimizeThisNote = (noteid: string): void => {
    setMinimizeArray((prev: string[]): string[] => {
      if (prev.length > 0) {
        if (prev.includes(noteid)) {
          return prev.filter((id) => id !== noteid);
        } else {
          minimize();
          return [...prev, noteid];
        }
      } else {
        minimize();
        return [noteid];
      }
    });
  };

  return (
    <>
      <motion.div
        ref={noteRef}
        drag={!resizing && !includesMinimize}
        // dragConstraints={{ top: 0, left: 0 }}
        dragMomentum={false}
        dragSnapToOrigin={false}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          right: `${noteWidth}%`,
          bottom: `${noteHeight}%`,
          top: `${noteTop}px`,
          left: `${noteLeft}px`,
          transition: { duration: !resizing ? 0 : 0.25 }
        }}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }}
        whileDrag={{ boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`, cursor: "grabbing" }}
        className={`shadow-md fixed z-40 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-white"
        } ${includesMinimize ? `w-80 h-10 min-h-10 max-h-10` : ""} overflow-hidden origin-bottom select-none rounded-md cursor shadow-md pb-5 min-w-80 min-h-80 max-w-[95%] max-h-[90%]`}
      >
        <div
          className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} absolute isolate right-0 touch-none top-[50%] translate-y-[-50%] w-1 h-20 rounded-full ${resizing ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handleResizeWidth}
          onPointerMove={handleResizeWidthMove}
          onPointerUp={handleResizeWidthUp}
          onPointerCancel={handleCancelW}
        ></div>
        <div
          className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} absolute isolate bottom-0 left-[50%] translate-x-[-50%] w-20 h-1 rounded-full touch-none ${resizing ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handleResizeHeight}
          onPointerMove={handleResizeHeightMove}
          onPointerUp={handleResizeHeightUp}
          onPointerCancel={handleCancelH}
        ></div>
        <div
          className={`p-2 sticky z-[40] top-0 ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-200"} rounded-t-md flex justify-between items-center`}
        >
          <p>
            {includesMinimize
              ? note.title
              : `Created On 
            ${new Date(note.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}`}
          </p>
          <div className="flex justify-between items-center gap-x-2">
            <Tooltip id="move-note" />
            <Tooltip id="minimize-note" />
            <Tooltip id="new-win-note" />
            <Tooltip id="close-note" />
            <button
              className="cursor-move text-xs text-black p-[3px] rounded-full bg-amber-300"
              data-tooltip-id="move-note"
              data-tooltip-content="Move Around Your Note"
            >
              <MdDragHandle />
            </button>
            <button
              onClick={() => minimizeThisNote(note.noteid)}
              className="text-xs text-black p-[3px] rounded-full bg-orange-300"
              data-tooltip-id="minimize-note"
              data-tooltip-content="Minimize Your Note"
            >
              <MdMinimize />
            </button>
            <button
              className="text-xs text-black p-[3px] rounded-full bg-blue-300"
              onClick={() => openWindow(note)}
              data-tooltip-id="new-win-note"
              data-tooltip-content="Open Your Note In New Window"
            >
              <CiDesktop />
            </button>
            <button
              className="text-xs text-black p-[3px] rounded-full bg-rose-300"
              data-tooltip-id="close-note"
              data-tooltip-content="Close Note"
              onClick={() =>
                setNote((prev) => prev.filter((aNote) => aNote.noteid !== note.noteid))
              }
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
        <div className="overflow-y-auto h-full no-scroll-bar">
          <div
            className="renderHtml mt-5 px-5"
            dangerouslySetInnerHTML={{ __html: htmlToRender }}
          ></div>
        </div>
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
