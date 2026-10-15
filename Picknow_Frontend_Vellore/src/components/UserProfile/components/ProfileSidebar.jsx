import {
  FaUser,
  FaBox,
  FaHeart,
  FaLock,
  FaWallet,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaChevronRight,
} from "react-icons/fa";

const ProfileSidebar = ({ user, activeTab, onSelectTab, onRequestLogout }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const navSections = [
    {
      title: "ORDERS & BUYS",
      items: [
        {
          id: "orders",
          label: "My Orders",
          icon: FaBox,
          badge: null,
        },
      ],
    },
    {
      title: "ACCOUNT SETTINGS",
      items: [
        {
          id: "profile",
          label: "Personal Information",
          icon: FaUser,
        },
        {
          id: "addresses",
          label: "Manage Addresses",
          icon: FaMapMarkerAlt,
        },
        {
          id: "password",
          label: "Change Password",
          icon: FaLock,
        },
      ],
    },
    {
      title: "PAYMENTS",
      items: [
        {
          id: "wallet",
          label: "Royal Silks Wallet",
          icon: FaWallet,
        },
      ],
    },
    {
      title: "MY STUFF",
      items: [
        {
          id: "wishlist",
          label: "My Wishlist",
          icon: FaHeart,
        },
      ],
    },
  ];

  return (
    <aside className="profile-modern-sidebar" aria-label="Account navigation">
      {/* User Quick Info Card */}
      <div className="profile-user-card">
        <div className="profile-avatar-circle" aria-hidden="true">
          {getInitials(user?.name)}
        </div>
        <div className="profile-user-meta">
          <span className="profile-greeting">Welcome back,</span>
          <h2 className="profile-username" title={user?.name || "Customer"}>
            {user?.name || "Customer"}
          </h2>
          {user?.email && (
            <span className="profile-user-email" title={user.email}>
              {user.email}
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="profile-sidebar-nav">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="profile-nav-group">
            <h3 className="profile-nav-heading">{section.title}</h3>
            <ul className="profile-nav-list">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`profile-nav-btn ${isActive ? "active" : ""}`}
                      onClick={() => onSelectTab(item.id)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="profile-nav-icon-wrap">
                        <IconComponent />
                      </span>
                      <span className="profile-nav-label">{item.label}</span>
                      <FaChevronRight className="profile-nav-chevron" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Logout Action */}
        <div className="profile-nav-group logout-group">
          <button
            type="button"
            className="profile-nav-btn logout-btn"
            onClick={onRequestLogout}
          >
            <span className="profile-nav-icon-wrap">
              <FaSignOutAlt />
            </span>
            <span className="profile-nav-label">Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
