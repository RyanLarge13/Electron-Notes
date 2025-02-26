import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { BiMailSend } from "react-icons/bi";

import UserContext from "@renderer/contexxt/UserContext";
import { cancelExistingShare } from "@renderer/utils/api";

const ShareRequestsFrom = ({ con, setConOptions }) => {
  const {
    shareRequestsFrom,
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
        return;
      }
      if (err.response) {
        showErrorNotification("Canceling Request", err.response.data.message, true, []);
        return;
      }
      showErrorNotification(
        "Canceling Request",
        "We had an issue canceling your request. Please try again and if the issue persists, contact the developer",
        true,
        []
      );
    }
  };

  return shareRequestsFrom
    .filter((req) => req.to === con.email)
    .map((req) => (
      <div
        key={req.id}
        onClick={() => setShareReqOptionsShow((prev) => !prev)}
        className={`p-3 relative w-full rounded-md my-2 outline outline-1 ${outlineThemeString} flex justify-between items-center`}
      >
        <p>{req.note.title}</p>
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
              className={`${themeStringText} px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
            >
              Send Another
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShareReqOptionsShow(false);
                cancelExistingShareReq(req.id);
              }}
              className={`text-red-500 px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
            >
              Cancel Request
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShareReqOptionsShow(false);
              }}
              className={`text-red-300 px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
            >
              Close
            </button>
          </motion.div>
        ) : null}
      </div>
    ));
};

export default ShareRequestsFrom;
