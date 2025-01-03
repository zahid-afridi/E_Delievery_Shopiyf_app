import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { Toaster } from "react-hot-toast";
import { QueryProvider, PolarisProvider } from "./components";
import Generatelabel from "./pages/Generatelabel.jsx";
import React, { useState } from 'react';
import LoginForm from "./components/LoginForm.jsx";

export default function App() {
  const [islogin, setIslogin] = useState(true);
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();
  if (!islogin) {
    return <LoginForm />;
  }
  return (
    <PolarisProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </PolarisProvider>
  );
}
