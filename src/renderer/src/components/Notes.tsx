import { useContext, useState, useRef, useEffect, PointerEventHandler } from "react";
import {
  createNewNote,
  deleteANote,
  moveNoteToTrash,
  updateFavoriteOnNote,
  updateNote
} from "@renderer/utils/api";
import { useNavigate } from "react-router-dom";
import {
  FaArrowCircleRight,
  FaArrowRight,
  FaCopy,
  FaDesktop,
  FaEdit,
  FaFolder,
  FaLock,
  FaSave,
  FaTrash,
  FaWindowClose
} from "react-icons/fa";
import Masonry from "react-masonry-css";
import { TbEdit, TbNotes, TbTrash, TbX } from "react-icons/tb";
import { Note } from "@renderer/types/types";
import { v4 as uuidv4 } from "uuid";
import cheerio from "cheerio";
import { motion } from "framer-motion";
import UserContext from "@renderer/contexxt/UserContext";
import {
  BsFiletypeDocx,
  BsFiletypeHtml,
  BsFiletypePdf,
  BsFiletypeTxt,
  BsStar,
  BsStarFill
} from "react-icons/bs";
import { MdCancel, MdDeleteForever, MdRestore, MdUpdate } from "react-icons/md";
import { IoRemoveCircle } from "react-icons/io5";

const Notes = (): JSX.Element => {
  const {
    setNote,
    setAllData,
    setContextMenu,
    setPosition,
    setSystemNotif,
    setNoteToEdit,
    setMove,
    setTrashedNotes,
    setEditDraft,
    setDrafts,
    setNotes,
    setSearch,
    setFolder,
    setUserPreferences,
    view,
    allData,
    folder,
    search,
    noteDragging,
    setNoteIsMoving,
    setNoteDragFolder,
    noteIsMoving,
    drafts,
    mainTitle,
    notesToRender,
    token,
    userPreferences,
    user,
    setNoteDragging,
    setNoteDrag,
    noteDragFolder
  } = useContext(UserContext);

  const [pinInput, setPinInput] = useState(false);
  const [pin, setPin] = useState({ first: "", second: "", third: "", fourth: "" });
  const [awaitingNote, setAwaitingNote] = useState(null);
  const [renameANote, setRenameANote] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [unsavedChangesOptions, setUnsavedChangesOptions] = useState(null);

  const firstInput = useRef(null);
  const secondInput = useRef(null);
  const thirdInput = useRef(null);
  const fourthInput = useRef(null);
  const renameRef = useRef(null);

  const navigate = useNavigate();
  //  const hoverBgString = userPreferences?.theme
  //    ? userPreferences.theme.replace("300", "200")
  //    : "bg-amber-200";
  const textThemeString = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const masonryBreakPoints =
    view === "list"
      ? {
          default: 1,
          100: 1
        }
      : view === "grid"
        ? {
            default: 1,
            2500: 2,
            1500: 2,
            1024: 1,
            100: 1
          }
        : {
            default: 1,
            2500: 3,
            1500: 2,
            1024: 1,
            100: 1
          };

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

  const edit = (note: Note, draft: boolean): void => {
    if (draft) {
      setEditDraft(true);
    }
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

  const confirmDuplicate = (note: Note): void => {
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
        { text: "duplicate", func: (): void => duplicate(note) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const duplicate = (note: Note): void => {
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    const tempId = uuidv4();
    const noteToDuplicate = {
      title: note.title,
      htmlNotes: note.htmlText,
      folderId: note.folderId
    };
    setAllData((prevData) => {
      const newNotes = [...prevData.notes, { ...note, noteid: tempId }];
      return {
        ...prevData,
        notes: newNotes
      };
    });
    try {
      createNewNote(token, noteToDuplicate)
        .then((res) => {
          const returnedNoteId = res.data.data[0].notesid;
          setAllData((prevData) => {
            const newNotes = prevData.notes.map((aNote) => {
              if (aNote.noteid === tempId) {
                return { ...aNote, noteid: returnedNoteId };
              }
              return aNote;
            });
            return { ...prevData, notes: newNotes };
          });
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Duplicated Note",
              text: `You successfully duplicated your note: ${note.title}`,
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
                { text: "undo", func: (): void => {} }
              ]
            };
            setSystemNotif(newSuccess);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllData((prevData) => {
            const oldNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
            return { ...prevData, notes: oldNotes };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Duplicating Note",
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
                  { text: "re-try", func: () => duplicate(note) },
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
                  { text: "re-try", func: () => duplicate(note) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Duplicating Note",
        text: "Please contact the developer if this issue persists. We seemed to have a problem duplicating your note. Please close the application, reload it and try the operation again.",
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
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const rename = (note: Note): void => {
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
    const oldTitle = renameANote.title;
    const newNote = {
      notesId: renameANote.noteid,
      htmlNotes: renameANote.htmlText,
      locked: renameANote.locked,
      title: renameText,
      folderId: renameANote.folderId
    };
    try {
      setAllData((prevData) => {
        const newNotes = prevData.notes.map((aNote) => {
          if (aNote.noteid === renameANote.noteid) {
            return { ...aNote, title: renameText };
          }
          return aNote;
        });
        return { ...prevData, notes: newNotes };
      });
      setRenameANote(null);
      setRenameText("");
      navigate("/");
      updateNote(token, newNote)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: "Updated Note Title",
              text: "Successfully renamed your note",
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
          console.log(err);
          setAllData((prevData) => {
            const newNotes = prevData.notes.map((aNote) => {
              if (aNote.noteid === renameANote.noteid) {
                return { ...aNote, title: oldTitle };
              }
              return aNote;
            });
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
                  { text: "re-try", func: () => changeTitle(e) },
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
                  { text: "re-try", func: () => changeTitle(e) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Updating Title",
        text: "Please contact the developer if this issue persists. We seemed to have a problem updating your note. Please close the application, reload it and try the operation again.",
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
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const move = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setMove({
      isMoving: true,
      from: note.folderId,
      itemTitle: note.title,
      item: [note],
      type: "note"
    });
  };

  const confirmTrash = (note: Note): void => {
    const newConfirmation = {
      show: true,
      title: `Trash ${note.title}`,
      text: `Are you sure you want to move this note to your trash bin?`,
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
        { text: "trash", func: () => moveToTrash(note) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const moveToTrash = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    const trashed = note.trashed;
    const newNote = { ...note, trashed: !trashed };
    try {
      setAllData((prevData) => {
        const newNotes = prevData.notes.map((aNote) => {
          if (aNote.noteid === note.noteid) {
            return newNote;
          }
          return aNote;
        });
        return {
          ...prevData,
          notes: newNotes
        };
      });
      !trashed
        ? setTrashedNotes((prevTrash) => [...prevTrash, newNote])
        : setTrashedNotes((prevTrash) => prevTrash.filter((aNote) => aNote.noteid !== note.noteid));
      moveNoteToTrash(token, note.noteid, !trashed)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: `${note.title} ${trashed ? "Moved" : "Trashed"}`,
              text: `Successfully moved your note ${trashed ? "out of" : "into"} your trash`,
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
          console.log(err);
          setAllData((prevData) => {
            const newNotes = prevData.notes.map((aNote) => {
              if (aNote.noteid === note.noteid) {
                return { ...aNote, trashed: trashed };
              }
              return aNote;
            });
            return {
              ...prevData,
              notes: newNotes
            };
          });
          trashed
            ? setTrashedNotes((prevTrash) => [...prevTrash, newNote])
            : setTrashedNotes((prevTrash) =>
                prevTrash.filter((aNote) => aNote.noteid !== note.noteid)
              );
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: `Issues ${trashed ? "Moving" : "Trashing"} Note`,
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
                  { text: "re-try", func: () => moveToTrash(note) },
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
                  { text: "re-try", func: () => moveToTrash(note) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      setAllData((prevData) => {
        const newNotes = prevData.notes.map((aNote) => {
          if (aNote.noteid === note.noteid) {
            return { ...aNote, trashed: trashed };
          }
          return aNote;
        });
        return {
          ...prevData,
          notes: newNotes
        };
      });
      trashed
        ? setTrashedNotes((prevTrash) => [...prevTrash, newNote])
        : setTrashedNotes((prevTrash) => prevTrash.filter((aNote) => aNote.noteid !== note.noteid));
      const newError = {
        show: true,
        title: `Issues ${trashed ? "Moving" : "Trashing"} Note`,
        text: `Please contact the developer if this issue persists. We seemed to have a problem ${
          trashed ? "moving" : "trashing"
        } your note. Please close the application, reload it and try the operation again.`,
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
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const confirmDelete = (note: Note): void => {
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

  const deleteNote = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setSystemNotif({
      show: false,
      title: "",
      text: "",
      color: "",
      hasCancel: false,
      actions: []
    });
    try {
      setAllData((prevData) => {
        const newNotes = prevData.notes.filter((aNote: Note) => aNote.noteid !== note.noteid);
        return {
          ...prevData,
          notes: newNotes
        };
      });
      deleteANote(token, note.noteid)
        .then(() => {
          if (userPreferences.notify.notifyAll && userPreferences.notify.notifySuccess) {
            const newSuccess = {
              show: true,
              title: `${note.title} Deleted`,
              text: "Successfully deleted your note",
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
          console.log(err);
          setAllData((prevData) => {
            const newNotes = [...prevData.notes, note];
            return {
              ...prevData,
              notes: newNotes
            };
          });
          if (err.response) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              const newError = {
                show: true,
                title: "Issues Deleting Note",
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
                  { text: "re-try", func: () => deleteNote(note) },
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
                  { text: "re-try", func: () => deleteNote(note) },
                  { text: "reload app", func: () => window.location.reload() }
                ]
              };
              setSystemNotif(newError);
            }
          }
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Deleting Note",
        text: "Please contact the developer if this issue persists. We seemed to have a problem deleting your note. Please close the application, reload it and try the operation again.",
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
          }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const confirmDeleteDraft = (note: Note): void => {
    const newConfirmation = {
      show: true,
      title: `Delete Draft ${note.title}`,
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
        { text: "delete", func: () => deleteDraft(note) }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const deleteDraft = (note: Note): void => {
    setSystemNotif({ show: false, title: "", text: "", color: "", hasCancel: false, actions: [] });
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    const newDrafts = drafts.filter((draft) => draft.noteid !== note.noteid);
    setDrafts(newDrafts);
    setNotes(newDrafts);
  };

  const extractText = (html: string): string => {
    const $ = cheerio.load(html);

    // Get the text content of the document
    return $("body").text();
  };

  const saveFileToSystem = async (note: Note): Promise<void> => {
    const plainText = extractText(note.htmlText);
    await window.save.saveTxt(plainText);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    if (userPreferences.notify.notifySuccess) {
      const newSuccess = {
        show: true,
        title: `Saved ${note.title}`,
        text: "Your file was saved successfully as a plain text file",
        color: "bg-green-300",
        hasCancel: true,
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
      };
      setSystemNotif(newSuccess);
    }
  };

  const saveFileToSysAsHtml = async (note: Note): Promise<void> => {
    await window.save.saveHtml(note.htmlText, note.title);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    if (userPreferences.notify.notifySuccess) {
      const newSuccess = {
        show: true,
        title: `Saved ${note.title}`,
        text: "Your file was saved successfully as an HTML file",
        color: "bg-green-300",
        hasCancel: true,
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
      };
      setSystemNotif(newSuccess);
    }
  };

  const saveFileToSysAsPdf = async (note: Note): Promise<void> => {
    const plainText = extractText(note.htmlText);
    await window.save.saveAsPdf(plainText, note.title);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    if (userPreferences.notify.notifySuccess) {
      const newSuccess = {
        show: true,
        title: `Saved ${note.title}`,
        text: "Your file was saved successfully as a PDF file",
        color: "bg-green-300",
        hasCancel: true,
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
      };
      setSystemNotif(newSuccess);
    }
  };

  const saveFileToSysAsDocX = async (note: Note): Promise<void> => {
    const plainText = extractText(note.htmlText);
    await window.save.saveAsDocX(plainText, note.title), user.username;
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    if (userPreferences.notify.notifySuccess) {
      const newSuccess = {
        show: true,
        title: `Saved ${note.title}`,
        text: "Your file was saved successfully as a docx file",
        color: "bg-green-300",
        hasCancel: true,
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
      };
      setSystemNotif(newSuccess);
    }
  };

  const openWindow = async (note: Note): Promise<void> => {
    await window.openNewWin.openNoteInNewWindow(note, userPreferences.darkMode);
    setNote(null);
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
  };

  const lockNote = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    const newNote = {
      notesId: note.noteid,
      htmlNotes: note.htmlText,
      locked: !note.locked,
      title: note.title,
      folderId: note.folderId
    };
    updateNote(token, newNote);
    setAllData((prev) => {
      return {
        ...prev,
        notes: prev.notes.map((aNote) => {
          if (aNote.noteid === note.noteid) {
            return {
              ...note,
              locked: !note.locked
            };
          } else {
            return aNote;
          }
        })
      };
    });
  };

  const openNotesOptions = (event, note: Note): void => {
    event.preventDefault();
    event.stopPropagation();
    const { clientX, clientY } = event;
    let dynamicTop = clientY;
    let dynamicLeft = clientX;
    if (clientY + 325 > window.innerHeight) {
      dynamicTop -= 325;
    }
    if (clientX + 200 > window.innerWidth) {
      dynamicLeft -= 245;
    }
    setPosition({ top: dynamicTop, left: dynamicLeft });
    if (note.trashed) {
      const newMenu = {
        show: true,
        meta: {
          title: note.title,
          color: `${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`
        },
        options: [
          {
            title: "move out of trash",
            func: (): void => {
              moveToTrash(note);
            },
            icon: <MdRestore />
          },
          {
            title: "delete forever",
            func: (): void => {
              if (userPreferences.confirm) {
                confirmDelete(note);
              } else {
                deleteNote(note);
              }
            },
            icon: <MdDeleteForever />
          }
        ]
      };
      setContextMenu(newMenu);
      return;
    }
    if (mainTitle === "Drafts") {
      const newMenu = {
        show: true,
        meta: {
          title: note.title,
          color: `${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`
        },
        options: [
          {
            title: "edit",
            func: (): void => edit(note, true),
            icon: <FaEdit />
          },
          {
            title: "delete forever",
            func: () => (userPreferences.confirm ? confirmDeleteDraft(note) : deleteDraft(note)),
            icon: <MdDeleteForever />
          }
        ]
      };
      return setContextMenu(newMenu);
    }
    const newMenu = {
      show: true,
      meta: {
        title: note.title,
        color: `${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`
      },
      options: [
        {
          title: "edit",
          icon: <FaEdit />,
          func: () => edit(note, false)
        },
        {
          title: "open in new window",
          icon: <FaDesktop />,
          func: () => openWindow(note)
        },
        {
          title: "move",
          icon: <FaArrowCircleRight />,
          func: () => move(note)
        },
        {
          title: "duplicate",
          icon: <FaCopy />,
          func: () => (userPreferences.confirm ? confirmDuplicate(note) : duplicate(note))
        },
        {
          title: "rename",
          icon: <FaEdit />,
          func: () => rename(note)
        },
        !note.locked && {
          title: "lock",
          icon: <FaLock />,
          func: () => lockNote(note)
        },

        {
          title: "save file as .txt",
          icon: <BsFiletypeTxt />,
          func: () => saveFileToSystem(note)
        },
        {
          title: "save file as .html",
          icon: <BsFiletypeHtml />,
          func: (): Promise<void> => saveFileToSysAsHtml(note)
        },
        {
          title: "save file as .pdf",
          icon: <BsFiletypePdf />,
          func: (): Promise<void> => saveFileToSysAsPdf(note)
        },
        {
          title: "save file as .docx",
          icon: <BsFiletypeDocx />,
          func: (): Promise<void> => saveFileToSysAsDocX(note)
        },
        {
          title: "move to trash",
          icon: <FaTrash />,
          func: (): void => (userPreferences.confirm ? confirmTrash(note) : moveToTrash(note))
        },
        {
          title: "delete forever",
          icon: <FaWindowClose />,
          func: (): void => (userPreferences.confirm ? confirmDelete(note) : deleteNote(note))
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
    try {
      const stringifiedPin = JSON.stringify(pin);
      localStorage.setItem("pin", stringifiedPin);
      setPinInput(false);
      setPin({ first: "", second: "", third: "", fourth: "" });
      setNote(awaitingNote);
      setAwaitingNote(null);
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Unlocking Note",
        text: "Please contact the developer if this issue persists. We seemed to have a problem reading your pin. Please close the application, reload it and try the operation again.",
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
          }
        ]
      };
      setSystemNotif(newError);
    }
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

  const checkForUnsaved = (noteid: string): boolean => {
    const isUnsaved = userPreferences.unsavedNotes.filter((unsaved) => unsaved.id === noteid);
    if (isUnsaved.length > 0) {
      return true;
    }
    return false;
  };

  const removeUnsavedChanges = (note): void => {
    setUnsavedChangesOptions(null);
    let isUnsaved = false;
    const unsaved = userPreferences.unsavedNotes;
    for (let i = 0; i < unsaved.length; i++) {
      if (unsaved[i].id === note.noteid) {
        isUnsaved = true;
      }
    }
    if (isUnsaved) {
      const newUnsaved = userPreferences.unsavedNotes.filter(
        (unsaved: { id: string; htmlText: string }) => unsaved.id !== note.noteid
      );
      const newPrefs = {
        ...userPreferences,
        unsavedNotes: newUnsaved
      };
      setUserPreferences(newPrefs);
      localStorage.setItem("preferences", JSON.stringify(newPrefs));
    }
  };

  const moveNote = (): void => {
    // Move note
    setNoteDrag(false);
    setNoteDragFolder(null);
    setNoteIsMoving(false);
    setNoteDragging(null);
  };

  const handleDragEnd = (): void => {
    console.log("drag end");
    if (!noteDragFolder) {
      setNoteDragging(null);
      setNoteDrag(false);
      return;
    }
    if (noteDragFolder) {
      setNoteIsMoving(true);
    }
    const newPrompt = {
      show: true,
      title: "Move Note",
      text: `Move note ${noteDragging.title} to folder ${noteDragFolder.title}?`,
      color: "bg-green-300",
      hasCancel: true,
      actions: [
        {
          text: "cancel",
          func: (): void => {
            setNoteDrag(false);
            setNoteDragFolder(null);
            setNoteIsMoving(false);
            setNoteDragging(null);
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
        {
          text: "confirm",
          func: (): void => moveNote()
        }
      ]
    };
    setSystemNotif(newPrompt);
  };

  const saveNote = (note: Note): void => {
    // Close the options menu
    setUnsavedChangesOptions(null);

    // Send the updated note to the server
    const updatedText = userPreferences.unsavedNotes.find(
      (aNote) => aNote.id === note.noteid
    ).htmlText;
    const newNote = {
      ...note,
      notesId: note.noteid,
      htmlNotes: updatedText,
      updated: new Date()
    };
    updateNote(token, newNote);

    // Update state preferences && storage
    const newUnsaved = userPreferences.unsavedNotes.filter(
      (unsaved: { id: string; htmlText: string }) => unsaved.id !== note.noteid
    );
    const newPrefs = {
      ...userPreferences,
      unsavedNotes: newUnsaved
    };
    setUserPreferences(newPrefs);
    localStorage.setItem("preferences", JSON.stringify(newPrefs));

    // Display notification
    if (userPreferences.notify.notifySuccess || userPreferences.notify.notifyAll) {
      setSystemNotif({
        show: true,
        title: `${note.title}`,
        text: `${note.title} was saved successfully`,
        color: `${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`,
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
    }
  };

  const updateFavorite = (newFavorite: boolean, noteId: string): void => {
    updateFavoriteOnNote(token, noteId, newFavorite).then((res) => {});
  };

  return (
    <div className="w-full py-10">
      <Masonry
        breakpointCols={masonryBreakPoints}
        className="my-masonry-grid px-5"
        columnClassName="my-masonry-grid_column"
      >
        {notesToRender.map((note: Note) => (
          <motion.div
            whileHover={{ backgroundColor: userPreferences.darkMode ? "#444" : "#fff" }}
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            drag={true}
            dragSnapToOrigin={true}
            onDragStart={() => {
              setNoteDragging(note);
              setNoteDrag(true);
            }}
            onDragEnd={() => handleDragEnd()}
            animate={{
              scale: noteIsMoving && noteDragging.noteid === note.noteid ? 0 : 1,
              backgroundColor: userPreferences.darkMode ? "#333" : "#e2e8f0",
              minHeight: note.locked ? "125px" : "125px"
            }}
            whileDrag={{ pointerEvents: "none" }}
            onContextMenu={(e) => openNotesOptions(e, note)}
            key={note.noteid}
            className={`${search && folder === null ? "my-16" : "my-5"} ${view === "list" ? "h-80 overflow-y-clip" : view === "grid" ? "h-80 overflow-y-clip" : "h-auto"} p-4 rounded-md shadow-lg relative cursor-pointer mx-3 my-5 pointer-events-auto`}
            onClick={() => (!renameANote ? openNote(note) : renameRef.current.focus())}
          >
            <button
              onClick={() => updateFavorite(!note.favorite)}
              className={`absolute top-1 right-1 text-lg ${userPreferences.theme ? textThemeString || "text-amber-300" : "text-amber-300"}`}
            >
              {note.favorite ? <BsStarFill /> : <BsStar />}
            </button>
            {search && folder === null ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch(false);
                  setFolder(allData.folders.find((fold) => fold.folderid === note.folderId));
                }}
                className={`absolute top-[-35px] left-0 right-0 z-20 duration-200 ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444] text-white" : "bg-slate-200 hover:bg-slate-300 text-black"} p-2 rounded-t-md`}
              >
                <p className="flex justify-center items-center gap-x-3 text-xs">
                  In <FaFolder />
                  <FaArrowRight />
                  {allData.folders.find((fold) => fold.folderid === note.folderId).title}
                </p>
              </button>
            ) : null}
            {checkForUnsaved(note.noteid) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUnsavedChangesOptions(note);
                }}
                className="text-black hover:translate-x-5 duration-200 absolute bottom-8 rounded-tl-md shadow-md right-0 text-xs bg-gradient-to-tr from-orange-300 to-red-400 py-1 px-3"
              >
                <p>Unsaved Changes</p>
              </button>
            ) : null}
            {unsavedChangesOptions !== null && unsavedChangesOptions.noteid === note.noteid ? (
              <>
                <div
                  className="bg-transparent fixed z-40 inset-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnsavedChangesOptions(false);
                  }}
                ></div>
                <div
                  className={`duration-200 flex flex-col justify-center items-center absolute bottom-8 rounded-md shadow-md right-[-100px] text-xs bg-gradient-to-tr ${userPreferences.darkMode ? "bg-[#222] text-white" : "bg-slate-100 text-black"} z-40`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveNote(note);
                    }}
                    className={`rounded-t-sm w-full min-w-[100px] ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444]" : "bg-slate-100 hover:bg-slate-200"} duration-200 bg-[#333] px-3 py-1 flex justify-between items-center`}
                  >
                    save
                    <FaSave />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUnsavedChanges(note);
                    }}
                    className={`w-full ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444]" : "bg-slate-100 hover:bg-slate-200"} duration-200 bg-[#333] px-3 py-1 flex justify-between items-center`}
                  >
                    discard
                    <IoRemoveCircle />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUnsavedChangesOptions(null);
                    }}
                    className={`rounded-b-sm w-full ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444]" : "bg-slate-100 hover:bg-slate-200"} duration-200 bg-[#333] px-3 py-1 flex justify-between items-center`}
                  >
                    cancel
                    <MdCancel />
                  </button>
                </div>
              </>
            ) : null}
            <div
              aria-hidden="true"
              className="absolute inset-0 radial-gradient pointer-events-none"
            ></div>
            <div
              className={`absolute right-0 bottom-0 shadow-md pt-2 pb-1 px-3 font-semibold text-sm z-10 ${
                userPreferences.darkMode ? "bg-[#222] text-white" : "bg-white text-black"
              } rounded-tl-md`}
            >
              <p className="flex justify-center items-center gap-x-1">
                <MdUpdate className="text-lg" />
                <span>
                  {new Date(note.updated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </p>
            </div>
            <div className="flex justify-between items-start gap-x-3 pb-1 mb-1">
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
                <h3 className="font-semibold text-2xl">{note.title}</h3>
              )}
              <div className="flex mt-2 justify-between items-center gap-x-3 text-lg">
                <button
                  onClick={(e): void => {
                    e.stopPropagation();
                    if (renameANote) {
                      setRenameANote(null);
                      setRenameText("");
                      return;
                    }
                    rename(note);
                  }}
                  className={`${textThemeString}`}
                >
                  {renameANote && renameANote.noteid ? <TbX /> : <TbEdit />}
                </button>
                <button
                  onClick={(e): void => {
                    e.stopPropagation();
                    confirmTrash(note);
                  }}
                >
                  <TbTrash className="text-red-500" />
                </button>
                <TbNotes className={`${textThemeString}`} />
              </div>
            </div>
            {note.locked ? (
              <div className="absolute bottom-3 left-3 shadow-md">
                <FaLock className="text-red-300" />
              </div>
            ) : (
              <div
                className="mt-3 renderHtml"
                dangerouslySetInnerHTML={{
                  __html:
                    note.htmlText.slice(
                      0,
                      note.htmlText.length / 5 < 500
                        ? note.htmlText.length / 5 < 100
                          ? 100
                          : 500
                        : 500
                    ) + " ..."
                }}
              ></div>
            )}
          </motion.div>
        ))}
      </Masonry>
      {pinInput && (
        <>
          <div
            onClick={() => {
              setPin({ first: "", second: "", third: "", fourth: "" });
              setPinInput(false);
            }}
            className="fixed bg-transparent inset-0 shadow-md"
          ></div>
          <form
            className={`p-5 fixed bottom-5 left-5 rounded-md shadow-md ${
              userPreferences.darkMode ? "bg-[#333] text-white" : "bg-slate-200 text-black"
            } flex justify-center items-center gap-x-5`}
          >
            <input
              ref={firstInput}
              value={pin.first}
              type="password"
              onChange={(e) => handlePinInput(e, "first")}
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline-none focus:outline-none duration-200 focus:shadow-md`}
            />
            <input
              ref={secondInput}
              value={pin.second}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline-none focus:outline-none duration-200 focus:shadow-md`}
              onChange={(e) => handlePinInput(e, "second")}
            />
            <input
              ref={thirdInput}
              value={pin.third}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline-none focus:outline-none duration-200 focus:shadow-md`}
              onChange={(e) => handlePinInput(e, "third")}
            />
            <input
              ref={fourthInput}
              value={pin.fourth}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline-none focus:outline-none duration-200 focus:shadow-md`}
              onChange={(e) => handlePinInput(e, "fourth")}
            />
          </form>
        </>
      )}
    </div>
  );
};

export default Notes;
