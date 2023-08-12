import { useOutletContext } from "react-router-dom";
import { AuthContextType } from "../context/Auth/type";

const useAuthRoute = () => {
  return useOutletContext<AuthContextType>();
};

export default useAuthRoute;
