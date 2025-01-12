import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

import UserContext from "@renderer/contexxt/UserContext";
import { forgotCreds } from "@renderer/utils/api";

const ForgotCreds = ({
  setForgotCreds
}: {
  setForgotCreds: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const {
    systemNotif,
    networkNotificationError,
    resetSystemNotification,
    showErrorNotification,
    showSuccessNotification
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const loginCreds = localStorage.getItem("loginCreds");
    if (loginCreds) {
      try {
        const myEmail = JSON.parse(loginCreds).email;
        setEmail(myEmail);
      } catch (err) {
        console.log(err);
        showErrorNotification(
          "Cannot Restore Email",
          "Sorry, there is an issue parsing the previous email you entered, you will need to retype it",
          false,
          []
        );
      }
    }
  }, []);

  const handleForgotCreds = async (e): Promise<void> => {
    e.preventDefault();
    setResetLoading(true);
    if (!validateEmail()) {
      return;
    }
    try {
      forgotCreds(email)
        .then((res) => {
          console.log(res);
          showSuccessNotification(
            "Reset Credentials",
            "Check your email for your new login credentials and to reset your information",
            true,
            [
              {
                text: "Login",
                func: (): void => {
                  resetSystemNotification();
                  setForgotCreds(false);
                }
              }
            ]
          );
          setResetLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            showErrorNotification("Reset Request Failed", err.response.message, true, [
              {
                text: "re-try",
                func: (): void => {
                  resetSystemNotification();
                  handleForgotCreds(e);
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
          if (err.request) {
            networkNotificationError([
              {
                text: "re-try",
                func: (): void => {
                  resetSystemNotification();
                  handleForgotCreds(e);
                }
              },
              { text: "reload app", func: () => window.location.reload() }
            ]);
          }
        });
    } catch (err) {
      console.log(err);
      showErrorNotification(
        "Reset Request Failed",
        "There was a problem issuing your request to reset your password. Please reload the application and try again",
        true,
        [
          { text: "retry", func: () => handleForgotCreds(e) },
          { text: "reload app", func: () => window.location.reload() }
        ]
      );
      setResetLoading(false);
    }
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    if (isValid) {
      resetSystemNotification();
      return true;
    }
    if (!isValid) {
      if (systemNotif.show && systemNotif.title === "Email Rules") return false;
      showErrorNotification("Email Rules", "Email must be a valid email", true, []);
      return false;
    }
    return false;
  };

  return (
    <>
      <h1 className="text-7xl text-center font-bold mt-3">Reset</h1>
      <p className="text-center mt-10">
        Enter your email and we will send you your existing credentials
      </p>
      <p>
        We strongly recommend resetting your password and username after you log back into your
        account
      </p>
      <form
        onSubmit={(e) => handleForgotCreds(e)}
        className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-[#222] w-96"
      >
        <input
          type="email"
          className="p-3 rounded-md shadow-md focus:outline-slate-300 w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="email"
          value={email}
          onKeyUp={() => validateEmail()}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-[#222] focus:bg-[#222] focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
        >
          {resetLoading ? <ClipLoader size={19} /> : "Submit"}
        </button>
        <button className="mt-5 underline" onClick={() => setForgotCreds(false)}>
          go back to login
        </button>
      </form>
    </>
  );
};

export default ForgotCreds;
