'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Users,
  Palette,
  CalendarDays,
  WalletCards,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Settings,
  LogOut,
  LayoutGrid
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  const imageSrc = session?.user?.image || "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=634&q=80";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Relevant Icons based on categories
  const menuItems = [
    { href: "/dashboard/order", label: "Order", icon: ShoppingCart },
    { href: "/dashboard/customer", label: "Customer", icon: Users },
    { href: "/dashboard/dyeing", label: "Dyeing", icon: Palette },
    { href: "/dashboard/calender", label: "Calender", icon: CalendarDays },
    { href: "/dashboard/accounts", label: "Accounts", icon: WalletCards },
    { href: "/dashboard/admins", label: "Adminnistration", icon: ShieldCheck },
  ];

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1e2634] text-white fixed top-0 left-0 right-0 z-50">
        <Link href={'/'} className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Image src="/Image/logo.png" alt="Logo" width={20} height={20} className="brightness-200" />
          </div>
          <span className="text-sm font-semibold">Admin Panel</span>
        </Link>
        <button className="cursor-pointer" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-[#1e2634] text-gray-400
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-72" : "w-20"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static h-screen flex flex-col
        `}
      >
        <div className="flex flex-col h-full">

          {/* ===== LOGO SECTION ===== */}
          <Link href={'/'} className="relative flex items-center gap-3 px-4 py-6">
            <div className="bg-blue-600 p-2 rounded-md shrink-0">
              <Image src="/Image/logo.png" alt="Logo" width={24} height={24} className="brightness-200" />
            </div>

            <div className={`${!isOpen && "lg:hidden opacity-0"} transition-opacity duration-200`}>
              <h1 className="text-md font-bold text-white leading-none whitespace-nowrap">
                NM-Dyeing
              </h1>
              <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">Management</p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
              className="hidden lg:flex absolute -right-3 top-8
                bg-blue-600 text-white shadow-lg
                rounded-full p-1 hover:bg-blue-700 cursor-pointer z-50"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </Link>

          {/* ===== NAVIGATION MENU ===== */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className={`text-[10px] uppercase tracking-[2px] text-gray-500 mb-4 mt-4 px-3 font-bold ${!isOpen && "lg:hidden"}`}>
              Main Menu
            </p>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-3 py-2.5
                      text-sm font-medium
                      rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span className={`${!isOpen && "lg:hidden opacity-0"} whitespace-nowrap`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ===== USER INFO & DROPDOWN ===== */}
          <div className="px-3 py-4 border-t border-white/5 relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Image
                className="object-cover rounded-full h-9 w-9 border border-gray-600"
                src={imageSrc}
                alt="avatar"
                width={36}
                height={36}
              />
              <div className={`${!isOpen && "lg:hidden opacity-0"} overflow-hidden`}>
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Guest"}</p>
                <p className="text-[11px] text-gray-500 truncate">Admin</p>
              </div>
            </div>

            {dropdownOpen && (
              <div className="absolute bottom-16 left-3 right-3 bg-[#262f3f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <Link
                  href="/dashboard/setting"
                  className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 gap-3"
                >
                  <Settings size={18} /> Settings
                </Link>
                <Link
                  href="/dashboard/menu"
                  className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-white/5 gap-3"
                >
                  <LayoutGrid size={18} /> Menu
                </Link>
                {session && (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 gap-3 border-t border-white/5 cursor-pointer text-left"
                  >
                    <LogOut size={18} /> Log Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;