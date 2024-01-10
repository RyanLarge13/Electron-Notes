import UserContext from "@renderer/contexxt/UserContext";
import { useContext, useState } from "react";

const Signup = ({ setSignup }) => {
  const { setSystemNotif, systemNotif } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e): void => {
    e.preventDefault();
    if (!validateEmail() || !validateUsername() || !validatePass()) {
      const newError = {
        show: true,
        title: "Please input valid fields",
        text: "You must follow the rules for all fields",
        color: "bg-red-400",
        hasCancel: true,
        actions: [{ text: "close", func: (): void => setSystemNotif({ show: false }) }]
      };
      return setSystemNotif(newError);
    }
  };

  const validateUsername = (): boolean => {
    const userRegex = /^[a-zA-Z0-9_-]{4,}$/;
    const isValid = userRegex.test(username);
    if (isValid) {
      setSystemNotif({ show: false });
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
        actions: [{ text: "close", func: (): void => setSystemNotif({ show: false }) }]
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

  const validatePass = (): boolean => {
    const passRegex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const isValid = passRegex.test(password);
    if (isValid) {
      setSystemNotif({ show: false });
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
        actions: [{ text: "close", func: (): void => setSystemNotif({ show: false }) }]
      };
      setSystemNotif(newNotif);
      return false;
    }
    return false;
  };

  return (
    <section>
      <h1 className="text-7xl text-center font-bold mt-3">Sign Up</h1>
      <p className="text-center mt-10">Signup and organize</p>
      <form
        onSubmit={(e) => handleSignup(e)}
        className="rounded-md shadow-lg bg-slate-200 p-5 flex flex-col justify-center items-center mt-10 mx-10 text-slate-900 w-96"
      >
        <input
          type="text"
          className="p-3 rounded-md shadow-md focus:outline-slate-300 w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={validateUsername}
        />
        <input
          type="email"
          className="p-3 focus:outline-slate-300 rounded-md shadow-md focus:border-none w-full my-2 hover:bg-slate-100 duration-200 focus:bg-slate-100"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <button
          type="submit"
          className="py-2 px-4 rounded-md shadow-md bg-amber-300 text-black mt-3 font-semibold self-start hover:bg-slate-900 focus:bg-slate-900 focus:text-white hover:scale-[0.99] w-full hover:text-white duration-200"
        >
          Signup &rarr;
        </button>
        <hr className="my-5" />
        <p>already have an account?</p>
        <button onClick={() => setSignup(false)}>Login</button>
      </form>
    </section>
  );
};

export default Signup;
