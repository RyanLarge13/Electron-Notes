import { useContext, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import UserContext from "@renderer/contexxt/UserContext";
import Colors from "./Colors";
import { updatePassword, updateUsername } from "@renderer/utils/api";

const Settings = (): JSX.Element => {
  const {
    setSettings,
    userPreferences,
    setUserPreferences,
    setSystemNotif,
    token,
    setToken,
    setUser
  } = useContext(UserContext);

  const [username, setUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [lockPin, setLockPin] = useState(false);
  const [newLockPin, setNewLockPin] = useState({ first: "", second: "", third: "", fourth: "" });
  const [createNewPin, setCreateNewPin] = useState(false);
  const [theme, setTheme] = useState(userPreferences.theme);
  const [newTheme, setNewTheme] = useState(
    userPreferences.theme ? userPreferences.theme : "bg-amber-300"
  );
  const [confirmOps, setConfirmOps] = useState(userPreferences.confirm);

  const firstInput = useRef(null);
  const secondInput = useRef(null);
  const thirdInput = useRef(null);
  const fourthInput = useRef(null);

  useEffect(() => {
    if (userPreferences.theme) {
      setTheme(true);
    }
  }, []);

  useEffect(() => {
    if (!theme) {
      const newPreferences = {
        ...userPreferences,
        theme: false
      };
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
    }
    if (theme) {
      if (newTheme) {
        const newPreferences = {
          ...userPreferences,
          theme: newTheme
        };
        localStorage.setItem("preferences", JSON.stringify(newPreferences));
        setUserPreferences(newPreferences);
      }
    }
  }, [theme, newTheme]);

  useEffect(() => {
    if (lockPin && firstInput.current) {
      firstInput.current.focus();
    }
  }, [lockPin]);

  useEffect(() => {
    if (newLockPin.fourth !== "") {
      if (createNewPin) {
        return createANewPin();
      }
      checkCurrentPin();
    }
  }, [newLockPin.fourth, createNewPin]);

  const setDarkModeTheme = (): void => {
    const newPreferences = {
      ...userPreferences,
      darkMode: !userPreferences.darkMode
    };
    localStorage.setItem("preferences", JSON.stringify(newPreferences));
    setUserPreferences(newPreferences);
  };

  const checkCurrentPin = () => {
    const currentPin = userPreferences.lockPin;
    console.log(newLockPin);
    if (
      currentPin[0] === Number(newLockPin.first) &&
      currentPin[1] === Number(newLockPin.second) &&
      currentPin[2] === Number(newLockPin.third) &&
      currentPin[3] === Number(newLockPin.fourth)
    ) {
      setNewLockPin({ first: "", second: "", third: "", fourth: "" });
      return setCreateNewPin(true);
    }
    const newError = {
      show: true,
      title: "Invalid Pin",
      text: "Enter your current valid pin to change it",
      color: "bg-red-300",
      hasCancel: false,
      actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
    };
    setSystemNotif(newError);
    setNewLockPin({ first: "", second: "", third: "", fourth: "" });
    firstInput.current.focus();
  };

  const createANewPin = (): void => {
    const newPinArr = [
      Number(newLockPin.first),
      Number(newLockPin.second),
      Number(newLockPin.third),
      Number(newLockPin.fourth)
    ];
    const newPreferences = {
      ...userPreferences,
      lockPin: newPinArr
    };
    localStorage.setItem("preferences", JSON.stringify(newPreferences));
    setUserPreferences(newPreferences);
    setLockPin(false);
    setCreateNewPin(false);
    const newConfirmation = {
      show: true,
      title: "New Lock Pin",
      text: "Your new lock pin was created, don't forget this pin or you wont be able to view your locked notes",
      color: "bg-green-300",
      hasCancel: true,
      actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
    };
    setSystemNotif(newConfirmation);
  };

  const handlePinInput = (e, level): void => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    if (level === "first") {
      setNewLockPin((prev) => {
        return { ...prev, first: newValue };
      });
      secondInput.current.focus();
    }
    if (level === "second") {
      setNewLockPin((prev) => {
        return { ...prev, second: newValue };
      });
      thirdInput.current.focus();
    }
    if (level === "third") {
      setNewLockPin((prev) => {
        return { ...prev, third: newValue };
      });
      fourthInput.current.focus();
    }
    if (level === "fourth") {
      setNewLockPin((prev) => {
        return { ...prev, fourth: newValue };
      });
    }
  };

  const changeUsername = async (e): Promise<void> => {
    e.preventDefault();
    try {
      updateUsername(newUsername, token)
        .then((res) => {
          console.log(res);
          const newToken = res.data.data.token;
          const newUser = res.data.data.user;
          localStorage.setItem("authToken", newToken);
          setUser(newUser);
          setUsername(false);
          setNewUsername("");
          const newSuccess = {
            show: true,
            title: "New Username",
            text: `Your new username is now ${newUser.username}`,
            color: "bg-green-300",
            hasCancel: false,
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
          };
          setSystemNotif(newSuccess);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const changePass = async (e): Promise<void> => {
    e.preventDefault();
    try {
      updatePassword(currentPass, newPass, token)
        .then((res) => {
          console.log(res);
          setToken(null);
          setUser(null);
          localStorage.removeItem("signedup");
          localStorage.removeItem("authToken");
          localStorage.removeItem("pin");
          const newSuccess = {
            show: true,
            title: "Password updated",
            text: "Be sure to write down your new password so you do not forget it. An email was sent to you containing your new credentials. Please log back in to your account with your new credentials",
            color: "bg-green-300",
            hasCancel: true,
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
          };
          setSystemNotif(newSuccess);
        })
        .catch((err) => {
          console.log(err);
          const newError = {
            show: true,
            title: "Updating Password",
            text: err.response.data.message,
            color: "bg-red-300",
            hasCancel: true,
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
          };
          setSystemNotif(newError);
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Updating Password",
        text: "There was a problem updating your password. Please try refreshing or checking your internet connection before trying again",
        color: "bg-red-300",
        hasCancel: true,
        actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
      };
      setSystemNotif(newError);
    }
  };

  const confirmChangeOperation = (): void => {
    const newConfirmation = {
      show: true,
      title: "Are You Sure?",
      text: "When you turn off this functionality you will NOT be prompted before completing any delete, logout, move, or other operations on your data. Are you sure you want to turn this functionality off? Once data is deleted you can not get it back",
      color: "bg-red-300",
      hasCancel: true,
      actions: [
        { text: "CANCEL", func: () => setSystemNotif({ show: false }) },
        { text: "confirm", func: () => changeConfirmationOnOperations() }
      ]
    };
    setSystemNotif(newConfirmation);
  };

  const changeConfirmationOnOperations = (): void => {
    setConfirmOps((prev) => !prev);
    const newPreferences = {
      ...userPreferences,
      confirm: !userPreferences.confirm
    };
    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
      setConfirmOps((prev) => !prev);
      const newError = {
        show: true,
        title: "Issues updating preferences",
        text: "Please contact the developer if this issue persists. We seemed to have a problem updating your preferences. Please close the application, reload it and try the operation again.",
        color: "bg-red-300",
        hasCancel: true,
        actions: [{ text: "cloese", func: () => setSystemNotif({ show: false }) }]
      };
      setSystemNotif(newError);
    }
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
        className="fixed no-scroll-bar flex flex-col justify-start z-40 right-0 top-0 bottom-0 w-[80%] lg:w-[30%] p-5 bg-slate-900 rounded-r-md overflow-y-auto no-scroll-bar"
      >
        <button
          onClick={() => setDarkModeTheme()}
          className="flex justify-between items-center my-3"
        >
          <p>Dark Mode</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                userPreferences.darkMode
                  ? "right-[1px] left-[50%] bg-green-200"
                  : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        <button
          onClick={() => setTheme((prev) => !prev)}
          className="flex justify-between items-center my-3"
        >
          <p>Theme</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                theme ? "right-[1px] left-[50%] bg-green-200" : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        {theme && (
          <div className="mb-3 pt-1 relative">
            <div
              className={`absolute top-0 right-0 left-0 h-1 rounded-full ${userPreferences.theme}`}
            ></div>
            <Colors setColor={setNewTheme} />
          </div>
        )}
        <button
          onClick={() => {
            confirmOps ? confirmChangeOperation() : changeConfirmationOnOperations();
          }}
          className="flex justify-between items-center my-3"
        >
          <p>Confirm Ops</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                confirmOps
                  ? "right-[1px] left-[50%] bg-green-200"
                  : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        <button
          onClick={() => setLockPin((prev) => !prev)}
          className="flex justify-between items-center my-3"
        >
          <p>Change Lock Pin</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                lockPin
                  ? "right-[1px] left-[50%] bg-green-200"
                  : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        {lockPin && (
          <form className="rounded-md shadow-md bg-slate-900 flex justify-start items-center gap-x-3">
            <input
              ref={firstInput}
              value={newLockPin.first}
              type="password"
              onChange={(e) => handlePinInput(e, "first")}
              className="w-8 h-8 p-3 bg-slate-700 text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
            />
            <input
              ref={secondInput}
              value={newLockPin.second}
              type="password"
              className="w-8 h-8 p-3 bg-slate-700 text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "second")}
            />
            <input
              ref={thirdInput}
              value={newLockPin.third}
              type="password"
              className="w-8 h-8 p-3 bg-slate-700 text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "third")}
            />
            <input
              ref={fourthInput}
              value={newLockPin.fourth}
              type="password"
              className="w-8 h-8 p-3 bg-slate-700 text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500 text-slate-300"
              onChange={(e) => handlePinInput(e, "fourth")}
            />
            {createNewPin ? (
              <div className="text-xs">
                <p>enter your new pin</p>
              </div>
            ) : (
              <div className="text-xs">
                <p>enter your current lock pin</p>
                <p>if you have not set one yet the default is 1234</p>
              </div>
            )}
          </form>
        )}
        <button
          onClick={() => setUsername((prev) => !prev)}
          className="flex justify-between items-center my-3"
        >
          <p>Update Username</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                username
                  ? "right-[1px] left-[50%] bg-green-200"
                  : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        {username && (
          <div className="mt-1">
            <form onSubmit={changeUsername}>
              <input
                type="username"
                placeholder="new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="text-sm p-2 bg-slate-700 text-white"
              />
            </form>
          </div>
        )}
        <button
          onClick={() => setPassword((prev) => !prev)}
          className="flex justify-between items-center my-3"
        >
          <p>Reset Password</p>
          <div className="ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer bg-slate-700">
            <div
              className={`absolute top-[1px] bottom-[1px] duration-200 ${
                password
                  ? "right-[1px] left-[50%] bg-green-200"
                  : "left-[1px] right-[50%] bg-red-200"
              } rounded-full`}
            ></div>
          </div>
        </button>
        {password && (
          <div className="mt-1">
            <form onSubmit={changePass} className="flex flex-col justify-start items-start gap-y-2">
              <input
                type="password"
                placeholder="current password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="text-sm p-2 bg-slate-700 text-white"
              />
              <input
                type="password"
                placeholder="new password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="text-sm p-2 bg-slate-700 text-white"
              />
              <button
                type="submit"
                className="bg-amber-300 text-sm w-[195px] text-black p-2 font-semibold duration-200 hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none"
              >
                Submit
              </button>
            </form>
          </div>
        )}
        <div className="flex flex-col justify-start items-start mt-3">
          <p className="mb-1">Short Cuts</p>
          {userPreferences.commands.map((command) => (
            <button
              key={command.text}
              className="flex justify-between w-full text-sm p-2 hover:bg-slate-700 duration-200 items-start"
            >
              <p>{command.text}</p>
              <p>{command.command}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default Settings;
