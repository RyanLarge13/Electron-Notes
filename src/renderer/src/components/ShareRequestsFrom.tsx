import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { BiMailSend } from "react-icons/bi";

import UserContext from "@renderer/contexxt/UserContext";
import { Note } from "@renderer/types/types";
import { cancelExistingShare } from "@renderer/utils/api";

const ShareRequestsFrom = ({ con, setConOptions }) => {
  const {
    shareRequestsFrom,
    allData,
    userPreferences,
    token,
    setNoteShare,
    setShareRequestsFrom,
    showErrorNotification,
    showSuccessNotification,
    networkNotificationError
  } = useContext(UserContext);

  const [shareReqOptionsShow, setShareReqOptionsShow] = useState(false);

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

  const shareNewNote = () => {
    setConOptions((prev) => {
      if (prev.id === con.id) {
        return { id: "", email: "" };
      } else {
        return { id: con.id, email: con.email };
      }
    });

    setNoteShare({ show: true, notes: [], connections: [con.id] });
  };

  const cancelExistingShareReq = async (shareId: string) => {
    try {
      const response = await cancelExistingShare(shareId, token);
      showSuccessNotification("Canceled Request", response.data.message, false, []);
      setShareRequestsFrom((prev) => prev.filter((prev) => prev.id !== shareId));
    } catch (err) {
      console.log(err);
      if (err.request) {
        networkNotificationError([]);
      }
      if (err.response) {
        showErrorNotification("Canceling Request", err.response.data.message, true, []);
      }
    }
  };

  return shareRequestsFrom
    .filter((req) => req.to === con.email)
    .map((req) => (
      <button
        key={req.id}
        onClick={() => setShareReqOptionsShow((prev) => !prev)}
        className={`p-3 relative w-full rounded-md outline outline-1 ${outlineThemeString} flex justify-between items-center`}
      >
        <p>{allData.notes.find((aNote: Note) => aNote.noteid === req.note)?.title}</p>
        <div>
          <div className="rounded-full bg-red-300 shadow-md w-[5px] h-[5px]"></div>
          <BiMailSend />
        </div>
        {shareReqOptionsShow ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"} overflow-hidden absolute right-[102%] top-0 rounded-md shadow-md text-xs`}
          >
            <button
              onClick={() => shareNewNote()}
              className={`${themeStringText} p-5 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
            >
              Send Another
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShareReqOptionsShow(false);
                cancelExistingShareReq(req.id);
              }}
              className={`text-red-300 p-5 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
            >
              Cancel Request
            </button>
          </motion.div>
        ) : null}
      </button>
    ));
};

export default ShareRequestsFrom;
