import fs from 'fs';
import path from 'path';

async function testRoutes() {
  const routeFiles = [
    '../routes/user.js',
    '../routes/ProductRoute.js',
    '../routes/adminRoutes.js',
    '../routes/vendorRoutes.js',
    '../routes/categoryRoutes.js',
    '../routes/cartRoutes.js',
    '../routes/brandRoutes.js',
    '../routes/orderRoute.js',
    '../routes/comboRoutes.js',
    '../routes/searchRoutes.js',
    '../routes/dashboardRoutes.js',
    '../routes/dealsRoute.js',
    '../routes/productVariant.js',
    '../routes/blogRoutes.js',
    '../routes/notificationRoute.js'
  ];

  for (const rf of routeFiles) {
    try {
      const mod = await import(rf);
      const router = mod.default;
      if (!router) {
        console.error(`ERROR: ${rf} has no default export`);
        continue;
      }
      if (!router.stack) {
        console.warn(`WARN: ${rf} router has no stack`);
        continue;
      }
      let errCount = 0;
      for (const layer of router.stack) {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          const path = layer.route.path;
          for (const handler of layer.route.stack) {
            if (!handler.handle || typeof handler.handle !== 'function') {
              console.error(`BROKEN HANDLER: ${rf} ${methods} ${path}`);
              errCount++;
            }
          }
        }
      }
      if (errCount === 0) {
        console.log(`OK: ${rf} (${router.stack.length} routes)`);
      }
    } catch (err) {
      console.error(`IMPORT FAILED: ${rf}`, err.message);
    }
  }
}

testRoutes();
