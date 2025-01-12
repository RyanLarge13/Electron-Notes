import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { BiGrid } from "react-icons/bi";
import { CiGrid42 } from "react-icons/ci";
import { LuList } from "react-icons/lu";
import { ClipLoader } from "react-spinners";

import UserContext from "@renderer/contexxt/UserContext";
import { updatePassword, updateUsername } from "@renderer/utils/api";

import Colors from "./Colors";

const Settings = (): JSX.Element => {
  const {
    setSettings,
    setUserPreferences,
    setToken,
    setUser,
    setView,
    setOrder,
    setFilter,
    networkNotificationError,
    showSuccessNotification,
    showErrorNotification,
    view,
    order,
    filter,
    userPreferences,
    token,
    user
  } = useContext(UserContext);

  const [username, setUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [lockPin, setLockPin] = useState(false);
  const [newLockPin, setNewLockPin] = useState({ first: "", second: "", third: "", fourth: "" });
  const [createNewPin, setCreateNewPin] = useState(false);
  const [theme, setTheme] = useState(
    userPreferences.theme ? userPreferences.theme : "bg-amber-300"
  );
  const [newTheme, setNewTheme] = useState(
    userPreferences?.theme ? userPreferences?.theme : "bg-amber-300"
  );
  const [confirmOps, setConfirmOps] = useState(userPreferences?.confirm);
  const [notifyAll, setNotifyAll] = useState(userPreferences?.notify?.notifyAll);
  const [notifySuccess, setNotifySuccess] = useState(userPreferences?.notify?.notifySuccess);
  const [notifyErrors, setNotifyErrors] = useState(userPreferences?.notify?.notifyErrors);
  const [newPassLoading, setNewPassLoading] = useState(false);

  const [resizing, setResizing] = useState(false);
  const [settingsWidth, setSettingsWidth] = useState(userPreferences?.settingsWidth || 66);

  const firstInput = useRef(null);
  const secondInput = useRef(null);
  const thirdInput = useRef(null);
  const fourthInput = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!theme) {
      const newPreferences = {
        ...userPreferences,
        theme: ""
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

  useEffect(() => {
    const currentState = notifyAll;
    try {
      const newPreferences = {
        ...userPreferences,
        notify: {
          notifySuccess: !notifyAll ? false : notifySuccess,
          notifyErrors: !notifyAll ? false : notifyErrors,
          notifyAll: notifyAll
        }
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Error Updating Preferences",
        "There was an error with the application when trying to update notification preferences, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => setNotifyAll(currentState) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  }, [notifyAll]);

  useEffect(() => {
    const currentState = notifySuccess;
    try {
      const newPreferences = {
        ...userPreferences,
        notify: {
          ...userPreferences.notify,
          notifySuccess: notifySuccess
        }
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Error Updating Preferences",
        "There was an error with the application when trying to update notification preferences, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => setNotifyAll(currentState) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  }, [notifySuccess]);

  useEffect(() => {
    const currentState = notifyErrors;
    try {
      const newPreferences = {
        ...userPreferences,
        notify: {
          ...userPreferences.notify,
          notifyErrors: notifyErrors
        }
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Error Updating Preferences",
        "There was an error with the application when trying to update notification preferences, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => setNotifyAll(currentState) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  }, [notifyErrors]);

  useEffect(() => {
    const currentState = confirmOps;
    try {
      const newPreferences = {
        ...userPreferences,
        confirm: confirmOps
      };
      setUserPreferences(newPreferences);
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Error Updating Preferences",
        "There was an error with the application when trying to update notification preferences, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => setNotifyAll(currentState) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  }, [confirmOps]);

  const setDarkModeTheme = (): void => {
    const newPreferences = {
      ...userPreferences,
      darkMode: !userPreferences.darkMode
    };
    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Error Updating Preferences",
        "There was an error with the application when trying to update notification preferences, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => setNotifyAll(currentState) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  };

  const checkCurrentPin = (): void => {
    const currentPin = userPreferences.lockPin;
    if (
      currentPin[0] === Number(newLockPin.first) &&
      currentPin[1] === Number(newLockPin.second) &&
      currentPin[2] === Number(newLockPin.third) &&
      currentPin[3] === Number(newLockPin.fourth)
    ) {
      setNewLockPin({ first: "", second: "", third: "", fourth: "" });
      setCreateNewPin(true);
      return;
    }
    showErrorNotification("Invalid Pin", "Enter your current pin to change it", false, []);
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
    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
      setLockPin(false);
      setCreateNewPin(false);
      setNewLockPin({ first: "", second: "", third: "", fourth: "" });
      showSuccessNotification(
        "New Lock Pin",
        "Your new lock pin was created. Don't forget this pin or you wont be able to view your locked notes",
        true,
        []
      );
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Update Pin Failed",
        "There was an error with the application when trying to update your pin, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => createANewPin() },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
    setCreateNewPin(false);
    setNewLockPin({ first: "", second: "", third: "", fourth: "" });
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
    const prevUsername = user.username;
    setUser((prevUser) => {
      return { ...prevUser, username: newUsername };
    });
    setUsername(false);
    try {
      updateUsername(newUsername, token)
        .then((res) => {
          console.log(res);
          const newToken = res.data.data.token;
          localStorage.setItem("authToken", newToken);
          setNewUsername("");
          showSuccessNotification(
            "New Username",
            `Your new username is now ${newUsername}`,
            false,
            []
          );
        })
        .catch((err) => {
          console.log(err);
          setUser((prevUser) => {
            return { ...prevUser, username: prevUsername };
          });
          if (err.response) {
            showErrorNotification("Username Update Failed", err.response.message, true, [
              { text: "re-try", func: () => changeUsername(e) },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            if (userPreferences.notify.notifyAll && userPreferences.notify.notifyErrors) {
              networkNotificationError([
                { text: "re-try", func: () => changeUsername(e) },
                { text: "reload app", func: () => window.location.reload() }
              ]);
            }
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Update Username Failed",
        "There was an error with the application when trying to update your username, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [
          { text: "re-try", func: () => changeUsername(e) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
    }
  };

  const changePass = async (e): Promise<void> => {
    e.preventDefault();
    setNewPassLoading(true);
    try {
      updatePassword(currentPass, newPass, token)
        .then((res) => {
          console.log(res);
          setToken(null);
          setUser(null);
          localStorage.removeItem("signedup");
          localStorage.removeItem("authToken");
          localStorage.removeItem("pin");
          showSuccessNotification(
            "Password Update",
            "Be sure to write down your new password so you do not forget it. An email was sent to you containing your new credentials. Please log back in to your account with your new credentials",
            true,
            []
          );
          setNewPassLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            showErrorNotification("Password Update Failed", err.response.message, true, [
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            networkNotificationError([
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          setNewPassLoading(false);
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Update Password Failed",
        "There was an error with the application when trying to update your password, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [{ text: "reload app", func: () => window.location.reload() }]
      );
      setNewPassLoading(false);
    }
  };

  const setAutoSave = (): void => {
    const isAutoSave = userPreferences.autosave;
    const newPreferences = {
      ...userPreferences,
      autosave: !isAutoSave
    };
    try {
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Auto Save Change Failed",
        "There was an error with the application when trying to update your settings, please try again. \n If the issue persists please contact the developer at ryanlarge@ryanlarge.dev",
        true,
        [{ text: "reload app", func: () => window.location.reload() }]
      );
    }
  };

  const handleResizeWidth = (e): void => {
    e.stopPropagation();
    if (settingsRef && settingsRef.current) {
      e.target.setPointerCapture(e.pointerId);
      setResizing(true);
      const percentagePointer = (e.pageX / window.innerWidth) * 100;
      setSettingsWidth(percentagePointer);
    }
  };

  const handleResizeWidthMove = (e): void => {
    e.stopPropagation();
    if (settingsRef && settingsRef.current && resizing) {
      const percentagePointer = (e.pageX / window.innerWidth) * 100;
      setSettingsWidth(percentagePointer);
    }
  };

  const handleResizeWidthUp = (e): void => {
    e.target.releasePointerCapture(e.pointerId);
    setResizing(false);
    setUserPreferences((prev) => {
      return { ...prev, settingsWidth: settingsWidth };
    });

    localStorage.setItem(
      "preferences",
      JSON.stringify({ ...userPreferences, settingsWidth: settingsWidth })
    );
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
        ref={settingsRef}
        initial={{ opacity: 0, left: `${settingsWidth}%` }}
        animate={{
          opacity: 1,
          transition: { duration: resizing ? 0 : 0.25 },
          left: `${settingsWidth}%`
        }}
        className={`fixed z-40 right-0 top-0 bottom-0 ${
          userPreferences.darkMode ? "bg-[#222]" : "bg-slate-200"
        } rounded-r-md`}
      >
        <div
          className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} absolute left-0 touch-none top-[50%] translate-y-[-50%] w-1 h-20 rounded-full cursor-grab`}
          onPointerDown={handleResizeWidth}
          onPointerMove={handleResizeWidthMove}
          onPointerUp={handleResizeWidthUp}
        ></div>
        <div className="no-scroll-bar h-full flex flex-col justify-start p-5 overflow-y-auto">
          <button
            onClick={() => setDarkModeTheme()}
            className="flex justify-between items-center my-3"
          >
            <p>Dark Mode</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  userPreferences.darkMode
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          <button
            onClick={() => {
              const newPreferences = {
                ...userPreferences,
                layout: view === "list" ? "masonry" : view === "masonry" ? "grid" : "list"
              };
              localStorage.setItem("preferences", JSON.stringify(newPreferences));
              setUserPreferences(newPreferences);
              setView((prevView) =>
                prevView === "list" ? "masonry" : view === "masonry" ? "grid" : "list"
              );
            }}
            className="flex justify-between items-center my-3"
          >
            <p>View</p>
            <div
              className={`ml-3 flex justify-center gap-x-3 px-3 items-center relative text-xl h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <LuList className={`${view === "list" ? "text-green-300" : "text-red-300"}`} />
              <BiGrid className={`${view === "grid" ? "text-green-300" : "text-red-300"}`} />
              <CiGrid42 className={`${view === "masonry" ? "text-green-300" : "text-red-300"}`} />
            </div>
          </button>
          <button
            onClick={() => {
              const newPreferences = {
                ...userPreferences,
                order: order ? false : true
              };
              localStorage.setItem("preferences", JSON.stringify(newPreferences));
              setUserPreferences(newPreferences);
              setOrder((prev) => !prev);
            }}
            className="flex justify-between items-center my-3"
          >
            <p>Order</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  userPreferences.order
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          <div
            className={`${
              userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
            } p-2 rounded-md my-5`}
          >
            <div className="flex justify-between items-center w-full">
              <p className="font-semibold">Sort By</p>
            </div>
            <div className="pl-5">
              <button
                onClick={() => {
                  const newPreferences = {
                    ...userPreferences,
                    filter: "Title"
                  };
                  localStorage.setItem("preferences", JSON.stringify(newPreferences));
                  setUserPreferences(newPreferences);
                  setFilter("Title");
                }}
                className="flex justify-between items-center my-3 w-full"
              >
                <p>Sort by Title</p>
                <div
                  className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                    userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-[1px] bottom-[1px] duration-200 ${
                      filter === "Title"
                        ? "right-[1px] left-[50%] bg-green-300"
                        : "left-[1px] right-[50%] bg-red-300"
                    } rounded-full`}
                  ></div>
                </div>
              </button>
              <button
                onClick={() => {
                  const newPreferences = {
                    ...userPreferences,
                    filter: "Date"
                  };
                  localStorage.setItem("preferences", JSON.stringify(newPreferences));
                  setUserPreferences(newPreferences);
                  setFilter("Date");
                }}
                className="flex justify-between items-center my-3 w-full"
              >
                <p>Sort By Date</p>
                <div
                  className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                    userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-[1px] bottom-[1px] duration-200 ${
                      filter === "Date"
                        ? "right-[1px] left-[50%] bg-green-300"
                        : "left-[1px] right-[50%] bg-red-300"
                    } rounded-full`}
                  ></div>
                </div>
              </button>
              <button
                onClick={() => {
                  const newPreferences = {
                    ...userPreferences,
                    filter: "Updated"
                  };
                  localStorage.setItem("preferences", JSON.stringify(newPreferences));
                  setUserPreferences(newPreferences);
                  setFilter("Updated");
                }}
                className="flex justify-between items-center my-3 w-full"
              >
                <p>Sort by Updated</p>
                <div
                  className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                    userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-[1px] bottom-[1px] duration-200 ${
                      filter === "Updated"
                        ? "right-[1px] left-[50%] bg-green-300"
                        : "left-[1px] right-[50%] bg-red-300"
                    } rounded-full`}
                  ></div>
                </div>
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              setTheme((prev) => {
                if (prev !== "") {
                  return "";
                }
                return "bg-amber-300";
              })
            }
            className="flex justify-between items-center my-5"
          >
            <p>Theme</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  theme
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
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
          <button onClick={() => setAutoSave()} className="flex justify-between items-center my-3">
            <p>Auto Save Notes</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  userPreferences.autosave
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          <button
            onClick={() => setConfirmOps((prev) => !prev)}
            className="flex justify-between items-center my-3"
          >
            <p>Confirm Ops</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  confirmOps
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          <button
            onClick={() => setLockPin((prev) => !prev)}
            className="flex justify-between items-center my-3"
          >
            <p>Change Lock Pin</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  lockPin
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          {lockPin && (
            <form
              className={`${userPreferences.darkMode ? "bg-slate-900" : "bg-slate-200"} flex justify-start items-center gap-x-3`}
            >
              <input
                ref={firstInput}
                value={newLockPin.first}
                type="password"
                onChange={(e) => handlePinInput(e, "first")}
                className={`w-10 h-10 p-3 ${
                  userPreferences.darkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-300 text-slate-700"
                } text-xl text-center font-semibold rounded-md shadow-sm outline ${userPreferences.theme ? userPreferences.theme.replace("bg", "outline") : "outline-slate-500"}`}
              />
              <input
                ref={secondInput}
                value={newLockPin.second}
                type="password"
                className={`w-10 h-10 p-3 ${
                  userPreferences.darkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-300 text-slate-700"
                } text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
                onChange={(e) => handlePinInput(e, "second")}
              />
              <input
                ref={thirdInput}
                value={newLockPin.third}
                type="password"
                className={`w-10 h-10 p-3 ${
                  userPreferences.darkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-300 text-slate-700"
                } text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
                onChange={(e) => handlePinInput(e, "third")}
              />
              <input
                ref={fourthInput}
                value={newLockPin.fourth}
                type="password"
                className={`w-10 h-10 p-3 ${
                  userPreferences.darkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-300 text-slate-700"
                } text-xl text-center font-semibold rounded-md shadow-sm outline outline-slate-500`}
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
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  username
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
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
                  className={`text-sm p-2 w-full rounded-sm ${userPreferences.darkMode ? "bg-slate-700 text-white" : "bg-slate-300 text-black"}`}
                />
              </form>
            </div>
          )}
          <button
            onClick={() => setPassword((prev) => !prev)}
            className="flex justify-between items-center my-3"
          >
            <p>Reset Password</p>
            <div
              className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-[1px] bottom-[1px] duration-200 ${
                  password
                    ? "right-[1px] left-[50%] bg-green-300"
                    : "left-[1px] right-[50%] bg-red-300"
                } rounded-full`}
              ></div>
            </div>
          </button>
          {password && (
            <div className="mt-1 mb-3">
              <form
                onSubmit={changePass}
                className="flex flex-col justify-start items-start gap-y-2"
              >
                <input
                  type="password"
                  placeholder="current password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className={`text-sm p-2 w-full rounded-sm ${userPreferences.darkMode ? "bg-slate-700 text-white" : "bg-slate-300 text-black"}`}
                />
                <input
                  type="password"
                  placeholder="new password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className={`text-sm p-2 w-full rounded-sm ${userPreferences.darkMode ? "bg-slate-700 text-white" : "bg-slate-300 text-black"}`}
                />
                <button
                  type="submit"
                  className={`${userPreferences.theme ? userPreferences.theme : "bg-amber-300"} rounded-sm text-sm w-[195px] text-black p-2 font-semibold duration-200`}
                >
                  {newPassLoading ? <ClipLoader size={18} /> : "Submit"}
                </button>
              </form>
            </div>
          )}
          <div
            className={`${
              userPreferences.darkMode ? "bg-[#333]" : "bg-slate-300"
            } p-2 rounded-md my-5`}
          >
            <button
              onClick={() => setNotifyAll((prev) => !prev)}
              className="flex justify-between items-center w-full"
            >
              <p className="font-semibold">In App Notifications</p>
              <div
                className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                  userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-[1px] bottom-[1px] duration-200 ${
                    notifyAll
                      ? "right-[1px] left-[50%] bg-green-300"
                      : "left-[1px] right-[50%] bg-red-300"
                  } rounded-full`}
                ></div>
              </div>
            </button>
            <div className="pl-5">
              <button
                onClick={() => setNotifySuccess((prev) => !prev)}
                className="flex justify-between items-center my-3 w-full"
              >
                <p>Success Prompts</p>
                <div
                  className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                    userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-[1px] bottom-[1px] duration-200 ${
                      notifyAll && notifySuccess
                        ? "right-[1px] left-[50%] bg-green-300"
                        : "left-[1px] right-[50%] bg-red-300"
                    } rounded-full`}
                  ></div>
                </div>
              </button>
              <button
                onClick={() => setNotifyErrors((prev) => !prev)}
                className="flex justify-between items-center my-3 w-full"
              >
                <p>Error Prompts</p>
                <div
                  className={`ml-3 flex justify-center items-center relative w-[50px] h-[25px] shadow-md rounded-full cursor-pointer ${
                    userPreferences.darkMode ? "bg-slate-700" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-[1px] bottom-[1px] duration-200 ${
                      notifyAll && notifyErrors
                        ? "right-[1px] left-[50%] bg-green-300"
                        : "left-[1px] right-[50%] bg-red-300"
                    } rounded-full`}
                  ></div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start mt-3">
            <p className="mb-1">Short Cuts</p>
            {userPreferences?.commands?.map((command) => (
              <button
                key={command.text}
                className={`flex justify-between w-full text-sm p-2 ${
                  userPreferences.darkMode ? "hover:bg-slate-700" : "hover:bg-slate-300"
                } duration-200 items-start`}
              >
                <p>{command.text}</p>
                <p>{command.command}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Settings;
