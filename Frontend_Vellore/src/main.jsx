// Main entry dispatcher: routes to Storefront or Admin Portal
// to ensure complete styling and bundle isolation between portals.
const isAdmin = window.location.pathname.startsWith('/admin');

if (isAdmin) {
  import('./admin/main.jsx');
} else {
  import('./storefrontEntry.jsx');
}
