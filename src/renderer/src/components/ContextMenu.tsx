import { useContext } from "react";
import UserContext from "@renderer/contexxt/UserContext";

const ContextMenu = () => {
  const { contextMenu, position, setContextMenu } = useContext(UserContext);

  return (
    <>
      {contextMenu.show && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setContextMenu({ show: false })}></div>
          <div
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            className="fixed bg-slate-700 z-50 flex flex-col justify-start items-start w-60"
          >
            <div className={`${contextMenu.meta.color} w-full h-1`}></div>
            <p className="p-2 font-semibold">{contextMenu.meta.title && contextMenu.meta.title}</p>
            {contextMenu.options.map((option) => (
              <button
                key={option.title}
                className="px-2 py-1 text-sm hover:bg-slate-500 w-full text-left"
                onClick={() => option.func()}
              >
                {option.title}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ContextMenu;
