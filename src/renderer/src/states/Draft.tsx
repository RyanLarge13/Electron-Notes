import "react-quill/dist/quill.snow.css";
import "../assets/quill.css";

import { motion, useDragControls } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { FaLock, FaSave, FaUnlock } from "react-icons/fa";
import { MdDragHandle } from "react-icons/md";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";

import UserContext from "@renderer/contexxt/UserContext";
import { Note } from "@renderer/types/types";
import { createNewNote, updateNote } from "@renderer/utils/api";

const Draft = ({ noteToEdit }: { noteToEdit: Note }): JSX.Element => {
  const {
    token,
    folder,
    userPreferences,
    editDraft,
    networkNotificationError,
    resetSystemNotification,
    showErrorNotification,
    showSuccessNotification,
    setUserPreferences,
    setNote,
    setDrafts,
    setAllData,
    setNoteToEdit
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
      showErrorNotification(
        "Settings Update Failed",
        "If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [{ text: "reload app", func: () => window.location.reload() }]
      );
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
        showSuccessNotification("Auto Save", "Note saved", false, [
          {
            text: "turn off",
            func: (): void => turnoffAutoSave()
          }
        ]);
        setSaving(false);
      })
      .catch((err) => {
        if (err.response) {
          showErrorNotification("Updating Note", err.response.message, true, [
            { text: "reload app", func: () => window.location.reload() }
          ]);
        }
        if (err.request) {
          networkNotificationError([{ text: "reload app", func: () => window.location.reload() }]);
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
        showSuccessNotification("New Note", "Your note has been created", false, [
          { text: "undo", func: (): void => {} }
        ]);
        setSaving(false);
      })
      .catch((err) => {
        console.log(err);
        setAllData((prevData) => {
          const newNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
          return { ...prevData, notes: newNotes };
        });
        if (err.response) {
          showErrorNotification("Updating Note", err.response.message, true, [
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
        if (err.request) {
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
    updateNote(token, updatedNote)
      .then(() => {
        showSuccessNotification("Saved", "Your note was saved successfully", false, [
          { text: "undo", func: (): void => {} }
        ]);
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
          showErrorNotification("Updating Folder", err.response.message, true, [
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
    showSuccessNotification(
      "Saved In Drafts",
      "Your note was saved as a draft and will be lost if not saved before exiting the application",
      false,
      [
        {
          text: "undo",
          func: (): void => {
            setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.noteid !== tempId));
            resetSystemNotification();
          }
        }
      ]
    );
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
