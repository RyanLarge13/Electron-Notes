import { useContext } from "react";
import UserContext from "@renderer/contexxt/UserContext";
import { ContextMenuOption } from "@renderer/types/types";

const ContextMenu = (): JSX.Element => {
  const { setContextMenu, contextMenu, position, userPreferences } = useContext(UserContext);

  return (
    <>
      {contextMenu.show && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() =>
              setContextMenu({ show: false, meta: { title: "", color: "" }, options: [] })
            }
          ></div>
          <div
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            className={`fixed ${
              userPreferences.darkMode ? "bg-[#555]" : "bg-slate-200"
            } z-50 flex flex-col justify-start items-start w-60 shadow-md`}
          >
            <div className={`${contextMenu.meta.color} w-full h-1`}></div>
            <p className="p-2 font-semibold">{contextMenu.meta.title && contextMenu.meta.title}</p>
            {contextMenu.options.map((option: ContextMenuOption) => (
              <button
                key={option.title}
                className={`px-2 py-1 text-sm w-full text-left flex justify-between items-center ${
                  userPreferences.darkMode ? "hover:bg-slate-500" : "hover:bg-slate-300"
                }`}
                onClick={() => option.func()}
              >
                <p>{option.title}</p>
                <p className="text-xs text-slate-200">{option.icon}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ContextMenu;
