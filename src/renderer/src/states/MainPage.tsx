import UserContext from "@renderer/contexxt/UserContext";
import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";

const MainPage = (): JSX.Element => {
  const { user, loading } = useContext(UserContext);

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
