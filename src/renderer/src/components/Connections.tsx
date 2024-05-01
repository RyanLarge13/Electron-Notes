import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { createConRequest } from "../utils/api";
import { ClipLoader } from "react-spinners";
import UserContext from "@renderer/contexxt/UserContext";

const Connections = (): JSX.Element => {
  const { userPreferences, setCreateCon, token, setSystemNotif, setConsSent } =
    useContext(UserContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendRequest = (e): void => {
    e.preventDefault();
    try {
      setLoading(true);
      createConRequest(token, email)
        .then((res) => {
          setCreateCon(false);
          setSystemNotif({
            show: true,
            title: "Connection Request Sent",
            text: res.data.message,
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
              },
              {
                text: "cancel",
                func: (): void => {}
              }
            ]
          });
          setConsSent((prev) => [...prev, { id: res.data.data.conreqid, email }]);
          console.log(res);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
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
          userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"
        } rounded-md shadow-md`}
      >
        <p>Create a Connection</p>
        <form onSubmit={sendRequest}>
          <input
            placeholder="Users Email"
            autoFocus={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`focus:outline-none p-2 text-xl ${
              userPreferences.darkMode ? "text-white" : "text-black"
            } bg-transparent`}
          />
        </form>
        <button
          disabled={loading}
          onClick={(e) => sendRequest(e)}
          className="mt-5 py-2 px-3 rounded-md shadow-md bg-amber-300 text-black font-bold"
        >
          {loading ? <ClipLoader color="#000" size={15} /> : "Send Request"}
        </button>
      </motion.section>
    </>
  );
};

export default Connections;
