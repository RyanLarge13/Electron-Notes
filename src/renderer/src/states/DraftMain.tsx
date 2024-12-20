import UserContext from "@renderer/contexxt/UserContext";
import { useContext } from "react";
import Draft from "./Draft";

const DraftMain = (): JSX.Element => {
  const { noteToEdit } = useContext(UserContext);

  return (
    <>
      {noteToEdit.map((draft) => (
        <Draft key={draft.noteid} noteToEdit={draft} />
      ))}
    </>
  );
};

export default DraftMain;
