"use client";
import DynamicBreadcrumb from "./bread-crumbs";
import Profile from "./profile";
export default function InnerNav() {
  return (
    <nav className="flex items-center pr-16 ">
      <DynamicBreadcrumb />
      <div className="flex items-center gap-5 ml-auto">
        <Profile />
      </div>
    </nav>
  );
}
