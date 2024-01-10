import { useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserContext from "@renderer/contexxt/UserContext";

const SystemNotif = (): JSX.Element => {
  const { systemNotif, setSystemNotif } = useContext(UserContext);

  const notifTimeoutRef = useRef(null);

  const handleDrag = (e) => {
    const end = e.clientX;
    const minDistance = window.innerWidth / 1.4;
    if (end > minDistance) {
      setSystemNotif({ show: false });
    }
  };

  useEffect(() => {
    if (systemNotif.show === true && systemNotif.hasCancel === false) {
      notifTimeoutRef.current = setTimeout(() => {
        setSystemNotif({ show: false });
      }, 5000);
    } else {
      clearTimeout(notifTimeoutRef.current);
    }

    return () => {
      clearTimeout(notifTimeoutRef.current);
    };
  }, [systemNotif, setSystemNotif]);

  return (
    <AnimatePresence>
      {systemNotif.show && (
        <>
          <div
            onClick={() => setSystemNotif({ show: false })}
            className="fixed bg-transparent inset-0 z-40"
          ></div>
          <motion.div
            drag="x"
            dragSnapToOrigin={true}
            onDragEnd={handleDrag}
            initial={{ y: -50, opacity: 0 }}
            exit={{ x: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-10 z-[999] p-3  pb-0 rounded-md shadow-md bg-slate-700 w-[90vw] left-[5vw] max-w-[400px]"
            onPointerDown={() =>
              !systemNotif.hasCancel ? setSystemNotif({ ...systemNotif, hasCancel: true }) : null
            }
          >
            {!systemNotif.hasCancel && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: "100%",
                  transition: { duration: 5 }
                }}
                className="absolute top-0 left-0 min-h-[4px] bg-cyan-300 rounded-full"
              ></motion.div>
            )}
            <div
              className={`absolute top-0 left-0 bottom-0 ${systemNotif.color} w-[5px] rounded-md`}
            ></div>
            <p className="text-lg font-semibold">{systemNotif.title}</p>
            <p className="text-xs whitespace-pre-line">{systemNotif.text}</p>
            <div className="mt-3 p-1 border-t flex justify-between items-center">
              {systemNotif.actions?.map((action, index) => (
                <div
                  key={index}
                  onClick={() => action.func()}
                  className="cursor-pointer hover:text-slate-300 duration-200"
                >
                  <p className="text-sm font-semibold">{action.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SystemNotif;
