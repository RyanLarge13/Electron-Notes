import { useState, FormEvent, useContext, useEffect } from "react";
import { loginUser } from "@renderer/utils/api";
import UserContext from "@renderer/contexxt/UserContext";
import Signup from "./Signup";
import ForgotCreds from "./ForgotCreds";

const Login = (): JSX.Element => {
  const { setToken, setSystemNotif, setLoading } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signup, setSignup] = useState(false);
  const [forgotCreds, setForgotCreds] = useState(false);

  useEffect(() => {
    const hasSignedUp = localStorage.getItem("signedup");
    const loginCreds = localStorage.getItem("loginCreds");
    if (loginCreds) {
      const myLoginCreds = JSON.parse(loginCreds);
      setEmail(myLoginCreds.email);
      setUsername(myLoginCreds.username);
    }
    if (!hasSignedUp) {
      return setSignup(true);
    }
  }, []);

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    loginUser(username, email, password)
      .then((res) => {
        const newToken = res.data.data;
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        localStorage.setItem("signedup", "yes");
        localStorage.removeItem("loginCreds");
        localStorage.removeItem("signupCreds");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if (err.code === "ERR_NETWORK") {
          const newError = {
            show: true,
            title: "Network Error",
            text: "Please check your internet connection and try logging in again",
            color: "bg-red-300",
            hasCancel: false,
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
          return setSystemNotif(newError);
        }
        const status = err.response.status;
        if (status >= 400 && status <= 404) {
          const newError = {
            show: true,
            title: "Incorrect credentials",
            text: err.response.data.message,
            color: "bg-red-300",
            hasCancel: false,
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
          return setSystemNotif(newError);
        }
      });
  };

  const handleChangeUsername = (e): void => {
    setUsername(e.target.value);
    const loginCreds = localStorage.getItem("loginCreds");
    if (loginCreds) {
      const myLoginCreds = JSON.parse(loginCreds);
      myLoginCreds.username = e.target.value;
      localStorage.setItem("loginCreds", JSON.stringify(myLoginCreds));
    }
    if (!loginCreds) {
      const newLoginCreds = {
        username: e.target.value,
        email: ""
      };
      localStorage.setItem("loginCreds", JSON.stringify(newLoginCreds));
    }
  };

  const handleChangeEmail = (e): void => {
    setEmail(e.target.value);
    const loginCreds = localStorage.getItem("loginCreds");
    if (loginCreds) {
      const myLoginCreds = JSON.parse(loginCreds);
      myLoginCreds.email = e.target.value;
      localStorage.setItem("loginCreds", JSON.stringify(myLoginCreds));
    }
    if (!loginCreds) {
      const newLoginCreds = {
        username: "",
        email: e.target.value
      };
      localStorage.setItem("loginCreds", JSON.stringify(newLoginCreds));
    }
  };

  return (
    <section className="flex flex-col justify-center items-center pt-5">
      {!signup && !forgotCreds ? (
        <>
          <h1 className="text-7xl text-center font-bold mt-3">Login</h1>
          <p className="text-center mt-10">Login to access your notes</p>
          <form
            onSubmit={(e) => handleLogin(e)}
            className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-slate-900 w-96"
          >
            <input
              type="text"
              className="p-3 rounded-md shadow-md focus:outline-slate-300 w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
              placeholder="username"
              value={username}
              onChange={(e) => handleChangeUsername(e)}
            />
            <input
              type="email"
              className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
              placeholder="email"
              value={email}
              onChange={(e) => handleChangeEmail(e)}
            />
            <input
              type="password"
              className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-md shadow-md bg-amber-200 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
            >
              Login &rarr;
            </button>
            <hr className="my-5" />
            <p>don&apos;t have an account?</p>
            <button
              onClick={() => setSignup(true)}
              className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
            >
              Signup
            </button>
          </form>
          <button className="mt-5 underline" onClick={() => setForgotCreds(true)}>
            forgot password
          </button>
        </>
      ) : forgotCreds ? (
        <ForgotCreds setForgotCreds={setForgotCreds} />
      ) : (
        <Signup setSignup={setSignup} />
      )}
    </section>
  );
};

export default Login;
