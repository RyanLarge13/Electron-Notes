import { useState, useContext } from "react";
import UserContext from "@renderer/contexxt/UserContext";
import { BsArrowsExpand } from "react-icons/bs";
import { PiArrowsInLineVertical } from "react-icons/pi";
import { Folder } from "@renderer/types/types";

const NestedFolder = ({ moving, childFolders, parentId, level, open }) => {
  return (
    <TreeSelect
      moving={moving}
      folders={childFolders}
      parentId={parentId}
      level={level}
      open={open}
    />
  );
};

const TreeSelect = ({ moving, folders, parentId, level, open }) => {
  const { setFolder, setSelectedFolder } = useContext(UserContext);

  const childFolders = folders.filter((fold) => fold.parentFolderId !== parentId);
  const topFolders = folders.filter((fold) => fold.parentFolderId === parentId);

  const [folderStates, setFolderStates] = useState({});

  const toggleNested = (e, folderId: string): void => {
    e.stopPropagation();
    setFolderStates((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <>
      {topFolders.length > 0 && (
        <>
          {topFolders.map((fold: Folder) => (
            <div
              key={fold.folderid}
              style={{ marginLeft: level * 5 }}
              className="w-full relative py-2 px-3 rounded-md bg-[#333] hover:bg-[#444] duration-200 my-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                moving
                  ? open.item.title === fold.title
                    ? null
                    : setSelectedFolder(fold)
                  : setFolder(() => {
                      console.log("Calling");
                      return fold;
                    });
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

export default TreeSelect;
