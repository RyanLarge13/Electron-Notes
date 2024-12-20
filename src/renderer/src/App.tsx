import { UserProvider } from "./contexxt/UserContext";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./states/MainPage";
import NewFolder from "./states/NewFolder";
import DraftMain from "./states/DraftMain";

function App(): JSX.Element {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />}>
            <Route path="newfolder" element={<NewFolder />} />
            <Route path="newnote" element={<DraftMain />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
