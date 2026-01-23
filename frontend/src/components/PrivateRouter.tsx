// import {Navigate, Outlet} from "react-router-dom";
// import {getToken} from "../utils/auth";

// const isAuthenticated = () => !!getToken();

// export default function PrivateRouter({redirectTo = "/login"}) {
//     return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace/>;
// }

import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/auth";

const PrivateRouter = () => {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRouter;
