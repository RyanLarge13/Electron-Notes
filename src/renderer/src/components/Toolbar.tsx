import {
  FaHeading,
  FaBold,
  FaItalic,
  FaAlignLeft,
  FaAlignRight,
  FaAlignCenter,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaCode
} from "react-icons/fa";
import { useSlate } from "slate-react";

const Toolbar = ({ CustomEditor }) => {
  const editor = useSlate();

  return (
    <div className="p-3 rounded-md shadow-md bg-slate-700 flex justify-center items-center gap-3 text-l">
      <button
        className={`${
          CustomEditor.isHeadingActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleHeading1(editor);
        }}
      >
        <FaHeading />
      </button>
      <button
        className={`${
          CustomEditor.isBoldMarkActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleBoldMark(editor);
        }}
      >
        <FaBold />
      </button>
      <button
        className={`${
          CustomEditor.isItalic(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleItalic(editor);
        }}
      >
        <FaItalic />
      </button>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaCode />
      </button>
      <p> | </p>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaAlignLeft />
      </button>
      <button
        className={`${
          CustomEditor.isCenter(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCenter(editor);
        }}
      >
        <FaAlignCenter />
      </button>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaAlignRight />
      </button>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaAlignJustify />
      </button>
      <p> | </p>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaUndo />
      </button>
      <button
        className={`${
          CustomEditor.isCodeBlockActive(editor) ? "bg-amber-300 text-black" : "bg-transparent"
        } p-2 rounded-md shaodw-md`}
        onClick={(e) => {
          e.preventDefault();
          CustomEditor.toggleCodeBlock(editor);
        }}
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default Toolbar;
