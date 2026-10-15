import {
  FaUser,
  FaBox,
  FaHeart,
  FaLock,
  FaWallet,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ProfileMobileNav = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: "orders", label: "Orders", icon: FaBox },
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "addresses", label: "Addresses", icon: FaMapMarkerAlt },
    { id: "wallet", label: "Wallet", icon: FaWallet },
    { id: "wishlist", label: "Wishlist", icon: FaHeart },
    { id: "password", label: "Security", icon: FaLock },
  ];

  return (
    <div className="profile-mobile-nav-bar">
      <div className="profile-mobile-nav-scroll">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`profile-mobile-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <IconComp className="mobile-tab-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileMobileNav;
