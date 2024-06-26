import { useContext, useState, useRef, useEffect } from "react";
import { createNewNote, deleteANote, moveNoteToTrash, updateNote } from "@renderer/utils/api";
import { useNavigate } from "react-router-dom";
import {
  FaArrowCircleRight,
  FaCopy,
  FaEdit,
  FaLock,
  FaSave,
  FaTrash,
  FaWindowClose
} from "react-icons/fa";
import { TbEdit, TbNotes, TbTrash, TbX } from "react-icons/tb";
import { Note } from "@renderer/types/types";
import { v4 as uuidv4 } from "uuid";
import cheerio from "cheerio";
import UserContext from "@renderer/contexxt/UserContext";
import { BsFiletypeDocx, BsFiletypeHtml, BsFiletypePdf, BsFiletypeTxt } from "react-icons/bs";

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
    contextMenu,
    drafts,
    mainTitle,
    notesToRender,
    token,
    view,
    userPreferences,
    user
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
  //  const hoverBgString = userPreferences?.theme
  //    ? userPreferences.theme.replace("300", "200")
  //    : "bg-amber-200";
  const textThemeString = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

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
            func: () => moveToTrash(note)
          },
          {
            title: "delete forever",
            func: () => (userPreferences.confirm ? confirmDelete(note) : deleteNote(note))
          }
        ]
      };
      return setContextMenu(newMenu);
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
            func: (): void => edit(note, true)
          },
          {
            title: "delete forever",
            func: () => (userPreferences.confirm ? confirmDeleteDraft(note) : deleteDraft(note))
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
          func: () => (userPreferences.confirm ? confirmTrash(note) : moveToTrash(note))
        },
        {
          title: "delete forever",
          icon: <FaWindowClose />,
          func: () => (userPreferences.confirm ? confirmDelete(note) : deleteNote(note))
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

  return (
    <div className="relative flex flex-wrap justify-start items-start gap-5 w-full my-10">
      {notesToRender.map((note) => (
        <div
          onContextMenu={(e) => openNotesOptions(e, note)}
          key={note.noteid}
          className={`${view === "list" ? "w-full" : "w-[45%]"} max-w-[45%] h-80 ${
            userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
          } p-3 rounded-md shadow-lg overflow-hidden relative cursor-pointer`}
          onClick={() => (!renameANote ? openNote(note) : renameRef.current.focus())}
        >
          {checkForUnsaved(note.noteid) ? (
            <div className="absolute bottom-8 rounded-tl-md shadow-md right-0 text-xs bg-red-300 py-1 px-3">
              <p>Unsaved Changes</p>
            </div>
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0 radial-gradient pointer-events-none"
          ></div>
          <div
            className={`absolute right-0 bottom-0 shadow-md pt-2 pb-1 px-3 font-semibold text-sm z-10 ${
              userPreferences.darkMode ? "bg-slate-400 text-black" : "bg-slate-700 text-white"
            } rounded-tl-md`}
          >
            <p className="text-slate-200">
              Last Updated On{" "}
              <span className="text-white">
                {new Date(note.updated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </p>
          </div>
          <div className="flex justify-between items-center border-b border-b-slate-700 pb-1 mb-1">
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
            <div className="flex justify-between items-center gap-x-3">
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
          <form
            className={`p-5 fixed bottom-5 left-5 rounded-md shadow-md ${
              userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
            } flex justify-center items-center gap-x-5`}
          >
            <input
              ref={firstInput}
              value={pin.first}
              type="password"
              onChange={(e) => handlePinInput(e, "first")}
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-300 text-slate-700"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
            />
            <input
              ref={secondInput}
              value={pin.second}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-300 text-slate-700"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
              onChange={(e) => handlePinInput(e, "second")}
            />
            <input
              ref={thirdInput}
              value={pin.third}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-300 text-slate-700"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
              onChange={(e) => handlePinInput(e, "third")}
            />
            <input
              ref={fourthInput}
              value={pin.fourth}
              type="password"
              className={`w-10 h-10 p-3 ${
                userPreferences.darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-300 text-slate-700"
              } text-2xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
              onChange={(e) => handlePinInput(e, "fourth")}
            />
          </form>
        </>
      )}
    </div>
  );
};

export default Notes;
