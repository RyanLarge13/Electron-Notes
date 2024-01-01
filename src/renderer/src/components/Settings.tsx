import UserContext from "@renderer/contexxt/UserContext";
import { motion } from "framer-motion";
import { useContext } from "react";

const Settings = (): JSX.Element => {
  const { setSettings, userPreferences, setUserPreferences } = useContext(UserContext);

  const setDarkModeTheme = (): void => {
    const newPreferences = {
      ...userPreferences,
      darkMode: !userPreferences.darkMode
    };
    localStorage.setItem("preferences", JSON.stringify(newPreferences));
    setUserPreferences(newPreferences);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-40 inset-0 bg-black backdrop-blur-sm bg-opacity-20"
        onClick={() => setSettings(false)}
      ></motion.div>
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed flex flex-col justify-between z-40 right-0 top-0 bottom-0 w-[80%] lg:w-[30%] p-5 bg-slate-900 rounded-r-md overflow-y-auto no-scroll-bar"
      >
        <button onClick={() => setDarkModeTheme()}>
          {userPreferences.darkMode ? "Light mode" : "Dark mode"}
        </button>
      </motion.div>
    </>
  );
};

export default Settings;
