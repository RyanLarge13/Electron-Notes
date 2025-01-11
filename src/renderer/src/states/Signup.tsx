import UserContext from "@renderer/contexxt/UserContext";
import { signupUser } from "@renderer/utils/api";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

const Signup = ({ setSignup }: { setSignup: Dispatch<SetStateAction<boolean>> }): JSX.Element => {
  const { setSystemNotif, systemNotif } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    const signupCreds = localStorage.getItem("signupCreds");
    if (signupCreds) {
      const mySignupCreds = JSON.parse(signupCreds);
      setEmail(mySignupCreds.email);
      setUsername(mySignupCreds.username);
    }
  }, []);

  const handleSignup = async (e): Promise<boolean> => {
    e.preventDefault();
    setLoadingState(true);
    if (!validateEmail() || !validateUsername() || !validatePass()) {
      const newError = {
        show: true,
        title: "Please input valid fields",
        text: "You must follow the rules for all fields",
        color: "bg-red-400",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newError);
      return false;
    }
    try {
      signupUser({ username, email, password })
        .then((res) => {
          console.log(res);
          const newNotification = {
            show: true,
            title: "Login",
            text: `Please login with your credentials to access your account for the first time, a new email with your credentials was sent to your email`,
            color: "bg-cyan-300",
            hasCancel: true,
            actions: [
              {
                text: "close",
                func: () =>
                  setSystemNotif({
                    show: false,
                    title: "",
                    text: "",
                    color: "",
                    hasCancel: false,
                    actions: []
                  })
              }
            ]
          };
          setSystemNotif(newNotification);
          localStorage.removeItem("loginCreds");
          localStorage.removeItem("signupCreds");
          setSignup(false);
          setLoadingState(false);
          return true;
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
              {
                text: "close",
                func: () =>
                  setSystemNotif({
                    show: false,
                    title: "",
                    text: "",
                    color: "",
                    hasCancel: false,
                    actions: []
                  })
              },
              { text: "retry", func: () => handleSignup(e) }
            ]
          };
          setSystemNotif(newError);
          setLoadingState(false);
          return false;
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
          {
            text: "close",
            func: () =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          },
          { text: "retry", func: () => handleSignup(e) }
        ]
      };
      setSystemNotif(newError);
      setLoadingState(false);
      return false;
    }
    localStorage.setItem("signedup", "yes");
    return false;
  };

  const validateUsername = (): boolean => {
    const userRegex = /^[a-zA-Z0-9_-]{4,}$/;
    const isValid = userRegex.test(username);
    if (isValid) {
      setSystemNotif({
        show: false,
        title: "",
        text: "",
        color: "",
        hasCancel: false,
        actions: []
      });
      return true;
    }
    if (!isValid) {
      if (systemNotif.show && systemNotif.title === "Username Rules") return false;
      const newNotif = {
        show: true,
        title: "Username Rules",
        text: "Username must be: \n - 4 characters \n - contain only _, -, and numbers",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newNotif);
      return false;
    }

    return false;
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    if (isValid) {
      setSystemNotif({
        show: false,
        title: "",
        text: "",
        color: "",
        hasCancel: false,
        actions: []
      });
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
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newNotif);
      return false;
    }
    return false;
  };

  const validatePass = (): boolean => {
    const passRegex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const isValid = passRegex.test(password);
    if (isValid) {
      setSystemNotif({
        show: false,
        title: "",
        text: "",
        color: "",
        hasCancel: false,
        actions: []
      });
      return true;
    }
    if (!isValid) {
      if (systemNotif.show && systemNotif.title === "Password Rules") return false;
      const newNotif = {
        show: true,
        title: "Password Rules",
        text: "Your password must be: \n - 8 characters long \n - 2 special characters \n - 2 uppercase characters",
        color: "bg-red-300",
        hasCancel: true,
        actions: [
          {
            text: "close",
            func: (): void =>
              setSystemNotif({
                show: false,
                title: "",
                text: "",
                color: "",
                hasCancel: false,
                actions: []
              })
          }
        ]
      };
      setSystemNotif(newNotif);
      return false;
    }
    return false;
  };

  const handleChangeUsername = (e): void => {
    setUsername(e.target.value);
    const signupCreds = localStorage.getItem("signupCreds");
    if (signupCreds) {
      const mySignupCreds = JSON.parse(signupCreds);
      mySignupCreds.username = e.target.value;
      localStorage.setItem("signupCreds", JSON.stringify(mySignupCreds));
    }
    if (!signupCreds) {
      const newSignupCreds = {
        username: e.target.value,
        email: ""
      };
      localStorage.setItem("signupCreds", JSON.stringify(newSignupCreds));
    }
  };

  const handleChangeEmail = (e): void => {
    setEmail(e.target.value);
    const signupCreds = localStorage.getItem("signupCreds");
    if (signupCreds) {
      const mySignupCreds = JSON.parse(signupCreds);
      mySignupCreds.email = e.target.value;
      localStorage.setItem("signupCreds", JSON.stringify(mySignupCreds));
    }
    if (!signupCreds) {
      const newSignupCreds = {
        username: "",
        email: e.target.value
      };
      localStorage.setItem("signupCreds", JSON.stringify(newSignupCreds));
    }
  };

  return (
    <section>
      <h1 className="text-7xl text-center font-bold mt-3">Sign Up</h1>
      <p className="text-center mt-10">Signup and organize</p>
      <form
        onSubmit={(e) => handleSignup(e)}
        className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-[#222] w-96"
      >
        <input
          type="text"
          className="p-3 rounded-md shadow-md focus:outline-slate-300 w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="username"
          value={username}
          onChange={(e) => handleChangeUsername(e)}
          onKeyUp={validateUsername}
        />
        <input
          type="email"
          className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="email"
          value={email}
          onChange={(e) => handleChangeEmail(e)}
          onKeyUp={validateEmail}
        />
        <input
          type="password"
          className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={validatePass}
        />
        {!loadingState ? (
          <button
            type="submit"
            disabled={loadingState}
            className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-[#222] focus:bg-[#222] focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
          >
            Signup &rarr;
          </button>
        ) : (
          <div className="pt-1 flex justify-center items-center rounded-md shadow-md bg-amber-300 mt-3 font-semibold self-start w-full">
            <ClipLoader />
          </div>
        )}
        <hr className="my-5" />
        <p>already have an account?</p>
        <button onClick={() => setSignup(false)}>Login</button>
      </form>
    </section>
  );
};

export default Signup;
