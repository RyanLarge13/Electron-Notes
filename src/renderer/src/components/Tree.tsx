import { useState, useContext } from "react";
import { motion } from "framer-motion";
import UserContext from "@renderer/contexxt/UserContext";
import { BsArrowsExpand } from "react-icons/bs";
import { PiArrowsInLineVertical } from "react-icons/pi";
import { Folder } from "@renderer/types/types";

type TreeProps = {
  moving: boolean;
  folders: Folder[];
  parentId: string;
  level: number;
  open: {
    item: {
      title: string | null;
    };
  };
};

const NestedFolder = ({ moving, folders, parentId, level, open }: TreeProps): JSX.Element => {
  return <Tree moving={moving} folders={folders} parentId={parentId} level={level} open={open} />;
};

const Tree = ({ moving, folders, parentId, level, open }: TreeProps): JSX.Element => {
  const { setFolder, setSelectedFolder, userPreferences } = useContext(UserContext);

  const childFolders = folders.filter((fold) => fold.parentFolderId !== parentId);
  const topFolders = folders.filter((fold) => fold.parentFolderId === parentId);

  const [folderStates, setFolderStates] = useState({});
  const [dragging, setDragging] = useState(false);

  const toggleNested = (e, folderId: string): void => {
    e.stopPropagation();
    setFolderStates((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleMouseEnter = (e, folderId): void => {
    setTimeout(() => {}, 1000);
  };

  const handleDragStart = (e, folderId): void => {
    e.stopPropagation();
    setDragging(true);
    if (folderStates[folderId]) {
      toggleNested(e, folderId);
    }
  };

  const handleDrag = (e): void => {
    e.stopPropagation();
  };

  const handleDragEnd = (e): void => {
    e.stopPropagation();
    setDragging(false);
  };

  return (
    <>
      {topFolders.length > 0 && (
        <>
          {topFolders.map((fold) => (
            <motion.div
              key={fold.folderid}
              drag={true}
              onDragStart={(e) => handleDragStart(e, fold.folderid)}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              dragSnapToOrigin={true}
              dragConstraints={{ left: 0, right: 0 }}
              onMouseEnter={(e) => handleMouseEnter(e, fold.folderid)}
              whileDrag={{
                boxShadow: `0px 0px 4px 1px rgba(255,255,255,0.75)`,
                zIndex: 1000
              }}
              style={{ marginLeft: level * 5 }}
              className={`w-full relative py-2 px-3 rounded-md ${
                userPreferences.darkMode
                  ? "bg-[#333] hover:bg-[#444]"
                  : "bg-slate-200 hover:bg-slate-300"
              } duration-200 my-2 cursor-pointer shadow-md`}
              onClick={(e) => {
                e.stopPropagation();
                if (dragging) {
                  return;
                }
                moving ? setSelectedFolder(fold) : setFolder(fold);
              }}
            >
              <div
                aria-hidden="true"
                className={`${fold.color} absolute left-0 bottom-0 top-0 w-1 rounded-md`}
              ></div>
              <div className="flex justify-between items-center">
                <p className="">{fold.title}</p>
                {open.item.title !== fold.title && (
                  <button className="p-2" onClick={(e) => toggleNested(e, fold.folderid)}>
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
                    folders={childFolders}
                    parentId={fold.folderid}
                    level={level + 1}
                    open={open}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </>
      )}
    </>
  );
};

export default Tree;
