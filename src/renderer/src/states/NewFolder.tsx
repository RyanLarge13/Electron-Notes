import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaLockOpen } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { createNewFolder } from "@renderer/utils/api";
import Colors from "@renderer/components/Colors";
import UserContext from "@renderer/contexxt/UserContext";
import { findFolder } from "@renderer/utils/helpers";

const NewFolder = (): JSX.Element => {
  const { folder, token, setAllData, setSelectedFolder, selectedFolder } = useContext(UserContext);

  const navigate = useNavigate();

  const [color, setColor] = useState(selectedFolder ? selectedFolder.color : "bg-amber-300");
  const [title, setTitle] = useState(selectedFolder ? selectedFolder.foldertitle : "");
  const [lock, setLock] = useState(selectedFolder ? selectedFolder.locked : false);

  const createFolder = (e): void => {
    e.preventDefault();
    const newFolder = {
      title: title,
      color: color,
      parentFolderId: selectedFolder ? selectedFolder.folderid : folder ? folder.folderid : null
    };
    createNewFolder(token, newFolder)
      .then((res) => {
        setAllData((prevData) => {
          const resFolder = res.data.data[0];
          const folderToPush = {
            folderid: resFolder.folderid,
            title: resFolder.foldertitle,
            color: resFolder.foldercolor,
            parentFolderId: resFolder.parentfolderid
          };
          const newData = {
            ...prevData,
            folders: [...prevData.folders, folderToPush]
          };
          return newData;
        });
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("Finished");
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
          Create &rarr;
        </button>
        <button onClick={() => setLock((prev) => !prev)} className="absolute bottom-5 right-5">
          {!lock ? <FaLockOpen /> : <FaLock className="text-amber-300" />}
        </button>
      </motion.section>
    </>
  );
};

export default NewFolder;
