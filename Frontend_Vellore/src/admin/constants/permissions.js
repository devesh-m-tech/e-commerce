export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  VENDORS: 'vendors',
  BRANDS: 'brands',
  BLOG: 'blog',
  TRANSACTION_HISTORY: 'transaction-history',
  DEALS: 'deals',
  ORDERS: 'orders',
  EXCHANGES: 'exchanges',
  REPORTS: 'reports',
  USERS: 'users',
  SHIPPING: 'shipping',
  ADMIN_USERS: 'admin-users',
  COMBO_OFFERS: 'combo-offers',
  SETTINGS: 'settings',
};

export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete'
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_STAFF: 'sales_staff',
  INVENTORY_STAFF: 'inventory_staff',
  EXCHANGE_STAFF: 'exchange_staff',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin (Owner)',
  admin: 'Store Admin',
  sales_staff: 'Sales Staff',
  inventory_staff: 'Inventory Staff',
  exchange_staff: 'Exchange Staff',
};

export const getRoleDefaultPermissions = (role) => {
  const allPerms = Object.values(PERMISSIONS).reduce((acc, p) => ({
    ...acc,
    [p]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE]
  }), {});

  switch (role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return allPerms;

    case ROLES.SALES_STAFF:
      return {
        [PERMISSIONS.DASHBOARD]: [ACTIONS.READ],
        [PERMISSIONS.ORDERS]: [ACTIONS.READ, ACTIONS.WRITE],
        [PERMISSIONS.TRANSACTION_HISTORY]: [ACTIONS.READ],
        [PERMISSIONS.REPORTS]: [ACTIONS.READ],
      };

    case ROLES.INVENTORY_STAFF:
      return {
        [PERMISSIONS.DASHBOARD]: [ACTIONS.READ],
        [PERMISSIONS.PRODUCTS]: [ACTIONS.READ, ACTIONS.WRITE],
        [PERMISSIONS.CATEGORIES]: [ACTIONS.READ, ACTIONS.WRITE],
        [PERMISSIONS.BRANDS]: [ACTIONS.READ, ACTIONS.WRITE],
        [PERMISSIONS.REPORTS]: [ACTIONS.READ],
      };

    case ROLES.EXCHANGE_STAFF:
      return {
        [PERMISSIONS.DASHBOARD]: [ACTIONS.READ],
        [PERMISSIONS.EXCHANGES]: [ACTIONS.READ, ACTIONS.WRITE],
        [PERMISSIONS.ORDERS]: [ACTIONS.READ],
        [PERMISSIONS.REPORTS]: [ACTIONS.READ],
      };

    default:
      return allPerms;
  }
};