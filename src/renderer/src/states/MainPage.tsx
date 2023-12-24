import UserContext from "@renderer/contexxt/UserContext";
import { useContext } from "react";
import Login from "./Login";
import Account from "./Account";
import ContextMenu from "@renderer/components/ContextMenu";
import SystemNotif from "@renderer/components/SystemNotif";

const MainPage = (): JSX.Element => {
  const { user } = useContext(UserContext);

  return (
    <section>
      <ContextMenu />
      <SystemNotif />
      {!user ? <Login /> : <Account />}
    </section>
  );
};

export default MainPage;
