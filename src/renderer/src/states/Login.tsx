import { FormEvent, useContext, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import UserContext from "@renderer/contexxt/UserContext";
import { loginUser } from "@renderer/utils/api";

import ForgotCreds from "./ForgotCreds";
import Signup from "./Signup";

const Login = (): JSX.Element => {
  const { setToken, setLoading, networkNotificationError, showErrorNotification } =
    useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signup, setSignup] = useState(false);
  const [forgotCreds, setForgotCreds] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
          networkNotificationError([]);
        }
        const status = err.response.status;
        if (status >= 400 && status <= 404) {
          showErrorNotification("Incorrect Credentials", err.response.data.message, false, []);
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
            className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-[#222] w-96"
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
            <div className=" rounded-md shadow-md bg-slate-100 focus:border-none w-full my-2 flex justify-between items-center relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full p-3 focus:outline-slate-300 rounded-md focus:bg-slate-100 hover:bg-slate-100 duration-200"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-3 top-[50%] translate-y-[-50%]"
              >
                {!showPass ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-md shadow-md bg-amber-200 text-black mt-3 font-semibold self-start hover:bg-[#222] focus:bg-[#222] focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
            >
              Login &rarr;
            </button>
            <hr className="my-5" />
            <p>don&apos;t have an account?</p>
            <button
              onClick={() => setSignup(true)}
              className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-[#222] focus:bg-[#222] focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
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
