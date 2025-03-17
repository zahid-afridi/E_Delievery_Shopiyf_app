import { BrowserRouter, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { QueryProvider, PolarisProvider } from "./components";
import Generatelabel from "./pages/Generatelabel.jsx";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import { useDispatch } from "react-redux";
import { setStoreDetail, setToken, setUser } from "./redux/slices/StoreSlice.js";
import { BaseUrl } from "./AuthToken/AuthToken.js";
import Settings from "./pages/Settings.jsx";
import { Spinner } from "@shopify/polaris";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [JWTTOKEN, setJWTTOKEN] = useState("");
  const [formName, setFormName] = useState("SignUp Form");
  console.log("Refresh", refresh);

  useEffect(() => {
    storefetch();
    console.log("JWTTOKEN ", JWTTOKEN);
  }, [refresh]);

useEffect(()=>{
   CreateCarierSevier()
},[])
  const CreateCarierSevier=async()=>{
    try {
      const res=await fetch("/api/shipping-create",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
      
      })
      const data=await res.json();
      console.log('carrierSever',data)
    } catch (error) {
      console.log('er',error)
    }
  }
  const storefetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/store/info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        const user = data.StoreDetail.User;
        console.log(user);
        if (user) {
          dispatch(setUser(user));
          const jwtresponse = await fetch(
            `${BaseUrl}/api/v1/customer/auth/access-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                clientId: user.clientId,
                clientSecret: user.clientSecret,
              }),
            }
          );
          console.log("Data Reesponse", data.StoreDetail.User);
          console.log("Refresh api", refresh);

          const token = await jwtresponse.json();
          console.log("Token", token.data.accessToken);
          setJWTTOKEN(token.data.accessToken)
          console.log(JWTTOKEN)
          if (token) {
            dispatch(setToken(token.data.accessToken));
          }
        }

        console.log("Data Reesponse", data.StoreDetail.User);

        dispatch(setStoreDetail(data.StoreDetail.Store));
        setIsLogin(data.User);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsLoading(false); // Stop loading when fetch is complete
    }
  };

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  // Show a loading screen while the API call is in progress
  if (isLoading) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
          <Spinner accessibilityLabel="Spinner example" size="large" />
        </div>
      </>
    );
  }

  return (
    <PolarisProvider>
      {isLogin && JWTTOKEN ? (
        <>
          <QueryProvider>
            <NavMenu>
              <Link to="/" rel="home" />
              <Link to="/Generatelabel" element={<Generatelabel />}>
                Generate Label
              </Link>

              <Link to="/Settings" element={<Settings />}>Payment Gateway Setting</Link>
              <Link to="/AddShippingMethod" element={<Settings />}>Add Shipping Method</Link>
              <Link to="/Profile" element={<Profile />}>Profile</Link>
            </NavMenu>
            <Routes pages={pages} />
          </QueryProvider>
        </>
      ) : (
        <LoginForm
          setRefresh={setRefresh}
          Token={JWTTOKEN}
          formName={formName}
        />
      )}
    </PolarisProvider>
  );
}
