import { useState, FormEvent, useContext } from "react";
import { loginUser } from "@renderer/utils/api";
import UserContext from "@renderer/contexxt/UserContext";
import Signup from "./Signup";

const Login = () => {
  const { token, setToken, fetchUser, setSystemNotif, setLoading } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signup, setSignup] = useState(false);

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    loginUser(username, email, password)
      .then((res) => {
        const newToken = res.data.data;
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        const status = err.response.status;
        if (status === 401) {
          const newError = {
            show: true,
            title: "Incorrect credentials",
            text: err.response.data.message,
            color: "bg-red-300",
            hasCancel: false,
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
          };
          return setSystemNotif(newError);
        }
        if (status === 404) {
          const newError = {
            show: true,
            title: "Incorrect credentials",
            text: err.response.data.message,
            color: "bg-red-300",
            hasCancel: false,
            actions: [{ text: "close", func: () => setSystemNotif({ show: false }) }]
          };
          return setSystemNotif(newError);
        }
      });
  };

  return (
    <section className="flex flex-col justify-center items-center">
      {!signup ? (
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
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
            >
              Login &rarr;
            </button>
            <hr className="my-5" />
            <p>don't have an account?</p>
            <button
              onClick={() => setSignup(true)}
              className="py-2 px-4 rounded-md shadow-md bg-amber-200 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
            >
              Signup
            </button>
          </form>
        </>
      ) : (
        <Signup setSignup={setSignup} />
      )}
    </section>
  );
};

export default Login;
