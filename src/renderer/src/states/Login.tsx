import { useState, FormEvent, useContext } from "react";
import { loginUser } from "@renderer/utils/api";
import UserContext from "@renderer/contexxt/UserContext";

const Login = () => {
  const { token, setToken, fetchUser, setSystemNotif, setLoading } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

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
    <section>
      <h1 className="text-7xl text-center font-bold mt-3">Notes</h1>
      <p className="text-center mt-10">Login to access your notes</p>
      <form
        onSubmit={(e) => handleLogin(e)}
        className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 lg:mx-60 text-slate-900 px-20"
      >
        <input
          type="text"
          className="p-3 rounded-md shadow-md focus:outline-slate-300 w-full my-3"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-3"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-3"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start"
        >
          Login &rarr;
        </button>
      </form>
    </section>
  );
};

export default Login;
