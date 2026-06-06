import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { router } from "./router/index.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <RouterProvider router={router} />

    <ToastContainer
      position="top-left"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="!rounded-xl !bg-zinc-900 !text-white !border !border-zinc-700"
      progressClassName="!bg-white"
    />
  </>,
);
