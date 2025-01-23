import { Dispatch, SetStateAction, useContext, useState } from "react";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection, ShareReq } from "@renderer/types/types";
import { createShare } from "@renderer/utils/api";

const ShareRequests = ({
  con,
  setConOptions
}: {
  con: Connection;
  setConOptions: Dispatch<SetStateAction<{ id: string; email: string }>>;
}): JSX.Element => {
  const {
    shareRequests,
    userPreferences,
    token,
    networkNotificationError,
    showErrorNotification,
    showSuccessNotification
  } = useContext(UserContext);

  const [shareReqOptions, setShareReqOptions] = useState(false);

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

  const acceptNote = async (req: ShareReq): Promise<void> => {
    try {
      const response = await createShare(req.id, req.from, token);
      console.log(response);
      showSuccessNotification("Accepted Note", response.data.data.message, false, []);
    } catch (err) {
      console.log(err);
      if (err.request) {
        networkNotificationError([]);
      }
      if (err.response) {
        showErrorNotification("Accepting Note", err.response.message, true, []);
      }
    }
  };

  const rejectNote = async (req: ShareReq): Promise<void> => {};

  return (
    <div>
      {shareRequests
        .filter((req: ShareReq) => req.from === con.email)
        .map((req: ShareReq) => (
          <div
            key={req.id}
            onClick={() => setShareReqOptions((prev) => !prev)}
            className={`relative p-3 w-full rounded-md outline outline-1 ${outlineThemeString} flex justify-between items-center`}
          >
            <div>
              <p>{req.note.title}</p>
              <p>
                {new Date(req.note.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
            {shareReqOptions ? (
              <div
                className={`absolute left-[-105%] top-0 rounded-md overflow-hidden ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"}`}
              >
                <button
                  onClick={() => acceptNote(req)}
                  className={`${themeStringText} px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
                >
                  Accept Note
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectNote(req);
                  }}
                  className={`text-red-400 px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
                >
                  Reject Note
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareReqOptions(false);
                  }}
                  className={`text-red-300 px-5 py-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        ))}
    </div>
  );
};

export default ShareRequests;
