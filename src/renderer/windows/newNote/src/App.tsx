import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../src/assets/quill.css";
import { Note } from "@renderer/types/types";
import { FaSave } from "react-icons/fa";

const App = (): JSX.Element => {
  const [theNote, setTheNote] = useState(null);
  const [value, setValue] = useState("");
  const [noteId, setNoteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [height, setHight] = useState(600);

  useEffect(() => {
    window.electron.onDisplayNote((note: Note, theme: boolean) => {
      setValue(note.htmlText);
      setNoteId(note.noteid);
      setLoading(false);
      setTheNote(note);
      setDarkMode(theme);
    });

    const handleResize = (): void => {
      const newHeight = window.innerHeight;
      setHight(newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendDataToFrontEnd = (e: string): void => {
    window.electron.sendNoteUpdate({ text: e, id: noteId });
  };

  const saveNote = (): void => {
    const newNote = {
      ...theNote,
      htmlText: value
    };
    window.electron.sendNoteSave(newNote);
  };

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

  return (
    <section className={`${darkMode ? "bg-[#222] text-white" : "bg-white text-black"} relative`}>
      {loading ? (
        <p>Loading....</p>
      ) : (
        <>
          <div style={{ maxHeight: `${height}px` }}>
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={value}
              onChange={(e) => {
                sendDataToFrontEnd(e);
                setValue(e);
              }}
              style={{
                height: `${height}px`,
                paddingBottom: "30px"
              }}
            />
          </div>
          <button
            onClick={() => saveNote()}
            className="fixed z-[999] bottom-3 right-5 text-lg text-amber-300"
          >
            <FaSave />
          </button>
        </>
      )}
    </section>
  );
};

export default App;
