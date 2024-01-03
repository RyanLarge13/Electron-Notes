import { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";
import UserContext from "@renderer/contexxt/UserContext";

const MainPage = (): JSX.Element => {
  const { user, loading, setOrder, setEdit, setMenu } = useContext(UserContext);

  const [keyPresses, setKeyPressed] = useState({
    n: false,
    f: false,
    Control: false,
    Alt: false,
    m: false,
    e: false,
    o: false
  });

  const navigate = useNavigate();

  const handleKeyPress = (e): void => {
    e.preventDefault();
    const key = e.key;
    if (keyPresses.hasOwnProperty(key)) {
      setKeyPressed((prevPresses) => {
        return {
          ...prevPresses,
          [key]: true
        };
      });
    }
  };

  const handleKeyUp = (e): void => {
    e.preventDefault();
    const key = e.key;
    if (keyPresses.hasOwnProperty(key)) {
      setKeyPressed((prevPresses) => {
        return {
          ...prevPresses,
          [key]: false
        };
      });
    }
  };

  useEffect(() => {
    const { Alt, Control, f, n, e, o, m } = keyPresses;

    if (Alt && Control && n) {
      navigate("/newnote");
    }
    if (Alt && Control && f) {
      navigate("/newfolder");
    }
    if (Control && e) {
      setEdit((prev) => !prev);
    }
    if (Control && o) {
      setOrder((prev) => !prev);
    }
    if (Control && m) {
      setMenu((prev) => !prev);
    }
  }, [keyPresses]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <section>
      <ContextMenu />
      <SystemNotif />
      {!loading ? (
        !user ? (
          <Login />
        ) : (
          <Account />
        )
      ) : (
        <div className="fixed z-[999] w-screen h-screen flex justify-center items-center">
          <ClipLoader color="#fff" />
        </div>
      )}
    </section>
  );
};

export default MainPage;
