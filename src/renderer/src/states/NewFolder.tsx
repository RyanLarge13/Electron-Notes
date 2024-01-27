import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaLockOpen } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { createNewFolder } from "@renderer/utils/api";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import Colors from "@renderer/components/Colors";
import UserContext from "@renderer/contexxt/UserContext";

const NewFolder = (): JSX.Element => {
  const { folder, token, setAllData, setSelectedFolder, selectedFolder, setSystemNotif } =
    useContext(UserContext);

  const navigate = useNavigate();

  const [color, setColor] = useState(selectedFolder ? selectedFolder.color : "bg-amber-300");
  const [title, setTitle] = useState(selectedFolder ? selectedFolder.foldertitle : "");
  const [lock, setLock] = useState(selectedFolder ? selectedFolder.locked : false);
  const [loading, setLoading] = useState(false);

  const createFolder = (e): void => {
    e.preventDefault();
    setLoading(true);
    const tempId = uuidv4();
    const newFolder = {
      title: title,
      color: color,
      parentFolderId: selectedFolder ? selectedFolder.folderid : folder ? folder.folderid : null
    };
    setAllData((prevData) => {
      const newFolders = [...prevData.folders, { ...newFolder, folderid: tempId }];
      const newData = { ...prevData, folders: newFolders };
      return newData;
    });
    navigate("/");
    createNewFolder(token, newFolder)
      .then(() => {
        const newSuccess = {
          show: true,
          title: "New Folder",
          text: "Your new folder was successfully created!!",
          color: "bg-green-300",
          hasCancel: false,
          actions: [
            { text: "close", func: () => setSystemNotif({ show: false }) },
            { text: "undo", func: () => {} }
          ]
        };
        setSystemNotif(newSuccess);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setAllData((prevData) => {
          const newFolders = prevData.folders.filter((fold) => fold.folderid !== tempId);
          const newData = {
            ...prevData,
            folders: newFolders
          };
          return newData;
        });
        if (err.response) {
          const newError = {
            show: true,
            title: "Issues Creating Folder",
            text: err.response.message,
            color: "bg-red-300",
            hasCancel: true,
            actions: [
              { text: "close", func: () => setSystemNotif({ show: false }) },
              {
                text: "open note",
                func: () => {
                  setSystemNotif({ show: false });
                  navigate("/newfolder");
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]
          };
          setSystemNotif(newError);
        }
        if (err.request) {
          const newError = {
            show: true,
            title: "Network Error",
            text: "Our application was not able to reach the server, please check your internet connection and try again",
            color: "bg-red-300",
            hasCancel: true,
            actions: [
              { text: "close", func: () => setSystemNotif({ show: false }) },
              {
                text: "open note",
                func: () => {
                  setSystemNotif({ show: false });
                  navigate("/newfolder");
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]
          };
          setSystemNotif(newError);
        }
      });
  };

  return (
    <>
      <div
        className="fixed z-40 inset-0 bg-black bg-opacity-10 backdrop-blur-sm"
        onClick={() => {
          navigate("/");
          setSelectedFolder(null);
        }}
      ></div>
      <motion.section
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-10 z-40 right-10 left-10 max-w-[500px] bg-slate-900 p-5 rounded-md shadow-md"
      >
        <div
          className={`absolute top-0 right-0 ${color} w-[25%] h-3 rounded-bl-md rounded-tr-md`}
        ></div>
        <p>Create a new folder</p>
        <form onSubmit={createFolder}>
          <input
            placeholder="title"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus:outline-none p-2 text-xl text-white bg-transparent"
          />
        </form>
        <Colors setColor={setColor} />
        <button
          onClick={(e) => createFolder(e)}
          className="mt-5 py-2 px-3 rounded-md shadow-md bg-amber-300 text-black font-bold"
        >
          {loading ? (
            <div className="w-20">
              <ClipLoader color="#000" size={15} />
            </div>
          ) : (
            "Create Folder"
          )}
        </button>
        <button onClick={() => setLock((prev) => !prev)} className="absolute bottom-5 right-5">
          {!lock ? <FaLockOpen /> : <FaLock className="text-amber-300" />}
        </button>
      </motion.section>
    </>
  );
};

export default NewFolder;
