import { useState, useContext } from "react";
import UserContext from "@renderer/contexxt/UserContext";
import { BsArrowsExpand } from "react-icons/bs";
import { PiArrowsInLineVertical } from "react-icons/pi";

const NestedFolder = ({
  moving,
  setPickFolder,
  setSelectedFolder,
  childFolders,
  parentId,
  level,
  open
}) => {
  return (
    <Tree
      moving={moving}
      setPickFolder={setPickFolder}
      setSelectedFolder={setSelectedFolder}
      folders={childFolders}
      parentId={parentId}
      level={level}
      open={open}
    />
  );
};

const Tree = ({ moving, folders, parentId, level, open }) => {
  const { setFolder, setPickFolder, setSelectedFolder } = useContext(UserContext);

  const childFolders = folders.filter((fold) => fold.parentFolderId !== parentId);
  const topFolders = folders.filter((fold) => fold.parentFolderId === parentId);

  const [folderStates, setFolderStates] = useState({});

  const toggleNested = (folderId: string): void => {
    setFolderStates((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <>
      {topFolders.length > 0 && (
        <>
          {topFolders.map((fold) => (
            <div
              key={fold.folderid}
              style={{ marginLeft: level * 5 }}
              className="w-full relative py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-800 duration-200 my-2"
              onClick={() => {
                moving
                  ? open.item.title === fold.title
                    ? null
                    : setSelectedFolder(fold)
                  : setFolder(fold);
              }}
            >
              <div
                aria-hidden="true"
                className={`${fold.color} absolute left-0 bottom-0 top-0 w-1 rounded-md`}
              ></div>
              <div className="flex justify-between items-center">
                <p className="">{fold.title}</p>
                {open.item.title !== fold.title && (
                  <button className="" onClick={() => toggleNested(fold.folderid)}>
                    {folderStates[fold.folderid] ? (
                      <PiArrowsInLineVertical className="font-semibold" />
                    ) : (
                      <BsArrowsExpand className="text-sm" />
                    )}
                  </button>
                )}
              </div>
              <div className="">
                {folderStates[fold.folderid] && (
                  <NestedFolder
                    moving={moving}
                    setPickFolder={setPickFolder}
                    setSelectedFolder={setSelectedFolder}
                    childFolders={childFolders}
                    parentId={fold.folderid}
                    level={level + 1}
                    open={open}
                  />
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default Tree;
