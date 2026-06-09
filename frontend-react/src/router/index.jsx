import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import SiteLayout from "../layouts/SiteLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import HomePage from "../pages/Home";
import AuthPage from "../pages/auth/auth";
import ForgotPassword from "../pages/auth/ForgotPassword";

import DashboardPage from "../pages/dashboard/Dashboard";
import PostsPage from "../pages/dashboard/Posts";
import NewPostPage from "../pages/dashboard/NewPost";
import EditPostPage from "../pages/dashboard/EditPost";
import CategoriesPage from "../pages/dashboard/Categories";
import CommentsPage from "../pages/dashboard/Comments";
import TagsPage from "../pages/dashboard/Tags";
import ProfilePage from "../pages/dashboard/Profile";
import HomeHeroPage from "../pages/dashboard/HomeHeroPage";
import AdsPage from "../pages/dashboard/AdsPage";
import SinglePostPage from "../pages/SinglePostPage";

import PrivateRoute from "./PrivateRoute";

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/category/:categorySlug",
        element: <HomePage />,
      },
      {
        path: "/news/:slug",
        element: <SinglePostPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "/auth/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/dashboard/posts",
        element: <PostsPage />,
      },
      {
        path: "/dashboard/posts/new",
        element: <NewPostPage />,
      },
      {
        path: "/dashboard/posts/:slug/edit",
        element: <EditPostPage />,
      },
      {
        path: "/dashboard/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/dashboard/comments",
        element: <CommentsPage />,
      },
      {
        path: "/dashboard/tags",
        element: <TagsPage />,
      },
      {
        path: "/dashboard/home-hero",
        element: <HomeHeroPage />,
      },
      {
        path: "/dashboard/ads",
        element: <AdsPage />,
      },
      {
        path: "/dashboard/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);
