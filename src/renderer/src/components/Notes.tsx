import cheerio from "cheerio";
import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { BiShare, BiShareAlt } from "react-icons/bi";
import {
  BsFiletypeDocx,
  BsFiletypeHtml,
  BsFiletypePdf,
  BsFiletypeTxt,
  BsStar,
  BsStarFill
} from "react-icons/bs";
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
  FaUser,
  FaWindowClose
} from "react-icons/fa";
import { IoRemoveCircle } from "react-icons/io5";
import { MdCancel, MdDeleteForever, MdRestore, MdUpdate } from "react-icons/md";
import { TbEdit, TbNotes, TbPinned, TbTrash, TbX } from "react-icons/tb";
import Masonry from "react-masonry-css";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import UserContext from "@renderer/contexxt/UserContext";
import { AllData, Connection, Note, NoteShare, ShareReq } from "@renderer/types/types";
import {
  createNewNote,
  deleteANote,
  moveNoteToTrash,
  updateFavoriteOnNote,
  updateNote
} from "@renderer/utils/api";

const Notes = (): JSX.Element => {
  const {
    view,
    allData,
    folder,
    search,
    note,
    noteDragging,
    noteIsMoving,
    drafts,
    mainTitle,
    notesToRender,
    token,
    userPreferences,
    user,
    noteDragFolder,
    pinFavs,
    pinnedFavorites,
    shareRequests,
    sharedNotes,
    connections,
    setNoteShare,
    setNote,
    setNoteIsMoving,
    setNoteDragFolder,
    setNoteDragging,
    setNoteDrag,
    setMinimizeArray,
    setAllData,
    setContextMenu,
    setPosition,
    setNoteToEdit,
    setMove,
    setTrashedNotes,
    setEditDraft,
    setDrafts,
    setNotes,
    setSearch,
    setFolder,
    setUserPreferences,
    resetSystemNotification,
    networkNotificationError,
    showSuccessNotification,
    showErrorNotification,
    confirmOperationNotification
  } = useContext(UserContext);

  const [pinInput, setPinInput] = useState(false);
  const [pin, setPin] = useState({ first: "", second: "", third: "", fourth: "" });
  const [awaitingNote, setAwaitingNote] = useState(null);
  const [renameANote, setRenameANote] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [unsavedChangesOptions, setUnsavedChangesOptions] = useState(null);
  const [lockedOpenNewWinNote, setLockedOpenNewWinNote] = useState(false);

  const firstInput = useRef(null);
  const secondInput = useRef(null);
  const thirdInput = useRef(null);
  const fourthInput = useRef(null);
  const renameRef = useRef(null);

  const navigate = useNavigate();

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
    if (lockedOpenNewWinNote) {
      setPinInput(true);
    }
  }, [lockedOpenNewWinNote]);

  useEffect(() => {
    if (pin.fourth !== "") {
      const validPin = checkPin();
      if (validPin) {
        unlockNote();
        return;
      }
      showErrorNotification(
        "Invalid Pin",
        "Enter your valid pin to view your licked note",
        false,
        []
      );
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
    setNoteToEdit((prev) => [...prev, note]);
    navigate("/newnote");
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
  };

  const duplicate = (note: Note): void => {
    resetSystemNotification();
    const tempId = uuidv4();
    const noteToDuplicate = {
      title: note.title,
      htmlNotes: note.htmlText,
      folderId: note.folderId
    };

    const continueRequest = async (): Promise<void> => {
      // Immediately update state
      setAllData((prevData) => {
        const newNotes = [...prevData.notes, { ...note, noteid: tempId }];
        return {
          ...prevData,
          notes: newNotes
        };
      });

      try {
        const response = await createNewNote(token, noteToDuplicate);
        const noteIdFromServer = response.data.data[0].notesid;

        // Update id's to correct server ids for future updating
        setAllData((prevData) => {
          const newNotes = prevData.notes.map((aNote) => {
            if (aNote.noteid === tempId) {
              return { ...aNote, noteid: noteIdFromServer };
            }
            return aNote;
          });
          return { ...prevData, notes: newNotes };
        });
        showSuccessNotification(
          "Duplicated Note",
          `You successfully duplicated your note: ${note.title}`,
          false,
          []
        );
      } catch (err) {
        console.log(err);

        // Immediately revert state
        setAllData((prevData) => {
          const oldNotes = prevData.notes.filter((aNote) => aNote.noteid !== tempId);
          return { ...prevData, notes: oldNotes };
        });
        if (err.response) {
          showErrorNotification("Duplicating Note", err.response.message, true, []);
          return;
        }
        if (err.request) {
          networkNotificationError([]);
          return;
        }
        showErrorNotification(
          "Duplicating Note",
          "Please contact the developer if this issue persists. We seemed to have a problem duplicating your note. Please close the application, reload it and try the operation again.",
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Duplicate Note",
      `Are you sure you want to duplicate this note? ${note.title}`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
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

  const changeTitle = async (e): Promise<void> => {
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
      // Immediately update state
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

      await updateNote(token, newNote);

      showSuccessNotification("Updated Note Title", "Successfully renamed your note", false, []);
    } catch (err) {
      console.log(err);

      // Immediately reset state
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
        showErrorNotification("Updating Note", err.response.message, true, []);
        return;
      }
      if (err.request) {
        networkNotificationError([]);
        return;
      }
      showErrorNotification(
        "Updating Title",
        "We ran into an issue trying to update the title to your note. Please try again and if this issue persists, contact the developer",
        true,
        []
      );
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

  const moveToTrash = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    resetSystemNotification();
    const trashed = note.trashed;
    const newNote = { ...note, trashed: !trashed };

    const toggleTrashed = (isTrashed) => {
      if (isTrashed) {
        setTrashedNotes((prevTrash) => [...prevTrash, newNote]);
      } else {
        setTrashedNotes((prevTrash) => prevTrash.filter((aNote) => aNote.noteid !== note.noteid));
      }
    };

    const continueRequest = async (): Promise<void> => {
      try {
        // Immediately update state
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

        toggleTrashed(trashed);

        if (drafts.find((aDraft) => aDraft.noteid === note.noteid)) {
          return;
        }

        await moveNoteToTrash(token, note.noteid, !trashed);

        showSuccessNotification(
          `${note.title} ${trashed ? "Moved" : "Trashed"}`,
          `Successfully moved your note ${trashed ? "out of" : "into"} your trash`,
          false,
          [{ text: "undo", func: (): void => {} }]
        );
      } catch (err) {
        console.log(err);

        // Immediately revert state
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
        toggleTrashed(trashed);
        if (err.response) {
          showErrorNotification(
            `Issues ${trashed ? "Moving" : "Trashing"} Note`,
            err.response.message,
            true,
            []
          );
          return;
        }
        if (err.request) {
          networkNotificationError([]);
          return;
        }
        showErrorNotification(
          `Issues ${trashed ? "Moving" : "Trashing"} Note`,
          `Please contact the developer if this issue persists. We seemed to have a problem ${
            trashed ? "moving" : "trashing"
          } your note. Please close the application, reload it and try the operation again.`,
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Move To Trash",
      `Are you sure you want to move this note to the trash? ${note.title}`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  const deleteNote = (note: Note): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    resetSystemNotification();

    const continueRequest = async (): Promise<void> => {
      try {
        // Immediately update state and check for locked note
        if (note.locked) {
          setTrashedNotes((prev: Note[]): Note[] =>
            prev.filter((aNote: Note): boolean => aNote.noteid !== note.noteid)
          );
        } else {
          setAllData((prevData: AllData): AllData => {
            const newNotes: Note[] = prevData.notes.filter(
              (aNote: Note): boolean => aNote.noteid !== note.noteid
            );
            return {
              ...prevData,
              notes: newNotes
            };
          });
        }

        await deleteANote(token, note.noteid);

        showSuccessNotification(`${note.title} Deleted`, "Successfully deleted your note", false, [
          { text: "undo", func: (): void => {} }
        ]);
        const newNoteDems = userPreferences.noteDems.filter((aDem) => aDem.id !== note.noteid);
        setUserPreferences((prev) => {
          return { ...prev, noteDems: newNoteDems };
        });
        localStorage.setItem(
          "preferences",
          JSON.stringify({ ...userPreferences, noteDems: newNoteDems })
        );
      } catch (err) {
        console.log(err);
        setAllData((prevData) => {
          const newNotes = [...prevData.notes, note];
          return {
            ...prevData,
            notes: newNotes
          };
        });
        if (err.response) {
          showErrorNotification("Deleting Note", err.response.message, true, []);
          return;
        }
        if (err.request) {
          networkNotificationError([]);
          return;
        }
        showErrorNotification(
          "Deleting Note",
          "Please contact the developer if this issue persists. We seemed to have a problem deleting your note. Please close the application, reload it and try the operation again.",
          true,
          []
        );
      }
    };

    confirmOperationNotification(
      "Delete Note",
      `Are you sure you want to delete your note? ${note.title}`,
      [{ text: "delete", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  const confirmDeleteDraft = (note: Note): void => {
    showSuccessNotification(
      `Delete Draft ${note.title}`,
      "Are you sure you want to delete this note?",
      true,
      [{ text: "delete", func: () => deleteDraft(note) }]
    );
  };

  const deleteDraft = (note: Note): void => {
    resetSystemNotification();
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
    await window.save.saveTxt(plainText, note.title);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    showSuccessNotification(
      `Saved ${note.title}`,
      "Your file was saved successfully as a plain text file",
      true,
      []
    );
  };

  const saveFileToSysAsHtml = async (note: Note): Promise<void> => {
    await window.save.saveHtml(note.htmlText, note.title);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    showSuccessNotification(
      `Saved ${note.title}`,
      "Your file was saved successfully as HTML",
      true,
      []
    );
  };

  const saveFileToSysAsPdf = async (note: Note): Promise<void> => {
    const plainText = extractText(note.htmlText);
    await window.save.saveAsPdf(plainText, note.title);
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    showSuccessNotification(
      `Saved ${note.title}`,
      "Your file was successfully saved as a PDF",
      true,
      []
    );
  };

  const saveFileToSysAsDocX = async (note: Note): Promise<void> => {
    const plainText = extractText(note.htmlText);
    await window.save.saveAsDocX(plainText, note.title), user.username;
    setContextMenu({
      show: false,
      meta: { title: "", color: "" },
      options: []
    });
    showSuccessNotification(
      `Saved ${note.title}`,
      "Your file was saved successfully as DOCX",
      true,
      []
    );
  };

  const openWindow = async (note: Note): Promise<void> => {
    if (note.locked) {
      setLockedOpenNewWinNote(true);
      setAwaitingNote(note);
      setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
      setNote((prev) => prev.filter((aNote) => aNote.noteid !== note.noteid));
      return;
    }
    await window.openNewWin.openNoteInNewWindow(note, userPreferences.darkMode);
    setNote((prev) => prev.filter((aNote) => aNote.noteid !== note.noteid));
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

  const shareNote = (noteId: string): void => {
    setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] });
    setNoteShare((prev: NoteShare): NoteShare => {
      if (prev.notes.includes(noteId)) {
        console.log("includes");
        return {
          ...prev,
          show: true,
          notes: prev.notes.filter((noteid: string): boolean => noteid !== noteId)
        };
      }
      console.log("Does note include");
      return { show: true, connections: [...prev.connections], notes: [...prev.notes, noteId] };
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
            func: (): void => deleteNote(note),
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
          title: "share",
          icon: <BiShare />,
          func: (): void => shareNote(note.noteid)
        },
        {
          title: "move",
          icon: <FaArrowCircleRight />,
          func: () => move(note)
        },
        {
          title: "duplicate",
          icon: <FaCopy />,
          func: () => duplicate(note)
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
          func: (): void => moveToTrash(note)
        },
        {
          title: "delete forever",
          icon: <FaWindowClose />,
          func: (): void => deleteNote(note)
        }
      ]
    };
    setContextMenu(newMenu);
  };

  const openNote = (aNote): void => {
    if (aNote.locked) {
      setAwaitingNote(aNote);
      return setPinInput(true);
    }
    if (note.length > 0) {
      if (note.filter((theNote) => theNote.noteid === aNote.noteid).length > 0) {
        setMinimizeArray((prev) => {
          return prev.filter((noteid) => noteid !== aNote.noteid);
        });
        return;
      } else {
        setNote((prev) => [...prev, aNote]);
      }
    } else {
      setNote([aNote]);
    }
  };

  const unlockNote = async (): Promise<void> => {
    try {
      if (lockedOpenNewWinNote) {
        const stringifiedPin = JSON.stringify(pin);
        localStorage.setItem("pin", stringifiedPin);
        setPinInput(false);
        setPin({ first: "", second: "", third: "", fourth: "" });
        await window.openNewWin.openNoteInNewWindow(awaitingNote, userPreferences.darkMode);
        setAwaitingNote(null);
        setLockedOpenNewWinNote(false);
        return;
      }
      const stringifiedPin = JSON.stringify(pin);
      localStorage.setItem("pin", stringifiedPin);
      setPinInput(false);
      setPin({ first: "", second: "", third: "", fourth: "" });
      setNote((prev) => [...prev, awaitingNote]);
      setAwaitingNote(null);
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Unlocking Note",
        "Please contact the developer if this issue persists. We seemed to have a problem reading your pin. Please close the application, reload it and try the operation again",
        true,
        []
      );
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
    if (!noteDragFolder) {
      setNoteDragging(null);
      setNoteDrag(false);
      return;
    }
    if (noteDragFolder) {
      setNoteIsMoving(true);
    }
    showSuccessNotification(
      "Move Note",
      `Move note ${noteDragging.title} to folder ${noteDragFolder.title}?`,
      true,
      [
        {
          text: "cancel",
          func: (): void => {
            setNoteDrag(false);
            setNoteDragFolder(null);
            setNoteIsMoving(false);
            setNoteDragging(null);
            resetSystemNotification();
          }
        },
        {
          text: "confirm",
          func: (): void => moveNote()
        }
      ]
    );
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
    showSuccessNotification(`${note.title}`, `${note.title} was successfully saved`, false, []);
  };

  const updateFavorite = async (newFavorite: boolean, note: Note): Promise<void> => {
    const newNote = {
      ...note,
      favorite: newFavorite
    };
    const oldNotes = allData.notes;

    // Immediately update state
    setAllData((prev) => {
      return {
        ...prev,
        notes: prev.notes.map((aNote) => {
          if (aNote.noteid === note.noteid) {
            return newNote;
          } else {
            return aNote;
          }
        })
      };
    });

    try {
      await updateFavoriteOnNote(token, note.noteid, newFavorite);
      showSuccessNotification(`${note.title}`, `${note.title} was favored successfully`, false, []);
    } catch (err) {
      console.log(err);

      // Immediately revert state
      setAllData((prev) => {
        return {
          ...prev,
          notes: oldNotes
        };
      });

      if (err.request) {
        networkNotificationError([]);
        return;
      }
      if (err.response) {
        showErrorNotification("Favoring Note", err.response.data.message, true, []);
        return;
      }
      showErrorNotification(
        "Favoring Note",
        "We had an issue favoring your note. Please try again, and if the issue persists, contact the developer",
        true,
        []
      );
    }
  };

  return (
    <div className="w-full py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative mb-3">
        <div
          className={`absolute bottom-0 right-0 left-0 h-1 rounded-full w-full ${userPreferences.theme ? userPreferences.theme : "bg-amber-300"}`}
        ></div>
        {sharedNotes.map((shareNote: Note) => (
          <div
            key={shareNote.noteid}
            className={`${view === "list" ? "h-80" : view === "grid" ? "h-80" : "h-auto"} p-4 rounded-md shadow-lg relative cursor-pointer mx-3 my-5 pointer-events-auto ${userPreferences.darkMode ? "bg-[#333]" : "bg-[#e2e8f0]"}`}
            onClick={() => (!renameANote ? openNote(shareNote) : renameRef.current.focus())}
          >
            <div
              className={`duration-200 ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444] text-white" : "bg-slate-200 hover:bg-slate-300 text-black"} p-2 rounded-t-md mb-3`}
            >
              <p className="flex justify-center items-center gap-x-3 text-xs">
                From <FaUser />{" "}
                {connections.find((aCon: Connection) => aCon.userId === shareNote.from)?.email ||
                  "Unknown"}
              </p>
            </div>
            <div
              className={`absolute top-[-5px] left-[-5px] font-bold text-lg ${userPreferences.theme ? textThemeString || "text-amber-300" : "text-amber-300"}`}
            >
              <BiShareAlt />
            </div>
            <p className="font-semibold text-2xl">{shareNote.title}</p>
            <div
              className={`absolute right-0 bottom-0 shadow-md pt-2 pb-1 px-3 font-semibold text-sm z-10 ${
                userPreferences.darkMode ? "bg-[#222] text-white" : "bg-white text-black"
              } rounded-tl-md`}
            >
              <p className="flex justify-center items-center gap-x-1">
                <MdUpdate className="text-lg" />
                <span>
                  {new Date(shareNote.updated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </p>
            </div>
            <div
              className="mt-3 renderHtml max-h-[75%] overflow-y-clip"
              dangerouslySetInnerHTML={{
                __html:
                  shareNote.htmlText.slice(
                    0,
                    shareNote.htmlText.length / 5 < 500
                      ? shareNote.htmlText.length / 5 < 100
                        ? 100
                        : 500
                      : 500
                  ) + " ..."
              }}
            ></div>
          </div>
        ))}
        {shareRequests.map((shareNoteReq: ShareReq) => (
          <div
            key={shareNoteReq.id}
            className={`${view === "list" ? "h-80" : view === "grid" ? "h-80" : "h-auto"} p-4 rounded-md shadow-lg relative cursor-pointer outline outline-white mx-3 my-5 pointer-events-auto ${userPreferences.darkMode ? "bg-[#333]" : "bg-[#e2e8f0]"}`}
          >
            <p>{shareNoteReq.note.title}</p>
            <p>
              {new Date(shareNoteReq.note.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
        ))}
        {pinFavs
          ? pinnedFavorites.map((note: Note) => (
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
                whileDrag={{
                  pointerEvents: "none",
                  boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`,
                  zIndex: 1000
                }}
                onContextMenu={(e) => openNotesOptions(e, note)}
                key={note.noteid}
                className={`${view === "list" ? "h-80" : view === "grid" ? "h-80" : "h-auto"} p-4 rounded-md shadow-lg relative cursor-pointer mx-3 my-5 pointer-events-auto`}
                onClick={() => (!renameANote ? openNote(note) : renameRef.current.focus())}
              >
                {!note.trashed ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFavorite(!note.favorite, note);
                      }}
                      className={`absolute top-[-5px] duration-100 hover:scale-[1.25] left-[-5px] ${userPreferences.theme ? textThemeString || "text-amber-300" : "text-amber-300"}`}
                    >
                      {note.favorite === true ? <BsStarFill /> : <BsStar />}
                    </button>
                    <div
                      className={`absolute top-[-3px] left-3 ${userPreferences.theme ? textThemeString || "text-amber-300" : "text-amber-300"}`}
                    >
                      <TbPinned />
                    </div>
                  </>
                ) : null}
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
                        moveToTrash(note);
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
                    className="mt-3 renderHtml max-h-[75%] overflow-y-clip"
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
            ))
          : null}
      </div>
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
            whileDrag={{
              pointerEvents: "none",
              boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`,
              zIndex: 1000
            }}
            onContextMenu={(e) => openNotesOptions(e, note)}
            key={note.noteid}
            className={`${view === "list" ? "h-80" : view === "grid" ? "h-80" : "h-auto"} p-4 rounded-md shadow-lg relative cursor-pointer mx-3 my-5 pointer-events-auto`}
            onClick={() => (!renameANote ? openNote(note) : renameRef.current.focus())}
          >
            {search && folder === null ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch(false);
                  setFolder(allData.folders.find((fold) => fold.folderid === note.folderId));
                }}
                className={`duration-200 w-full ${userPreferences.darkMode ? "bg-[#333] hover:bg-[#444] text-white" : "bg-slate-200 hover:bg-slate-300 text-black"} p-2 mb-3 rounded-t-md`}
              >
                <p className="flex justify-center items-center gap-x-3 text-xs">
                  In <FaFolder />
                  <FaArrowRight />
                  {allData.folders.find((fold) => fold.folderid === note.folderId)?.title || "Home"}
                </p>
              </button>
            ) : null}
            {!note.trashed ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateFavorite(!note.favorite, note);
                }}
                className={`absolute top-[-5px] duration-100 hover:scale-[1.25] left-[-5px] ${userPreferences.theme ? textThemeString || "text-amber-300" : "text-amber-300"}`}
              >
                {note.favorite === true ? <BsStarFill /> : <BsStar />}
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
                    moveToTrash(note);
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
                className="mt-3 renderHtml max-h-[75%] overflow-y-clip"
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
            className="fixed bg-transparent inset-0 shadow-md z-999"
          ></div>
          <form
            className={`p-5  z-[999] fixed bottom-5 left-5 rounded-md shadow-md ${
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
