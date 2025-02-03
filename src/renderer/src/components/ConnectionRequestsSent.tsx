import { useContext, useState } from "react";

import UserContext from "@renderer/contexxt/UserContext";
import { ConReq } from "@renderer/types/types";
import { cancelExistingConReq } from "@renderer/utils/api";

const ConnectionRequestsSent = () => {
  const {
    connectionRequestsSent,
    userPreferences,
    token,
    setConnectionRequestsSent,
    networkNotificationError,
    showErrorNotification,
    confirmOperationNotification
  } = useContext(UserContext);

  const [showConReqOptions, setShowConReqOptions] = useState(false);

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const cancelSentRequest = (con: ConReq): void => {
    const continueRequest = async (): Promise<void> => {
      try {
        const response = await cancelExistingConReq(con.id, token);
        setConnectionRequestsSent((prev) => prev.filter((aCon) => aCon.id !== con.id));
        console.log(response);
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

    confirmOperationNotification(
      "Cancel Connection Request",
      `Are you sure you want to cancel the connection request you sent to ${con.to}?`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  return (
    <div>
      {connectionRequestsSent.map((con: ConReq) => (
        <div
          key={con.id}
          onClick={() => setShowConReqOptions((prev: boolean) => !prev)}
          className="my-2 relative flex flex-col justify-start items-center rounded-md hover:shadow-lg w-full duration-200"
        >
          <div className="flex justify-center items-center gap-x-2">
            <div className="rounded-full w-[5px] h-[5px] bg-red-300 shadow-md"></div>
            <p className="p-3">{con.to}</p>
          </div>
          {showConReqOptions ? (
            <div className="overflow-hidden rounded-md w-full">
              <button
                onClick={() => cancelSentRequest(con)}
                className={`text-red-300 p-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
              >
                Cancel Request
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConReqOptions(false);
                }}
                className={`${themeStringText} p-3 duration-200 whitespace-nowrap w-full ${userPreferences.darkMode ? "hover:bg-[#555]" : "hover:bg-slate-400"}`}
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

export default ConnectionRequestsSent;
