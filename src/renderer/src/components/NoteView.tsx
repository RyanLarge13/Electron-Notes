import { motion, useDragControls } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { CiDesktop } from "react-icons/ci";
import { FaCopy, FaEdit, FaShareAlt } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { MdDragHandle, MdMinimize, MdNotAccessible } from "react-icons/md";
import { TbMaximize } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import UserContext from "@renderer/contexxt/UserContext";
import { Note } from "@renderer/types/types";

const NoteView = ({ note }: { note: Note }): JSX.Element => {
  const {
    userPreferences,
    minimizeArray,
    setNoteShare,
    setMinimizeArray,
    setUserPreferences,
    setNote,
    setNoteToEdit,
    showErrorNotification,
    showSuccessNotification
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

  const noteRef = useRef(null);

  const navigate = useNavigate();
  const noteDragControl = useDragControls();

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
    setNote((prev) => prev.filter((aNote: Note) => aNote.noteid !== note.noteid));
    navigate("/newnote");
  };

  const copyNoteText = (): void => {
    const noteText = note.htmlText;
    navigator.clipboard
      .writeText(noteText)
      .then(() => {
        showSuccessNotification(
          "Copied",
          "Your note has been copied as HTML to your clipboard",
          false,
          []
        );
      })
      .catch((err) => {
        console.log(err);
        showErrorNotification(
          "Copy Failed",
          "We cannot copy your not to the clip board. Try using the context menu to save your note text as a plain text document instead",
          false,
          []
        );
      });
  };

  const openWindow = async (note: Note): Promise<void> => {
    await window.openNewWin.openNoteInNewWindow(note, userPreferences.darkMode);
    setNote((prev: Note[]): Note[] => prev.filter((aNote: Note) => aNote.noteid !== note.noteid));
    setMinimizeArray((prev: string[]): string[] => prev.filter((id: string) => id !== note.noteid));
  };

  const handleDragEnd = (): void => {
    let newDems: { id: string; top: number; left: number; width: number; height: number }[] = [];

    if (!noteRef.current) {
      return;
    }

    const rect = noteRef.current.getBoundingClientRect();
    const totalHeight = window.innerHeight;
    const totalWidth = window.innerWidth;

    let newTop = rect.top;
    let newLeft = rect.left;

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
      const percentagePointer = ((offsetY + noteTop) / window.innerHeight) * 100;
      setNoteHeight(100 - percentagePointer);
    }
  };

  const handleResizeHeightMove = (e): void => {
    if (noteRef && noteRef.current && resizing) {
      const rect = noteRef.current.getBoundingClientRect();
      const offsetY = e.pageY - rect.top;
      const percentagePointer = ((offsetY + noteTop) / window.innerHeight) * 100;
      // if (rect.height > 200 && rect.height < window.innerHeight - 40) {
      setNoteHeight(100 - percentagePointer);
      // }
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

  const updateDems = (): void => {
    if (!noteRef.current) {
      return;
    }

    const rect = noteRef.current.getBoundingClientRect();

    const top = rect.top;
    const left = rect.left;

    const width = 100 - (rect.right / window.innerWidth) * 100;
    const height = 100 - (rect.bottom / window.innerHeight) * 100;

    setNoteTop(top);
    setNoteLeft(left);
    setNoteWidth(width);
    setNoteHeight(height);
  };

  const minimizeThisNote = (noteid: string): void => {
    setMinimizeArray((prev: string[]): string[] => {
      if (prev.length > 0) {
        if (prev.includes(noteid)) {
          return prev.filter((id) => id !== noteid);
        } else {
          updateDems();
          return [...prev, noteid];
        }
      } else {
        updateDems();
        return [noteid];
      }
    });
  };

  const findIndex = (noteid: string): number => {
    const index = minimizeArray.indexOf(noteid);
    return index;
  };

  const shareNote = (note: Note): void => {
    setNoteShare(() => {
      return {
        show: true,
        notes: [note.noteid],
        connections: []
      };
    });
  };

  return (
    <>
      <motion.div
        ref={noteRef}
        drag={!resizing && !includesMinimize}
        dragControls={noteDragControl}
        dragListener={false}
        dragMomentum={false}
        dragSnapToOrigin={false}
        initial={
          includesMinimize
            ? {
                x: 0,
                y: 0,
                right: 0,
                left: 0,
                top: 0,
                bottom: 0
              }
            : {
                right: `${noteWidth}%`,
                bottom: `${noteHeight}%`,
                top: `${noteTop}px`,
                left: `${noteLeft}px`
              }
        }
        animate={
          includesMinimize
            ? {
                x: 0 + 100 * findIndex(note.noteid),
                y: 0 + 30 * findIndex(note.noteid),
                top: 0,
                left: 0,
                right: "100%",
                bottom: "100%",
                zIndex: findIndex(note.noteid)
              }
            : {
                right: `${noteWidth}%`,
                bottom: `${noteHeight}%`,
                top: `${noteTop}px`,
                left: `${noteLeft}px`
              }
        }
        onDragEnd={handleDragEnd}
        whileDrag={{ boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`, cursor: "grabbing" }}
        className={`shadow-md fixed z-40 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-white"
        } ${includesMinimize ? `w-80 h-10 min-h-10 max-h-10 max-w-80 min-w-80 shadow-white shadow-sm` : "min-w-80 max-w-[95%] max-h-[90%]"} min-h-40 overflow-hidden origin-bottom select-none rounded-md cursor shadow-md pb-5`}
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
            <Tooltip id={`move-note-${note.noteid}`} />
            <Tooltip id={`minimize-note-${note.noteid}`} />
            <Tooltip id={`new-win-note-${note.noteid}`} />
            <Tooltip id={`close-note-${note.noteid}`} />
            <button
              onPointerDown={(e) => noteDragControl.start(e)}
              style={{ touchAction: "none" }}
              className={`${includesMinimize ? "cursor-not-allowed" : "cursor-move"} text-xs text-black p-[3px] rounded-full bg-sky-300`}
              data-tooltip-id={`move-note-${note.noteid}`}
              data-tooltip-content={includesMinimize ? "" : "Move Around Your Note"}
            >
              {includesMinimize ? <MdNotAccessible /> : <MdDragHandle />}
            </button>
            <button
              onClick={() => minimizeThisNote(note.noteid)}
              className="text-xs text-black p-[3px] rounded-full bg-orange-300"
              data-tooltip-id={`minimize-note-${note.noteid}`}
              data-tooltip-content={includesMinimize ? "Maximize" : "Minimize"}
            >
              {includesMinimize ? <TbMaximize /> : <MdMinimize />}
            </button>
            <button
              className="text-xs text-black p-[3px] rounded-full bg-green-300"
              onClick={() => openWindow(note)}
              data-tooltip-id={`new-win-note-${note.noteid}`}
              data-tooltip-content="Open In New Window"
            >
              <CiDesktop />
            </button>
            <button
              className="text-xs text-black p-[3px] rounded-full bg-rose-300"
              data-tooltip-id={`close-note-${note.noteid}`}
              data-tooltip-content="Close Note"
              onClick={() => {
                setNote((prev: Note[]) =>
                  prev.filter((aNote: Note) => aNote.noteid !== note.noteid)
                );
                setMinimizeArray((prev: string[]) =>
                  prev.filter((theNote: string) => theNote !== note.noteid)
                );
              }}
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
            <button onClick={() => shareNote(note)}>
              <FaShareAlt />
            </button>
            <button
              data-tooltip-id="edit-note"
              data-tooltip-content="Edit Your Note"
              onClick={() => editNote()}
            >
              <FaEdit />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full no-scroll-bar">
          <div
            onDoubleClick={() => editNote()}
            className="renderHtml mt-5 px-5"
            dangerouslySetInnerHTML={{ __html: htmlToRender }}
          ></div>
        </div>
      </motion.div>
    </>
  );
};

export default NoteView;
