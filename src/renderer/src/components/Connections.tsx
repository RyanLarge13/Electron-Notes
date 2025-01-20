import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";

import UserContext from "@renderer/contexxt/UserContext";

import { createConRequest } from "../utils/api";

const Connections = (): JSX.Element => {
  const {
    userPreferences,
    user,
    token,
    setCreateCon,
    setConnectionRequestsSent,
    showSuccessNotification,
    showErrorNotification
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendRequest = (e): void => {
    e.preventDefault();
    if (!email) {
      return;
    }
    try {
      setLoading(true);
      createConRequest(token, email)
        .then((res) => {
          setCreateCon(false);
          showSuccessNotification("Connection Request Sent", res.data.message, true, [
            {
              text: "cancel",
              func: (): void => {}
            }
          ]);
          setConnectionRequestsSent((prev) => [
            ...prev,
            { id: res.data.data.conreqid, to: email, from: user.email }
          ]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          showErrorNotification("Error Sending Request", err.response.data.message, false, []);
        });
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <>
      <div
        className="fixed z-40 inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
        onClick={() => setCreateCon(false)}
      ></div>
      <motion.section
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-10 z-40 right-10 left-10 max-w-[500px] p-5 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-slate-200"
        } rounded-md shadow-md`}
      >
        <p>Create A Connection</p>
        <form onSubmit={sendRequest}>
          <input
            placeholder="Users Email"
            autoFocus={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`focus:outline-none p-2 text-xl ${
              userPreferences.darkMode ? "text-white" : "text-black"
            } bg-transparent w-full font-semibold`}
          />
        </form>
        <button
          disabled={loading}
          onClick={(e) => sendRequest(e)}
          className="mt-5 py-2 px-3 w-full rounded-md shadow-md bg-amber-300 text-black font-bold"
        >
          {loading ? <ClipLoader color="#000" size={15} /> : "Send Request"}
        </button>
      </motion.section>
    </>
  );
};

export default Connections;
