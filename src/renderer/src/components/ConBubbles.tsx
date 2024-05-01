import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { acceptRequestConnection } from "@renderer/utils/api";
import { FaUserCheck } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { Tooltip } from "react-tooltip";
// import { createConRequest } from "../utils/api";
import UserContext from "@renderer/contexxt/UserContext";

const ConBubbles = (): JSX.Element => {
  const {
    connections,
    connectionRequests,
    setConnections,
    hoverConnections,
    userPreferences,
    token,
    setSystemNotif
  } = useContext(UserContext);

  const [options, setOptions] = useState({ id: "", email: "" });
  const [conOptions, setConOptions] = useState({ id: "", email: "" });

  const themeStringText = userPreferences?.theme?.replace("bg", "text");

  const confirmAccept = (requestId: string, userEmail: string): void => {
    if (userPreferences.confirm) {
      const newConfirmation = {
        show: true,
        title: "Accept Connection",
        text: `Are you sure you know the person from this email? ${userEmail} and you would like to create a connection with them?`,
        color: "bg-yellow-300",
        hasCancel: true,
        actions: [
          {
            text: "cancel",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          },
          { text: "accept", func: () => acceptRequest(requestId, userEmail) }
        ]
      };
      setSystemNotif(newConfirmation);
      return;
    }
    acceptRequest(requestId, userEmail);
  };

  const acceptRequest = (requestId: string, userEmail: string): void => {
    acceptRequestConnection(token, requestId, userEmail)
      .then((res) => {
        setSystemNotif({
          show: false,
          title: "",
          text: "",
          color: "",
          hasCancel: false,
          actions: []
        });
        setSystemNotif({
          show: false,
          title: "New Connection",
          text: res.data.data.message,
          color: "bg-green-300",
          hasCancel: false,
          actions: [
            {
              text: "close",
              func: (): void =>
                setSystemNotif({
                  show: false,
                  title: "",
                  text: "",
                  color: "",
                  hasCancel: false,
                  actions: []
                })
            }
          ]
        });
        setConnections((prev) => [...prev, { id: res.data.data.conreqid, email: userEmail }]);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {connections.map((con, index) => (
        <>
          <AnimatePresence key={index}>
            {conOptions.id === con.id && (
              <motion.div
                key={con.email}
                initial={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                exit={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transformOrigin: "top right",
                  transition: { duration: 0.025 }
                }}
                style={{
                  right: hoverConnections ? 5 * index + 60 : 5,
                  zIndex: hoverConnections ? index : -1
                }}
                className={`fixed right-10 shadow-md rounded-md outline outline-slate-800 outline-2 text-white duration-200 ${
                  userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 p-2 pr-10 font-semibold">{conOptions.email}</p>
                <button
                  onClick={() => confirmAccept(con.id, con.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Remove</p>
                  <FaUserCheck />
                </button>
                <button
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Share Note</p>
                  <TiCancel />
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
                }
                return con;
              })
            }
            style={{
              right: hoverConnections ? 5 * index + 50 : 5,
              zIndex: hoverConnections ? index : -1
            }}
            className={`fixed top-3 rounded-full ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-slate-600 hover:bg-slate-500"
                : "bg-slate-300 hover:bg-slate-400"
            } duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
            key={con.id}
          >
            <Tooltip id="con-name" />
            <p className="text-lg font-bold">{con.email[0].toUpperCase()}</p>
          </button>
        </>
      ))}
      {connectionRequests.map((conReq, index) => (
        <>
          <AnimatePresence key={index}>
            {options.id === conReq.id && (
              <motion.div
                key={conReq.email}
                initial={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                exit={{ opacity: 0, scale: 0, transformOrigin: "top right" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transformOrigin: "top right",
                  transition: { duration: 0.025 }
                }}
                style={{
                  top: hoverConnections ? 5 * index + 60 : 5,
                  zIndex: hoverConnections ? index : -1
                }}
                className={`fixed right-10 shadow-md rounded-md outline outline-slate-800 outline-2 text-white duration-200 ${
                  userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                <p className="mb-2 p-2 pr-10 font-semibold">{options.email}</p>
                <button
                  onClick={() => confirmAccept(conReq.id, conReq.email)}
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Accept</p>
                  <FaUserCheck />
                </button>
                <button
                  className={`p-3 px-5 w-full duration-200 flex justify-between items-center ${
                    userPreferences.darkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <p>Decline</p>
                  <TiCancel />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            key={conReq.id}
            onClick={() =>
              setOptions((prev) => {
                if (prev.id === conReq.id) {
                  return { id: "", email: "" };
                }
                return conReq;
              })
            }
            style={{ top: 5 * index + 60, zIndex: index }}
            className={`fixed right-3 rounded-full shadow-md outline outline-slate-800 outline-2 ${
              userPreferences.theme ? themeStringText : "text-amber-300"
            } ${
              userPreferences.darkMode
                ? "bg-slate-600 hover:bg-slate-500"
                : "bg-slate-300 hover:bg-slate-400"
            } duration-200 w-10 h-10 flex justify-center items-center shadow-sm`}
          >
            <p className="text-lg font-bold">{conReq.email[0].toUpperCase()}</p>
          </button>
        </>
      ))}
    </>
  );
};

export default ConBubbles;
