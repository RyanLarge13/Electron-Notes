import { useContext } from "react";
import { motion } from "framer-motion";
// import { createConRequest } from "../utils/api";
import UserContext from "@renderer/contexxt/UserContext";

const ConBubbles = (): JSX.Element => {
  const { connections, connectionRequests, userPreferences } = useContext(UserContext);

  const themeStringText = userPreferences?.theme?.replace("bg", "text");

  return (
    <>
      {connections.map((con, index) => (
        <div
          style={{ right: 5 * index + 50 }}
          className={`fixed top-3 rounded-full ${
            userPreferences.theme ? themeStringText : "text-amber-300"
          } ${
            userPreferences.darkMode
              ? "bg-slate-600 hover:bg-slate-500"
              : "bg-slate-300 hover:bg-slate-400"
          } duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
          key={con.id}
        >
          <p className="text-lg font-bold">{con.email[0].toUpperCase()}</p>
        </div>
      ))}
      {connectionRequests.map((conReq, index) => (
        <div
          style={{ top: 5 * index + 50 }}
          className={`fixed right-3 rounded-full ${
            userPreferences.theme ? themeStringText : "text-amber-300"
          } ${
            userPreferences.darkMode
              ? "bg-slate-600 hover:bg-slate-500"
              : "bg-slate-300 hover:bg-slate-400"
          } duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
          key={conReq.id}
        >
          <p className="text-lg font-bold">{conReq.email[0].toUpperCase()}</p>
        </div>
      ))}
    </>
  );
};

export default ConBubbles;
