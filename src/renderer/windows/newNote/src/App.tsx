import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const App = (): JSX.Element => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.electron.onDisplayNote((note) => {
      setValue(note.htmlText);
      setLoading(false);
      console.log(note);
    });
  }, []);

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
    <section className="min-h-screen bg-[#222] text-white">
      <div className="h-full bg-[#222] text-whites">
        {loading ? (
          <p>Loading....</p>
        ) : (
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={value}
            // onChange={(e) => {
            //   if (!changed) {
            //     setChanged(true);
            //   }
            //   setValue(e);
            // }}
            style={{
              height: "80%"
            }}
          />
        )}
      </div>
    </section>
  );
};

export default App;
