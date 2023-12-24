import { useContext, useState } from "react";
import UserContext from "@renderer/contexxt/UserContext";
import { TbNotes } from "react-icons/tb";
import { createNewNote, deleteANote } from "@renderer/utils/api";
import { FaLock } from "react-icons/fa";

const Notes = (): JSX.Element => {
  const {
    notes,
    notesToRender,
    token,
    view,
    allData,
    setNote,
    setAllData,
    setContextMenu,
    setPosition,
    setSystemNotif
  } = useContext(UserContext);

  const [pinInput, setPinInput] = useState(false);
  const [pin, setPin] = useState({ first: "", second: "", third: "", fourth: "" });

  const edit = (note) => {
    setNote(note);
    setContextMenu({ show: false });
  };

  const confirmDuplicate = (note) => {
    setContextMenu({ show: false });
    const newConfirmation = {
      show: true,
      title: `Duplicate ${note.title}`,
      text: `Are you sure you want to duplicate this note?`,
      color: "bg-green-400",
      hasCancel: true,
      actions: [
        { text: "cancel", func: () => setSystemNotif({ show: false }) },
        { text: "duplicate", func: () => duplicate(note) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const duplicate = (note): void => {
    const noteToDuplicate = {
      title: note.title,
      htmlNotes: note.htmltexxt,
      folderId: note.folderId
    };
    createNewNote(token, noteToDuplicate)
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
        setSystemNotif({ show: false });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished note upload attempt");
      });
  };

  const rename = (note): void => {};
  const move = (note): void => {};

  const confirmDelete = (note): void => {
    setContextMenu({ show: false });
    const newConfirmation = {
      show: true,
      title: `Delete ${note.title}`,
      text: `Are you sure you want to delete this note?`,
      color: "bg-red-400",
      hasCancel: true,
      actions: [
        { text: "cancel", func: () => setSystemNotif({ show: false }) },
        { text: "delete", func: () => deleteNote(note) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const deleteNote = (note): void => {
    deleteANote(token, note.noteid)
      .then((res) => {
        const noteIdToDelete = res.data.data[0].notesid;
        const newNotes = allData.notes.filter((aNote) => aNote.noteid !== noteIdToDelete);
        setAllData((prevData) => {
          const newData = {
            ...prevData,
            notes: newNotes
          };
          return newData;
        });
        setSystemNotif({ show: false });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("attempted to delete a note");
      });
  };

  const openNotesOptions = (event, note): void => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setPosition({ top: clientY, left: clientX });
    const newMenu = {
      show: true,
      meta: {
        title: note.title,
        color: "bg-slate-300"
      },
      options: [
        {
          title: "edit",
          func: () => edit(note)
        },
        {
          title: "move",
          func: () => move(note)
        },
        {
          title: "duplicate",
          func: () => confirmDuplicate(note)
        },
        {
          title: "rename",
          func: () => rename(note)
        },
        {
          title: "delete",
          func: () => confirmDelete(note)
        }
      ]
    };
    setContextMenu(newMenu);
  };

  const openNote = (note): void => {
    if (note.locked) {
      return setPinInput(true);
    }
    setNote(note);
  };

  const handlePinInput = (e, level) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    if (level === "first") {
      setPin((prev) => {
        return { ...prev, first: newValue };
      });
    }
  };

  return (
    <div className="relative flex flex-wrap justify-start items-start gap-5 w-full my-10">
      {notesToRender.map((note) => (
        <div
          onContextMenu={(e) => openNotesOptions(e, note)}
          key={note.noteid}
          className={`${
            view === "list" ? "w-full" : "w-[45%]"
          } max-w-60 h-80 bg-slate-900 p-3 rounded-md shadow-lg overflow-hidden relative`}
          onClick={() => openNote(note)}
        >
          <div aria-hidden="true" className="absolute inset-0 radial-gradient"></div>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-xl">{note.title}</h3>
            <TbNotes />
          </div>
          {note.locked ? (
            <div className="absolute bottom-3 left-3">
              <FaLock className="text-red-300" />
            </div>
          ) : (
            <div
              className="mt-3 renderHtml"
              dangerouslySetInnerHTML={{ __html: note.htmlText }}
            ></div>
          )}
        </div>
      ))}
      {pinInput && (
        <>
          <div
            onClick={() => {
              setPin({ first: "", second: "", third: "", fourth: "" });
              setPinInput(false);
            }}
            className="fixed bg-transparent inset-0"
          ></div>
          <form className="p-5 fixed bottom-5 left-5 rounded-md shadow-md bg-slate-900 flex justify-center items-center gap-x-5">
            <input
              value={pin.first}
              type="password"
              onChange={(e) => handlePinInput(e, "first")}
              className="w-10 h-10 bg-slate-700 text-4xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
            <input
              value={pin.second}
              className="w-10 h-10 bg-slate-700 text-4xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
            <input
              value={pin.third}
              className="w-10 h-10 bg-slate-700 text-4xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
            <input
              value={pin.fourth}
              className="w-10 h-10 bg-slate-700 text-4xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
          </form>
        </>
      )}
    </div>
  );
};

export default Notes;
