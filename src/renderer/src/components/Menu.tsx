import { useContext } from "react";
import { motion } from "framer-motion";
import { FaShareAlt } from "react-icons/fa";
import Tree from "./Tree";
import UserContext from "@renderer/contexxt/UserContext";
import { deleteUser } from "@renderer/utils/api";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const {
    setMenu,
    user,
    allData,
    setUser,
    setNotes,
    setToken,
    setFolders,
    setMainTitle,
    setSystemNotif,
    setSettings,
    token
  } = useContext(UserContext);

  const navigate = useNavigate();

  const confirmLogout = (): void => {
    const newConfirmation = {
      show: true,
      title: "Logout",
      text: "Are you sure you want to logout?",
      color: "bg-amber-300",
      hasCancel: false,
      actions: [
        { text: "cancel", func: (): void => setSystemNotif({ show: false }) },
        { text: "logout", func: (): void => logout() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("pin");
    setSystemNotif({ show: false });
  };

  const confirmDeleteAccount = (): void => {
    const newConfirmation = {
      show: true,
      title: `Delete Account`,
      text: "Are you sure deleting your entire account is what you want to do? You will lose all of your data",
      color: "bg-red-600",
      hasCancel: false,
      actions: [
        { text: "CANCEL", func: (): void => setSystemNotif({ show: false }) },
        { text: "delete", func: (): void => deleteAccount() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const showAllNotes = (): void => {
    setMainTitle("All Notes");
    setFolders([]);
    setNotes(allData.notes);
    setMenu(false);
  };

  const showAllLocked = (): void => {
    const lockedNotes = allData.notes.filter((aNote) => aNote.locked);
    setMainTitle("Locked Notes");
    setFolders([]);
    setNotes(lockedNotes);
    setMenu(false);
  };

  const deleteAccount = (): void => {
    setSystemNotif({ show: false });
    try {
      deleteUser(token)
        .then((res) => {
          console.log(res);
          setUser(null);
          setToken(null);
          localStorage.removeItem("signedup");
          localStorage.removeItem("authToken");
          localStorage.removeItem("pin");
        })
        .catch((err) => {
          console.log(err);
          const newError = {};
        });
    } catch (err) {
      console.log(err);
      const newError = {};
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
        onClick={() => setMenu(false)}
      ></motion.div>
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed flex flex-col justify-between z-40 left-0 top-0 bottom-0 w-[80%] lg:w-[30%] p-5 bg-slate-900 rounded-r-md overflow-y-auto no-scroll-bar"
      >
        <div className="mb-10">
          <h1 className="text-3xl">{user.username}</h1>
          <button
            onClick={() => showAllNotes()}
            className="p-3 rounded-md shadow-md my-3 bg-slate-700 w-full flex justify-between items-center hover:bg-slate-800 duration-200"
          >
            <p>All Notes</p>
            <p>{allData?.notes?.length}</p>
          </button>
          <button
            onClick={() => showAllLocked()}
            className="p-3 rounded-md shadow-md my-3 bg-slate-700 w-full flex justify-between items-center hover:bg-slate-800 duration-200"
          >
            <p>Locked Notes</p>
            <p>{allData?.notes?.filter((note) => note.locked).length}</p>
          </button>
          <button className="p-3 rounded-md shadow-md my-3 bg-slate-700 w-full flex justify-between items-center hover:bg-slate-800 duration-200">
            <p>Shared Notes</p>
            <FaShareAlt className="text-amber-300" />
          </button>
          <button className="p-3 rounded-md shadow-md my-3 bg-slate-700 w-full flex justify-between items-center hover:bg-slate-800 duration-200">
            <p>Trash Notes</p>
            <p>0</p>
          </button>
          <p className="text-2xl my-5">Folders</p>
          <Tree
            moving={false}
            folders={allData.folders}
            parentId={null}
            level={0}
            open={{ item: { title: null } }}
          />
          <button
            onClick={() => navigate("/newfolder")}
            className="p-2 mt-3 rounded-md bg-amber-300 text-black shadow-md hover:bg-amber-200 duration-200"
          >
            Create Folder +
          </button>
        </div>
        <div>
          <button
            onClick={() => setSettings(true)}
            className="p-2 rounded-md shadow-md bg-emerald-300 text-black w-full hover:bg-emerald-200 duration-200"
          >
            Settings
          </button>
          <button
            onClick={() => confirmLogout()}
            className="p-2 rounded-md shadow-md bg-amber-300 my-3 text-black w-full hover:bg-amber-200 duration-200"
          >
            Logout &rarr;
          </button>
          <button
            onClick={() => confirmDeleteAccount()}
            className="p-2 rounded-md shadow-md bg-red-300 w-full hover:bg-red-200 duration-200"
          >
            Delete Account
          </button>
        </div>
      </motion.div>
      ;
    </>
  );
};

export default Menu;
