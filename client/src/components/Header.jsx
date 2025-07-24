import React, { useMemo } from "react";
import { Dropdown, Avatar } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../redux/auth/selectors";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        label: "My Profile",
        onClick: () => navigate("/profile"),
      },
      {
        key: "settings",
        label: "Account settings",
        onClick: () => navigate("/profile"),
      },
      { type: "divider" },
      {
        key: "logout",
        label: "Log out",
        onClick: () => navigate("/logout"),
      },
    ],
    [navigate]
  );

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-3"
            title="RelayPoint"
          >
            <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
              <span className="block w-6 h-6 bg-white/90 rounded-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                RelayPoint
              </h1>
              <p className="text-xs text-gray-500 mt-0 leading-none">
                Automate with relays
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/relays"
              className="text-sm text-gray-700 hover:text-primary-600"
            >
              Relays
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-gray-700 hover:text-primary-600"
            >
              Dashboard
            </Link>
            <Link
              to="/docs"
              className="text-sm text-gray-700 hover:text-primary-600"
            >
              Docs
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Avatar
                    size={32}
                    className="bg-gradient-to-r from-primary-600 to-primary-700"
                  >
                    RP
                  </Avatar>
                </button>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const from =
                      window.location.pathname + window.location.search;
                    navigate(`/login?redirectTo=${encodeURIComponent(from)}`);
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default React.memo(Header);
