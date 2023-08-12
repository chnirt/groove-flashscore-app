import { Outlet } from "react-router-dom";
import BottomTabBar from "../../components/BottomTabBar";
import useAuth from "../../hooks/useAuth";

const App = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <div className="border-t sticky bottom-0">{user && <BottomTabBar />}</div>
    </div>
  );
};

export default App;
