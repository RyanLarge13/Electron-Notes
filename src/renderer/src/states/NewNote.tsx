import Toolbar from "@renderer/components/Toolbar";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Transforms, Element, createEditor, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code"
    });

    return !!match;
  },

  isHeadingActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.h1 === true : false;
  },

  isItalic(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  isCenter(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.center === true : false;
  },

  toggleHeading1(editor) {
    const isActive = CustomEditor.isHeadingActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "h1");
    } else {
      Editor.addMark(editor, "h1", true);
    }
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  toggleItalic(editor) {
    const isActive = CustomEditor.isItalic(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },

  toggleCenter(editor) {
    const isActive = CustomEditor.isCenter(editor);
    if (isActive) {
      Editor.removeMark(editor, "center");
    } else {
      Editor.addMark(editor, "center", true);
    }
  }
};

const NewNote = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem("content")) || [
        {
          type: "paragraph",
          children: [{ text: "A line of text in a paragraph." }]
        }
      ],
    []
  );

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <>
      <div
        className="fixed z-10 inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
        onClick={() => navigate("/")}
      ></div>
      <div className="fixed top-20 right-5 left-5 lg:right-60 lg:left-60 bottom-20 rounded-md shadow-md bg-black z-40">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 text-xl bg-black focus:outline-none"
        />
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={(value) => {
            const isAstChange = editor.operations.some((op) => "set_selection" !== op.type);
            if (isAstChange) {
              const content = JSON.stringify(value);
              localStorage.setItem("content", content);
            }
          }}
        >
          <Editable
            style={{
              height: "90%",
              overflow: "auto",
              border: "none",
              outline: "none",
              padding: 10
            }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event) => {
              if (!event.ctrlKey) {
                return;
              }

              // Replace the `onKeyDown` logic with our new commands.
              switch (event.key) {
                case "`": {
                  event.preventDefault();
                  CustomEditor.toggleCodeBlock(editor);
                  break;
                }

                case "b": {
                  event.preventDefault();
                  CustomEditor.toggleBoldMark(editor);
                  break;
                }
              }
            }}
          />
          <Toolbar CustomEditor={CustomEditor} />
        </Slate>
      </div>
    </>
  );
};

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold || props.leaf.h1 ? "bold" : "normal",
        fontSize: props.leaf.h1 ? 40 : 16,
        fontStyle: props.leaf.italic ? "italic" : props.leaf.underline ? "underline" : "normal",
        textAlign: props.leaf.center
          ? "center"
          : props.leaf.right
            ? "right"
            : props.leaf.left
              ? "left"
              : "right",
        backgroundColor: props.leaf.code ? "#aaa" : "#000",
        color: props.leaf.code ? "#000" : "#fff"
      }}
    >
      {props.children}
    </span>
  );
};

const CodeElement = (props) => {
  return (
    <pre
      style={{
        backgroundColor: "#aaa",
        color: "#000",
        fontFamily: "monospace",
        padding: 5,
        borderRadius: 10
      }}
      {...props.attributes}
    >
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

export default NewNote;
