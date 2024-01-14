import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { forgotCreds } from "@renderer/utils/api";
import UserContext from "@renderer/contexxt/UserContext";

const ForgotCreds = ({
  setForgotCreds
}: {
  setForgotCreds: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const { setSystemNotif, systemNotif } = useContext(UserContext);

  const [email, setEmail] = useState("");

  useEffect(() => {
    const loginCreds = localStorage.getItem("loginCreds");
    if (loginCreds) {
      const myEmail = JSON.parse(loginCreds).email;
      setEmail(myEmail);
    }
  }, []);

  const handleForgotCreds = async (e): Promise<void> => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    try {
      forgotCreds(email)
        .then((res) => {
          console.log(res);
          const newNotification = {
            show: true,
            title: "Reset Credentials",
            text: `Check your email for your new login credentials and to reset your information`,
            color: "bg-cyan-300",
            hasCancel: true,
            actions: [
              { text: "close", func: (): void => setSystemNotif({ show: false }) },
              {
                text: "Login",
                func: (): void => {
                  setSystemNotif({ show: false });
                  setForgotCreds(false);
                }
              }
            ]
          };
          setSystemNotif(newNotification);
        })
        .catch((err) => {
          console.log(err);
          const newError = {
            show: true,
            title: "Issues Signing In",
            text: `${
              err.response.data.message ||
              "It looks like there might be an issue with your internet connection, please check your network connection and try again"
            }`,
            color: "bg-red-300",
            hasCancel: true,
            actions: [
              { text: "close", func: () => setSystemNotif({ show: false }) },
              { text: "retry", func: () => handleForgotCreds(e) }
            ]
          };
          setSystemNotif(newError);
        });
    } catch (err) {
      console.log(err);
      const newError = {
        show: true,
        title: "Issues Signing In",
        text: err,
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          { text: "close", func: () => setSystemNotif({ show: false }) },
          { text: "retry", func: () => handleForgotCreds(e) }
        ]
      };
      setSystemNotif(newError);
    }
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    if (isValid) {
      setSystemNotif({ show: false });
      return true;
    }
    if (!isValid) {
      if (systemNotif.show && systemNotif.title === "Email Rules") return false;
      const newNotif = {
        show: true,
        title: "Email Rules",
        text: "Email must be a valid email",
        color: "bg-red-300",
        hasCancel: true,
        actions: [{ text: "close", func: (): void => setSystemNotif({ show: false }) }]
      };
      setSystemNotif(newNotif);
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
        className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-slate-900 w-96"
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
          className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
        >
          Submit &rarr;
        </button>
        <button className="mt-5 underline" onClick={() => setForgotCreds(false)}>
          go back to login
        </button>
      </form>
    </>
  );
};

export default ForgotCreds;
