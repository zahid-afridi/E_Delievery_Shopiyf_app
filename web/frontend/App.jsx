import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";
import { QueryProvider, PolarisProvider } from "./components";
import Generatelabel from "./pages/Generatelabel.jsx";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/Store.js";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setStoreDetail } from "./redux/slices/StoreSlice.js";

export default function App() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storefetch();
  }, []);

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
        dispatch(setStoreDetail(data.existingStore));
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <PolarisProvider>
      {isLogin ? (
        <>
          <Toaster />
          <QueryProvider>
            <NavMenu>
              <a href="/" rel="home" />
              <a href="/Generatelabel" element={<Generatelabel />}>
                Generate Label
              </a>
            </NavMenu>
            <Routes pages={pages} />
          </QueryProvider>
        </>
      ) : (
        <LoginForm />
      )}
    </PolarisProvider>
  );
}
