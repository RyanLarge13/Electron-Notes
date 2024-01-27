import { useContext, useState, useRef, useEffect } from "react";
import { createNewNote, deleteANote, updateNote } from "@renderer/utils/api";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { TbNotes } from "react-icons/tb";
import UserContext from "@renderer/contexxt/UserContext";

const Notes = (): JSX.Element => {
  const {
    setNote,
    setAllData,
    setContextMenu,
    setPosition,
    setSystemNotif,
    setNoteToEdit,
    setMove,
    notesToRender,
    token,
    allData,
    view,
    userPreferences
  } = useContext(UserContext);

  const [pinInput, setPinInput] = useState(false);
  const [pin, setPin] = useState({ first: "", second: "", third: "", fourth: "" });
  const [awaitingNote, setAwaitingNote] = useState(null);
  const [renameANote, setRenameANote] = useState(null);
  const [renameText, setRenameText] = useState("");

  const firstInput = useRef(null);
  const secondInput = useRef(null);
  const thirdInput = useRef(null);
  const fourthInput = useRef(null);
  const renameRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (pinInput && firstInput.current) {
      firstInput.current.focus();
    }
  }, [pinInput]);

  useEffect(() => {
    if (pin.fourth !== "") {
      const validPin = checkPin();
      if (validPin) {
        return unlockNote();
      }
      const newError = {
        show: true,
        title: "Invalid Pin",
        text: "Enter your valid pin to view your locked notes",
        color: "bg-red-300",
        hasCancel: false,
        actions: [
          {
            text: "close",
            func: () =>
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
      };
      setSystemNotif(newError);
      setPin({ first: "", second: "", third: "", fourth: "" });
      firstInput.current.focus();
    }
  }, [pin.fourth]);

  const edit = (note): void => {
    if (note.locked) {
      setContextMenu({
        show: false,
        meta: { title: "", color: "" },
        options: []
      });
      setAwaitingNote(note);
      return setPinInput(true);
    }
    setNoteToEdit(note);
    navigate("/newnote");
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
  };

  const confirmDuplicate = (note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const newConfirmation = {
      show: true,
      title: `Duplicate ${note.title}`,
      text: `Are you sure you want to duplicate this note?`,
      color: "bg-green-400",
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: () =>
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            })
        },
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
        setSystemNotif({
          show: false,
          title: "",
          text: "",
          color: "",
          hasCancel: false,
          actions: []
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished note upload attempt");
      });
  };

  const rename = (note): void => {
    setRenameANote(note);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    if (renameRef.current) {
      renameRef.current.focus();
    }
    setTimeout(() => {
      renameRef.current.focus();
    }, 250);
  };

  const changeTitle = (e): void => {
    e.preventDefault();
    const newNote = {
      notesId: renameANote.noteid,
      htmlNotes: renameANote.htmlText,
      locked: renameANote.locked,
      title: renameText,
      folderId: renameANote.folderId
    };
    updateNote(token, newNote)
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
        setRenameANote(null);
        setRenameText("");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const move = (note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setMove({
      isMoving: true,
      from: note.folderId,
      itemTitle: note.title,
      item: note,
      type: "note"
    });
  };

  const confirmDelete = (note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const newConfirmation = {
      show: true,
      title: `Delete ${note.title}`,
      text: `Are you sure you want to delete this note?`,
      color: "bg-red-400",
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: () =>
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            })
        },
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
        setSystemNotif({
          show: false,
          title: "",
          text: "",
          color: "",
          hasCancel: false,
          actions: []
        });
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
    event.stopPropagation();
    const { clientX, clientY } = event;
    let dynamicTop = clientY;
    let dynamicLeft = clientX;
    if (clientY + 185 > window.innerHeight) {
      dynamicTop -= 185;
    }
    if (clientX + 200 > window.innerWidth) {
      dynamicLeft -= 245;
    }
    setPosition({ top: dynamicTop, left: dynamicLeft });
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
      setAwaitingNote(note);
      return setPinInput(true);
    }
    setNote(note);
  };

  const unlockNote = (): void => {
    localStorage.setItem("pin", JSON.stringify(pin));
    setPinInput(false);
    setPin({ first: "", second: "", third: "", fourth: "" });
    setNote(awaitingNote);
    setAwaitingNote(null);
  };

  const checkPin = (): boolean => {
    const currentPin = userPreferences.lockPin;
    if (
      currentPin[0] === Number(pin.first) &&
      currentPin[1] === Number(pin.second) &&
      currentPin[2] === Number(pin.third) &&
      currentPin[3] === Number(pin.fourth)
    ) {
      return true;
    }
    return false;
  };

  const handlePinInput = (e, level): void => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    if (level === "first") {
      setPin((prev) => {
        return { ...prev, first: newValue };
      });
      secondInput.current.focus();
    }
    if (level === "second") {
      setPin((prev) => {
        return { ...prev, second: newValue };
      });
      thirdInput.current.focus();
    }
    if (level === "third") {
      setPin((prev) => {
        return { ...prev, third: newValue };
      });
      fourthInput.current.focus();
    }
    if (level === "fourth") {
      setPin((prev) => {
        return { ...prev, fourth: newValue };
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
          onClick={() => (!renameANote ? openNote(note) : renameRef.current.focus())}
        >
          <div aria-hidden="true" className="absolute inset-0 radial-gradient"></div>
          <div className="flex justify-between items-center">
            {renameANote && renameANote.noteid === note.noteid ? (
              <form onSubmit={changeTitle}>
                <input
                  ref={renameRef}
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  placeholder={note.title}
                  className="focus:outline-none font-semibold text-xl bg-transparent"
                />
              </form>
            ) : (
              <h3 className="font-semibold text-xl">{note.title}</h3>
            )}
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
              ref={firstInput}
              value={pin.first}
              type="password"
              onChange={(e) => handlePinInput(e, "first")}
              className="w-10 h-10 p-3 bg-slate-700 text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
            <input
              ref={secondInput}
              value={pin.second}
              type="password"
              className="w-10 h-10 p-3 bg-slate-700 text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "second")}
            />
            <input
              ref={thirdInput}
              value={pin.third}
              type="password"
              className="w-10 h-10 p-3 bg-slate-700 text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "third")}
            />
            <input
              ref={fourthInput}
              value={pin.fourth}
              type="password"
              className="w-10 h-10 p-3 bg-slate-700 text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "fourth")}
            />
          </form>
        </>
      )}
    </div>
  );
};

export default Notes;
