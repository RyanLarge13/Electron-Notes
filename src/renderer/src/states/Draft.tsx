import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaSave, FaUnlock } from "react-icons/fa";
import { motion, useDragControls } from "framer-motion";
import { createNewNote, updateNote } from "@renderer/utils/api";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill";
import UserContext from "@renderer/contexxt/UserContext";
import "react-quill/dist/quill.snow.css";
import "../assets/quill.css";
import { Note } from "@renderer/types/types";
import { MdDragHandle } from "react-icons/md";

const Draft = ({ noteToEdit }: { noteToEdit: Note }): JSX.Element => {
  const {
    token,
    folder,
    userPreferences,
    editDraft,
    networkNotificationError,
    resetSystemNotification,
    setUserPreferences,
    setNote,
    setDrafts,
    setAllData,
    setNoteToEdit,
    setSystemNotif
  } = useContext(UserContext);

  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : "");
  const [value, setValue] = useState(noteToEdit ? noteToEdit.htmlText : "");
  const [rendered, setRendered] = useState(false);
  const [changed, setChanged] = useState(false);
  const [locked, setLocked] = useState(noteToEdit ? noteToEdit.locked : false);
  const [saving, setSaving] = useState(false);
  const [favorite] = useState(noteToEdit?.favorite || false);
  const [dems] = useState(
    userPreferences?.noteDems?.find((dem) => dem.id === noteToEdit?.noteid) || undefined
  );
  const [position] = useState(
    noteToEdit
      ? {
          top: dems?.top || 50,
          left: dems?.left || 50,
          right: dems?.width || 45,
          bottom: dems?.height || 10
        }
      : { top: 50, left: 50, bottom: 10, right: 45 }
  );
  const [resizing] = useState(false);

  let autoSaveInterval;

  const navigate = useNavigate();
  const noteDragControl = useDragControls();

  // const textThemeString = userPreferences?.theme
  //   ? userPreferences.theme.replace("bg", "text")
  //   : "text-amber-300";

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }], // Color and Background buttons
      ["link", "image", "video"],
      ["clean"]
    ]
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "clean"
  ];

  useEffect(() => {
    if (!noteToEdit.isNew) {
      const contains = userPreferences.unsavedNotes.filter(
        (unsaved) => unsaved.id === noteToEdit.noteid
      );
      if (contains.length > 0) {
        setValue(contains[0].htmlText);
        console.log("contains unsaved changes");
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setRendered(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (userPreferences.autosave === true && !noteToEdit.isNew && !editDraft) {
      autoSaveInterval = setInterval(() => autoSaveNote(), 10000);
    }
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, []);

  const turnoffAutoSave = (): void => {
    const newPrefs = {
      ...userPreferences,
      autosave: false
    };
    try {
      localStorage.setItem("preferences", JSON.stringify(newPrefs));
      setUserPreferences(newPrefs);
      clearInterval(autoSaveInterval);
    } catch (err) {
      console.log(err);
      clearInterval(autoSaveInterval);
      const newError = {
        show: true,
        title: "Auto Save Change Failed",
        text: "There was an error with the application when trying to update your settings, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: () => resetSystemNotification()
          },
          { text: "reload app", func: () => window.location.reload() }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const autoSaveNote = (): void => {
    setChanged(false);
    setSaving(true);
    const updatedNote = {
      notesId: noteToEdit.noteid,
      title: title,
      htmlNotes: value,
      locked: locked,
      folderId: noteToEdit.folderId,
      updated: new Date()
    };
    updateNote(token, updatedNote)
      .then(() => {
        removeUnsavedChanges();
        if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
          const newSuccess = {
            show: true,
            title: "Auto Save",
            text: "note saved",
            color: "bg-green-300",
            hasCancel: false,
            actions: [
              {
                text: "close",
                func: () => resetSystemNotification()
              },
              {
                text: "turn off",
                func: (): void => {
                  turnoffAutoSave();
                }
              }
            ]
          };
          setSystemNotif(newSuccess);
        }
        setSaving(false);
      })
      .catch((err) => {
        if (err.response) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            const newError = {
              show: true,
              title: "Issues Updating Note",
              text: err.response.message,
              color: "bg-red-300",
              hasCancel: true,
              actions: [
                {
                  text: "close",
                  func: () => resetSystemNotification()
                },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
        if (err.request) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            networkNotificationError([
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
        }
        setSaving(false);
      });
  };

  const removeUnsavedChanges = (): void => {
    let isUnsaved = false;
    const unsaved = userPreferences.unsavedNotes;
    for (let i = 0; i < unsaved.length; i++) {
      if (unsaved[i].id === noteToEdit.noteid) {
        isUnsaved = true;
      }
    }
    if (isUnsaved) {
      const newUnsaved = userPreferences.unsavedNotes.filter(
        (unsaved: { id: string; htmlText: string }) => unsaved.id !== noteToEdit.noteid
      );
      const newPrefs = {
        ...userPreferences,
        unsavedNotes: newUnsaved
      };
      setUserPreferences(newPrefs);
      localStorage.setItem("preferences", JSON.stringify(newPrefs));
    }
  };

  const saveNote = (): void => {
    setSaving(true);
    if (!noteToEdit.isNew && !editDraft) {
      removeUnsavedChanges();
    }
    if (!token) {
      setSaving(false);
      return;
    }
    const tempId = uuidv4();
    const newNote = {
      title: title,
      htmlNotes: value,
      folderId: folder ? folder.folderid : null,
      locked: locked
    };
    const newStaticNote = {
      noteid: tempId,
      createdAt: new Date(),
      title: title,
      htmlText: value,
      folderId: folder ? folder.folderid : null,
      locked: locked,
      trashed: false,
      updated: new Date(),
      favorite: favorite
    };
    if (!noteToEdit.isNew && !editDraft) {
      return updateEditNote();
    }
    setAllData((prevData) => {
      const newData = {
        ...prevData,
        notes: [...prevData.notes, newStaticNote]
      };
      return newData;
    });
    setDrafts((prevDrafts) => prevDrafts.filter((aNote) => aNote.noteid !== noteToEdit.noteid));
    noteToEdit.isNew = false;
    createNewNote(token, newNote)
      .then((res) => {
        const returnedNote = res.data.data[0];
        const newId = returnedNote.notesid;
        setAllData((prevData) => {
          const newNotes = prevData.notes.map((note) => {
            if (note.noteid === tempId) {
              return { ...note, noteid: newId };
            }
            return note;
          });
          const newData = {
            ...prevData,
            notes: newNotes
          };
          return newData;
        });
        if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
          const newSuccess = {
            show: true,
            title: "New Note",
            text: "Your new note has been created!",
            color: "bg-green-300",
            hasCancel: false,
            actions: [
              {
                text: "close",
                func: () => resetSystemNotification()
              },
              { text: "undo", func: (): void => {} }
            ]
          };
          setSystemNotif(newSuccess);
        }
        setSaving(false);
      })
      .catch((err) => {
        console.log(err);
        setAllData((prevData) => {
          const newNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
          return { ...prevData, notes: newNotes };
        });
        if (err.response) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            const newError = {
              show: true,
              title: "Issues Updating Note",
              text: err.response.message,
              color: "bg-red-300",
              hasCancel: true,
              actions: [
                {
                  text: "close",
                  func: () => resetSystemNotification()
                },
                {
                  text: "open note",
                  func: (): void => {
                    navigate("/newnote");
                    resetSystemNotification();
                  }
                },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
        if (err.request) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            networkNotificationError([
              {
                text: "open note",
                func: (): void => {
                  navigate("/newnote");
                  resetSystemNotification();
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
        }
        setSaving(false);
      });
  };

  const updateEditNote = (): void => {
    const prevHtml = noteToEdit.htmlText;
    const updatedNote = {
      notesId: noteToEdit.noteid,
      title: title,
      htmlNotes: value,
      locked: locked,
      folderId: noteToEdit.folderId,
      updated: new Date()
    };
    setAllData((prevData) => {
      const newNotes = prevData.notes.map((aNote) => {
        if (aNote.noteid === noteToEdit.noteid) {
          return { ...aNote, htmlText: value };
        }
        return aNote;
      });
      return { ...prevData, notes: newNotes };
    });
    // setNoteToEdit(null);
    // setNote({ ...noteToEdit, htmlText: value });
    // navigate("/");
    updateNote(token, updatedNote)
      .then(() => {
        if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
          const newSuccess = {
            show: true,
            title: "Saved",
            text: "Your note is saved",
            color: "bg-green-300",
            hasCancel: false,
            actions: [
              {
                text: "close",
                func: () => resetSystemNotification()
              },
              { text: "undo", func: (): void => {} }
            ]
          };
          setSystemNotif(newSuccess);
        }
        setSaving(false);
      })
      .catch((err) => {
        setAllData((prevData) => {
          const newNotes = prevData.notes.map((aNote) => {
            if (aNote.noteid === noteToEdit.noteid) {
              return { ...aNote, htmlText: prevHtml };
            }
            return aNote;
          });
          return { ...prevData, notes: newNotes };
        });
        if (err.response) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            const newError = {
              show: true,
              title: "Issues Updating Folder",
              text: err.response.message,
              color: "bg-red-300",
              hasCancel: true,
              actions: [
                {
                  text: "close",
                  func: () => resetSystemNotification()
                },
                {
                  text: "open note",
                  func: (): void => {
                    resetSystemNotification();
                    navigate("/newnote");
                  }
                },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
        if (err.request) {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
            networkNotificationError([
              {
                text: "open note",
                func: (): void => {
                  resetSystemNotification();
                  navigate("/newnote");
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
        }
        setSaving(false);
      });
  };

  const saveNoteAsDraft = (): void => {
    const tempId = uuidv4();
    const newDraft = {
      noteid: tempId,
      title: title,
      htmlText: value,
      locked: locked,
      folderId: folder ? folder.folderid : null,
      createdAt: new Date(),
      trashed: false,
      updated: new Date(),
      favorite: favorite
    };
    setDrafts((prev) => [...prev, newDraft]);
    const newDraftNotif = {
      show: true,
      title: "Saved In Drafts",
      text: "Your note was saved as a draft. This note will be lost when you exit the application, if you would like to save it, go into the menu, edit and save",
      color: "bg-green-300",
      hasCancel: false,
      actions: [
        {
          text: "close",
          func: (): void => resetSystemNotification()
        },
        {
          text: "undo",
          func: (): void => {
            setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.noteid !== tempId));
            resetSystemNotification();
          }
        }
      ]
    };
    setSystemNotif(newDraftNotif);
  };

  return (
    <>
      <div
        className={`fixed z-20 inset-0 bg-transparent shadow-md`}
        onClick={() => {
          setNoteToEdit((prev) => prev.filter((prev) => prev.noteid !== noteToEdit.noteid));
          if (changed) {
            noteToEdit.htmlText = value;
            const newPreferences = {
              ...userPreferences,
              unsavedNotes: [
                ...userPreferences.unsavedNotes,
                { id: noteToEdit.noteid, htmlText: value }
              ]
            };
            setUserPreferences(newPreferences);
            localStorage.setItem("preferences", JSON.stringify(newPreferences));
          }
          setNote((prev) => [...prev, noteToEdit]);
          if (noteToEdit.isNew && title) {
            saveNoteAsDraft();
          }
        }}
      ></div>
      <motion.div
        drag={!resizing}
        dragSnapToOrigin={false}
        dragListener={false}
        dragControls={noteDragControl}
        // dragConstraints={{ top: 0, left: 0 }}
        initial={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          bottom: `${position.bottom}%`,
          right: `${position.right}%`
        }}
        animate={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          bottom: `${position.bottom}%`,
          right: `${position.right}%`
        }}
        className={`fixed min-w-80 min-h-80 max-w-[95%] max-h-[90%] overflow-hidden rounded-md shadow-xl ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-white"
        } z-40`}
        whileDrag={{
          boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`
        }}
      >
        <div className="flex justify-between items-center pr-5">
          <input
            type="text"
            placeholder="Title"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`p-3 text-xl ${
              userPreferences.darkMode ? "bg-[#222]" : "bg-white"
            } focus:outline-none rounded-md`}
          />
          <div className="flex gap-x-2">
            <button
              className="text-xs text-black p-[3px] rounded-full bg-sky-300 cursor-move"
              onPointerDown={(e) => noteDragControl.start(e)}
              style={{ touchAction: "none" }}
            >
              <MdDragHandle />
            </button>
            <button
              className="text-xs text-black p-[3px] rounded-full bg-orange-300"
              onClick={() => setLocked((prev) => !prev)}
            >
              {locked ? <FaLock /> : <FaUnlock />}
            </button>
            <button
              onClick={() => saveNote()}
              className={`text-xs text-black p-[3px] rounded-full bg-green-300 ${saving ? "cursor-progress" : "cursor-pointer"}`}
            >
              {saving ? <ClipLoader size={8} color="#000" /> : <FaSave />}
            </button>
          </div>
        </div>
        <div className={`h-full ${userPreferences.darkMode ? "bg-[#222]" : "bg-white"}`}>
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={value}
            onChange={(e) => {
              if (!changed && !noteToEdit.isNew && rendered) {
                setChanged(true);
              }
              setValue(e);
            }}
            style={{
              height: "80%"
            }}
          />
        </div>
      </motion.div>
    </>
  );
};

export default Draft;
