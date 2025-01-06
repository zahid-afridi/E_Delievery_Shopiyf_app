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
  

  const disptch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  useEffect(() => {
    storefetch();
  }, []);
  if (!isLogin) {
    return <LoginForm />;
  }
  const storefetch = async () => {
    const response = await fetch("/api/store/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      disptch(setStoreDetail(data));
    }
    console.log(data);
  };

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <PolarisProvider>
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
    </PolarisProvider>
  );
}
