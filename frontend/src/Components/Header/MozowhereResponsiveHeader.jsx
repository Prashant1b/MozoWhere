import React, { useMemo, useState } from "react";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

export default function MozowhereResponsiveHeader({ mobileShopIn, setMobileShopIn }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, booting, logout } = useContext(AuthContext);

  const menuLinks = useMemo(
    () => [
      { label: "SHOP NOW", to: "/shop" },
      { label: "CUSTOMIZE", to: "/custom-tshirts" },
      { label: "CUSTOMIZE ACCESSORIES", to: "/custom-accessories" },
      { label: "BULK ORDER", to: "/bulk-order" },
      { label: "ACCESSORIES", to: "/accessories" },
    ],
    []
  );

  return (
    <header className="w-full bg-white">
      <DesktopHeader
        menuLinks={menuLinks}
        mobileShopIn={mobileShopIn}
        setMobileShopIn={setMobileShopIn}
        user={user}
        booting={booting}
        onLogout={logout}
      />

      <MobileHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileShopIn={mobileShopIn}
        setMobileShopIn={setMobileShopIn}
        menuLinks={menuLinks}
        user={user}
        booting={booting}
        onLogout={logout}
      />
    </header>
  );
}
