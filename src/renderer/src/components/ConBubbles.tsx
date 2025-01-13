import { AnimatePresence, motion } from "framer-motion";
import { useContext, useState } from "react";
import { FaUserCheck } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { Tooltip } from "react-tooltip";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection } from "@renderer/types/types";
import { acceptRequestConnection, declineConnectionRequest } from "@renderer/utils/api";

const ConBubbles = (): JSX.Element => {
  const {
    connections,
    connectionRequests,
    hoverConnections,
    userPreferences,
    token,
    resetSystemNotification,
    setConnections,
    setHoverConnections,
    showSuccessNotification
  } = useContext(UserContext);

  const [options, setOptions] = useState<Connection>({ id: "", email: "" });
  const [conOptions, setConOptions] = useState<Connection>({ id: "", email: "" });

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

  const confirmAccept = (requestId: string, userEmail: string): void => {
    if (userPreferences.confirm) {
      showSuccessNotification(
        "Accept Connection",
        `Are you sure you know the person from this email? ${userEmail} and you would like to create a connection with them?`,
        true,
        [{ text: "accept", func: () => acceptRequest(requestId, userEmail) }]
      );
      return;
    }
    acceptRequest(requestId, userEmail);
  };

  const acceptRequest = (requestId: string, userEmail: string): void => {
    acceptRequestConnection(token, requestId, userEmail)
      .then((res) => {
        resetSystemNotification();
        showSuccessNotification("New Connection", res.data.message, false, []);
        setConnections((prev) => [...prev, { id: res.data.data.conreqid, email: userEmail }]);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const declineRequest = async (requestId: string, userEmail: string): Promise<void> => {
    // Do confirmation
    // Then checks

    try {
      const declinedRequest = declineConnectionRequest(token, requestId, userEmail);
      console.log(declinedRequest);
    } catch (err) {
      console.log(err);
    }
  };

  const shareNoteWithUser = (conId: string, conEmail: string): void => {};

  return (
    <>
      {/* Current connections */}
      {connections.map((con, index) => (
        <div key={con.id}>
          <AnimatePresence>
            {conOptions.id === con.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                exit={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transformOrigin: "top right",
                  transition: { duration: 0.025 }
                }}
                style={{
                  right: 25 * index + 60,
                  zIndex: index
                }}
                className={`fixed rounded-tr-2xl right-10 top-3 shadow-md rounded-md text-white duration-200 ${
                  userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 p-2 pr-12 font-semibold">{conOptions.email}</p>
                <button
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Remove</p>
                  <TiCancel />
                </button>
                <button
                  onClick={() => shareNoteWithUser(con.id, con.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Share Note</p>
                  <FaUserCheck />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            data-tooltip-delay-show={750}
            data-tooltip-id="con-name"
            data-tooltip-content={con.email}
            onClick={() =>
              setConOptions((prev) => {
                if (prev.id === con.id) {
                  return { id: "", email: "" };
                } else {
                  return { id: con.id, email: con.email };
                }
              })
            }
            style={{
              right: 25 * index + 60,
              zIndex: index
            }}
            className={`fixed top-3 rounded-full ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-[#333] hover:bg-[#444]"
                : "bg-slate-300 hover:bg-slate-400"
            } ${conOptions.id === con.id ? `outline ${outlineThemeString}` : ""} duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
            key={con.id}
          >
            <Tooltip id="con-name" />
            <p className="text-lg font-bold">{con.email[0].toUpperCase()}</p>
          </button>
        </div>
      ))}
      {/* Current connections */}

      {/* Connection requests */}
      {connectionRequests.map((conReq, index) => (
        <div key={conReq.email}>
          <AnimatePresence key={conReq.id}>
            {options.id === conReq.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                exit={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transformOrigin: "top right",
                  transition: { duration: 0.025 }
                }}
                style={{
                  top: hoverConnections ? 25 * index + 60 : 25,
                  zIndex: hoverConnections ? index : -1
                }}
                className={`fixed rounded-tr-2xl right-5 shadow-md rounded-md text-white duration-200 ${
                  userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 p-2 pr-12 font-semibold">{options.email}</p>
                <button
                  onClick={() => confirmAccept(conReq.id, conReq.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Accept</p>
                  <FaUserCheck />
                </button>
                <button
                  onClick={() => declineRequest(conReq.id, conReq.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Decline</p>
                  <TiCancel />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <Tooltip id={`user-email-tooltip-${conReq.email}`} />
          <button
            onMouseEnter={() => setHoverConnections(true)}
            onClick={() =>
              setOptions((prev) => {
                if (prev.id === conReq.id) {
                  return { id: "", email: "" };
                }
                return conReq;
              })
            }
            style={{ top: 25 * index + 60, zIndex: index }}
            data-tooltip-content={conReq.email}
            data-tooltip-id={`user-email-tooltip-${conReq.email}`}
            className={`fixed right-5 hover:z-[999] rounded-full shadow-md ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-[#333] hover:bg-[#444]"
                : "bg-slate-300 hover:bg-slate-400"
            } ${options.id === conReq.id ? `outline ${outlineThemeString}` : ""} duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
          >
            <p className="text-lg font-bold">{conReq.email[0].toUpperCase()}</p>
          </button>
        </div>
      ))}
      {/* Connection requests */}
    </>
  );
};

export default ConBubbles;
