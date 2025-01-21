import { Dispatch, SetStateAction, useContext, useState } from "react";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection, ShareReq } from "@renderer/types/types";

const ShareRequests = ({
  con,
  setConOptions
}: {
  con: Connection;
  setConOptions: Dispatch<SetStateAction<{ id: string; email: string }>>;
}): JSX.Element => {
  const { shareRequests, userPreferences } = useContext(UserContext);

  const [shareReqOptions, setShareReqOptions] = useState(false);

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

  const acceptNote = async (req: ShareReq): Promise<void> => {};

  const rejectNote = async (req: ShareReq): Promise<void> => {};

  return (
    <div>
      {shareRequests
        .filter((req: ShareReq) => req.from === con.email)
        .map((req: ShareReq) => (
          <div
            key={req.id}
            className={`p-3 relative w-full rounded-md outline outline-1 ${outlineThemeString} flex justify-between items-center`}
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
                className={`absolute left-[-100%] top-0 rounded-md ${userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"} p-3`}
              >
                <button
                  onClick={() => acceptNote(req)}
                  className={`${themeStringText} p-5 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
                >
                  Accept Note
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectNote(req);
                  }}
                  className={`text-red-300 p-5 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
                >
                  Reject Note
                </button>
              </div>
            ) : null}
          </div>
        ))}
    </div>
  );
};

export default ShareRequests;
