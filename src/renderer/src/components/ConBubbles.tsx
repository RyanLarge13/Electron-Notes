import { AnimatePresence, motion } from "framer-motion";
import { useContext, useState } from "react";
import { BiShare } from "react-icons/bi";
import { FaUserCheck } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { Tooltip } from "react-tooltip";

import UserContext from "@renderer/contexxt/UserContext";
import { Connection, ConReq } from "@renderer/types/types";
import {
  acceptRequestConnection,
  declineConnectionRequest,
  removeConnection
} from "@renderer/utils/api";

import ShareRequests from "./ShareRequests";
import ShareRequestsFrom from "./ShareRequestsFrom";

const ConBubbles = (): JSX.Element => {
  const {
    connections,
    connectionRequestsReceived,
    hoverConnections,
    userPreferences,
    token,
    shareRequests,
    setNoteShare,
    setConnections,
    setConnectionRequestsReceived,
    setHoverConnections,
    showSuccessNotification,
    networkNotificationError,
    showErrorNotification,
    confirmOperationNotification
  } = useContext(UserContext);

  const [options, setOptions] = useState<Connection>({ id: "", email: "", userId: "" });
  const [conOptions, setConOptions] = useState<Connection>({ id: "", email: "", userId: "" });

  const themeStringText = userPreferences?.theme
    ? userPreferences.theme.replace("bg", "text")
    : "text-amber-300";

  const outlineThemeString = themeStringText.replace("text", "outline");

  // Handling connection requests ------------------------------------------------------------------
  const acceptRequest = (requestId: string, userEmail: string): void => {
    const continueRequest = async (): Promise<void> => {
      try {
        const response = await acceptRequestConnection(token, requestId, userEmail);
        console.log(response);
        showSuccessNotification("New Connection", response.data.message, false, []);
        setConnections((prev) => [
          ...prev,
          {
            id: response.data.data.conreqid,
            email: userEmail,
            userId: response.data.data.userId || 0
          }
        ]);
        setConnectionRequestsReceived((prev) => prev.filter((aCon) => aCon.id !== requestId));
      } catch (err) {
        if (err.response) {
          showErrorNotification("New Connection", err.response.message, true, []);
        }
        if (err.request) {
          networkNotificationError([]);
        }
      }
    };

    confirmOperationNotification(
      "Accept Connection",
      `Are you sure you know the person from this email? ${userEmail}, and you would like to create a connection with them?`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };

  const declineRequest = async (requestId: string, userEmail: string): Promise<void> => {
    const continueRequest = async (): Promise<void> => {
      try {
        const response = await declineConnectionRequest(token, requestId);
        console.log(response);
        setConnectionRequestsReceived((prev: ConReq[]): ConReq[] =>
          prev.filter((aCon: ConReq): boolean => aCon.id !== requestId)
        );
        showSuccessNotification(
          `Declined Connection With ${userEmail}`,
          response.data.message,
          true,
          []
        );
      } catch (err) {
        console.log(err);
        if (err.response) {
          showErrorNotification("Declining Connection Request", err.response.message, true, []);
        }
        if (err.request) {
          networkNotificationError([]);
        }
      }
    };

    confirmOperationNotification(
      "Decline Request",
      `Are you sure you would like to decline the request to connect with ${userEmail}?`,
      [{ text: "confirm", func: (): Promise<void> => continueRequest() }],
      continueRequest
    );
  };
  // Handling connection requests ------------------------------------------------------------------

  // Handle current connections --------------------------------------------------------------------
  const removeExistingConnection = (conId: string, conEmail: string): void => {
    const continueRequest = async (): Promise<void> => {
      try {
        const response = await removeConnection(conEmail, token);
        console.log(response);
        setConnections((prev: Connection[]) =>
          prev.filter((aCon: Connection): boolean => aCon.id !== conId)
        );
        showSuccessNotification("Removed Connection", response.data.message, false, []);
      } catch (err) {
        console.log(err);
        if (err.response) {
          showErrorNotification("Removing Connection", err.response.message, true, []);
        }
        if (err.request) {
          networkNotificationError([]);
        }
      }
    };

    confirmOperationNotification(
      "Remove Connection",
      `Are you sure you want to remove your connection with ${conEmail}?`,
      [{ text: "confirm", func: () => continueRequest() }],
      continueRequest
    );
  };
  // Handle current connections --------------------------------------------------------------------

  // Note sharing logic ----------------------------------------------------
  const requestNoteShare = (conId: string): void => {
    // Select Note
    setConOptions({ id: "", email: "", userId: "" });
    setNoteShare((prev) => {
      if (prev.connections.includes(conId)) {
        return {
          show: true,
          notes: prev.notes,
          connections: prev.connections.filter((aCon: string): boolean => aCon !== conId)
        };
      } else {
        return {
          show: true,
          notes: prev.notes,
          connections: [...prev.connections, conId]
        };
      }
    });
  };
  // Note sharing logic ----------------------------------------------------

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
                  zIndex: 10
                }}
                className={`fixed z-40 rounded-tr-2xl right-10 top-3 shadow-md rounded-md text-white duration-200 ${
                  userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 px-5 py-2 pr-12 my-5 font-semibold">{conOptions.email}</p>
                <button
                  onClick={() => requestNoteShare(con.id)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Share Note</p>
                  <BiShare />
                </button>
                <button
                  onClick={() => removeExistingConnection(con.id, con.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-[#333] hover:bg-[#444]"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Remove Connection</p>
                  <TiCancel />
                </button>
                <div
                  className={`${userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"} rounded-md p-3 my-3`}
                >
                  <p className="pl-3 mt-3 mb-5">Share Requests Sent</p>
                  <ShareRequestsFrom con={con} setConOptions={setConOptions} />
                </div>
                <div
                  className={`${userPreferences.darkMode ? "bg-[#444]" : "bg-slate-300"} rounded-md p-3 my-3`}
                >
                  <p className="pl-3 mt-3 mb-5">Incoming Share Requests</p>
                  <ShareRequests con={con} setConOptions={setConOptions} />
                </div>
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
                  return { id: "", email: "", userId: "" };
                } else {
                  return { id: con.id, email: con.email, userId: "" };
                }
              })
            }
            style={{
              right: 25 * index + 60,
              zIndex: conOptions.id === con.id ? 999 : index
            }}
            className={`fixed z-40 top-3 rounded-full ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-[#333] hover:bg-[#444]"
                : "bg-slate-300 hover:bg-slate-400"
            } ${conOptions.id === con.id ? `outline ${outlineThemeString}` : ""} duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
            key={con.id}
          >
            <Tooltip id="con-name" />
            {shareRequests.filter((aReq) => aReq.from === con.email).length ? (
              <div className="absolute top-0 text-black right-0 flex justify-center items-center rounded-full w-[10px] h-[10px] bg-red-400">
                <p className="text-[8px] font-bold">
                  {shareRequests.filter((aReq) => aReq.from === con.email).length}
                </p>
              </div>
            ) : null}
            <p className="text-lg font-bold">{con.email[0].toUpperCase()}</p>
          </button>
        </div>
      ))}
      {/* Current connections */}

      {/* Connection requests */}
      {connectionRequestsReceived.map((conReq, index) => (
        <div key={conReq.from}>
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
                className={`fixed rounded-tr-2xl z-40 right-5 shadow-md rounded-md text-white duration-200 ${
                  userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 p-2 pr-12 font-semibold">{options.email}</p>
                <button
                  onClick={() => acceptRequest(conReq.id, conReq.from)}
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
                  onClick={() => declineRequest(conReq.id, conReq.from)}
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
          <Tooltip id={`user-email-tooltip-${conReq.from}`} />
          <button
            onMouseEnter={() => setHoverConnections(true)}
            onClick={() =>
              setOptions((prev: { id: string; email: string; userId: string }) => {
                if (prev.id === conReq.id) {
                  return { id: "", email: "", userId: "" };
                }
                return { id: conReq.id, email: conReq.from, userId: "" };
              })
            }
            style={{ top: 25 * index + 60, zIndex: index }}
            data-tooltip-content={conReq.from}
            data-tooltip-id={`user-email-tooltip-${conReq.from}`}
            className={`fixed right-5 hover:z-[999] rounded-full z-40 shadow-md ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-[#333] hover:bg-[#444]"
                : "bg-slate-300 hover:bg-slate-400"
            } ${options.id === conReq.id ? `outline ${outlineThemeString}` : ""} duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
          >
            <p className="text-lg font-bold">{conReq.from[0].toUpperCase()}</p>
          </button>
        </div>
      ))}
      {/* Connection requests */}
    </>
  );
};

export default ConBubbles;
