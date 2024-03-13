import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaSave, FaUnlock } from "react-icons/fa";
import { createNewNote, updateNote } from "@renderer/utils/api";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill";
import UserContext from "@renderer/contexxt/UserContext";
import "react-quill/dist/quill.snow.css";

const Draft = (): JSX.Element => {
  const {
    token,
    folder,
    userPreferences,
    noteToEdit,
    editDraft,
    setDrafts,
    setAllData,
    setNoteToEdit,
    setSystemNotif
  } = useContext(UserContext);

  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : "");
  const [value, setValue] = useState(noteToEdit ? noteToEdit.htmlText : "");
  const [locked, setLocked] = useState(noteToEdit ? noteToEdit.locked : false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const textThemeString = userPreferences?.theme?.replace("bg", "text");

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

  const saveNote = (): void => {
    setLoading(true);
    if (!token) {
      setLoading(false);
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
      updated: new Date()
    };
    if (noteToEdit && !editDraft) {
      return updateEditNote();
    }
    setAllData((prevData) => {
      const newData = {
        ...prevData,
        notes: [...prevData.notes, newStaticNote]
      };
      return newData;
    });
    setLoading(false);
    setNoteToEdit(null);
    setDrafts((prevDrafts) => prevDrafts.filter((aNote) => aNote.noteid !== noteToEdit.noteid));
    navigate("/");
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
              { text: "undo", func: (): void => {} }
            ]
          };
          setSystemNotif(newSuccess);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setAllData((prevData) => {
          const newNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
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
                {
                  text: "open note",
                  func: (): void => {
                    navigate("/newnote");
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    });
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
            const newError = {
              show: true,
              title: "Network Error",
              text: "Our application was not able to reach the server, please check your internet connection and try again",
              color: "bg-red-300",
              hasCancel: true,
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
                },
                {
                  text: "open note",
                  func: (): void => {
                    navigate("/newnote");
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    });
                  }
                },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
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
    navigate("/");
    setNoteToEdit(null);
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
              { text: "undo", func: (): void => {} }
            ]
          };
          setSystemNotif(newSuccess);
        }
        setLoading(false);
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
        setLoading(false);
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
                {
                  text: "open note",
                  func: (): void => {
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    });
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
            const newError = {
              show: true,
              title: "Network Error",
              text: "Our application was not able to reach the server, please check your internet connection and try again",
              color: "bg-red-300",
              hasCancel: true,
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
                },
                {
                  text: "open note",
                  func: (): void => {
                    setSystemNotif({
                      show: false,
                      title: "",
                      text: "",
                      color: "",
                      hasCancel: false,
                      actions: []
                    });
                    navigate("/newnote");
                  }
                },
                { text: "reload app", func: () => window.location.reload() }
              ]
            };
            setSystemNotif(newError);
          }
        }
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
      updated: new Date()
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
          func: (): void =>
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            })
        },
        {
          text: "undo",
          func: (): void => {
            setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.noteid !== tempId));
            setSystemNotif({
              show: false,
              title: "",
              text: "",
              color: "",
              hasCancel: false,
              actions: []
            });
          }
        }
      ]
    };
    setSystemNotif(newDraftNotif);
  };

  return (
    <>
      <div
        className={`fixed z-10 inset-0 ${
          userPreferences.darkMode ? "bg-black" : "bg-white"
        } bg-opacity-10 backdrop-blur-sm`}
        onClick={() => {
          noteToEdit && setNoteToEdit(null);
          if (!noteToEdit && title) {
            saveNoteAsDraft();
          }
          navigate("/");
        }}
      ></div>
      <div
        className={`fixed inset-10 rounded-md shadow-md ${
          userPreferences.darkMode ? "bg-black" : "bg-white"
        } z-40`}
      >
        <div className="flex justify-between items-center pr-5">
          <input
            type="text"
            placeholder="Title"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`p-3 text-xl ${
              userPreferences.darkMode ? "bg-black" : "bg-white"
            } focus:outline-none`}
          />
          <div className="flex gap-x-3">
            <button onClick={() => setLocked((prev) => !prev)}>
              {locked ? (
                <FaLock
                  className={`${userPreferences.theme ? textThemeString : "text-amber-300"}`}
                />
              ) : (
                <FaUnlock />
              )}
            </button>
            <button
              onClick={() => saveNote()}
              className={`${userPreferences.darkMode ? "text-slate-200" : "text-black"}`}
            >
              {loading ? (
                <ClipLoader size={16} color={`${userPreferences.darkMode ? "#fff" : "#000"}`} />
              ) : (
                <FaSave />
              )}
            </button>
          </div>
        </div>
        <div className="h-full">
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={value}
            onChange={setValue}
            style={{
              height: "80%"
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Draft;
