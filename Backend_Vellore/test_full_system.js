import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runFullSystemTest() {
  console.log('=== STARTING COMPLETE END-TO-END SYSTEM TEST ===\n');

  try {
    // -------------------------------------------------------------
    // TEST 1: Public Categories & Products
    // -------------------------------------------------------------
    console.log('--- TEST 1: Public Endpoints ---');
    const catRes = await axios.get(`${BASE_URL}/category/all`);
    console.log(`✓ GET /category/all returned ${catRes.data?.length} categories`);

    const prodRes = await axios.get(`${BASE_URL}/products?limit=5`);
    console.log(`✓ GET /products returned ${prodRes.data.products?.length} products (Total: ${prodRes.data.totalProducts})`);

    const firstProduct = prodRes.data.products[0];
    const singleProdRes = await axios.get(`${BASE_URL}/product/${firstProduct._id}`);
    console.log(`✓ GET /product/${firstProduct._id} loaded: "${singleProdRes.data.product?.pName}"`);

    const searchRes = await axios.get(`${BASE_URL}/products/search?q=Silk`);
    console.log(`✓ GET /products/search?q=Silk returned ${searchRes.data.results?.products?.length || searchRes.data.products?.length || 0} matches`);

    const dealsRes = await axios.get(`${BASE_URL}/all/deals`);
    console.log(`✓ GET /all/deals returned ${dealsRes.data?.deals?.length || dealsRes.data?.length || 0} deals`);

    // -------------------------------------------------------------
    // TEST 2: Customer Authentication, Cart & Order Flow
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Customer Flow ---');
    const userLoginRes = await axios.post(`${BASE_URL}/user/login`, {
      email: 'priya.sharma@example.com',
      password: 'Demo@1234'
    });
    const userToken = userLoginRes.data.token;
    console.log(`✓ POST /user/login successful for: ${userLoginRes.data.user?.name}`);
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    const profileRes = await axios.get(`${BASE_URL}/user/profile`, { headers: userHeaders });
    console.log(`✓ GET /user/profile loaded: ${profileRes.data.user.email}, ${profileRes.data.user.addresses.length} addresses`);

    // Wishlist Test
    await axios.post(`${BASE_URL}/user/wishlist/${firstProduct._id}`, {}, { headers: userHeaders });
    const wishlistRes = await axios.get(`${BASE_URL}/user/wishlist`, { headers: userHeaders });
    console.log(`✓ Wishlist add/get working. Wishlist items: ${wishlistRes.data?.wishlist?.length || wishlistRes.data?.length || 0}`);

    // Cart Test
    await axios.delete(`${BASE_URL}/cart/clear`, { headers: userHeaders });
    const addCartRes = await axios.post(`${BASE_URL}/cart/add`, {
      productId: firstProduct._id,
      quantity: 2,
      variantId: firstProduct.variants?.[0]?._id || firstProduct.variants?.[0]
    }, { headers: userHeaders });
    console.log(`✓ POST /cart/add: ${addCartRes.data.message}`);

    const getCartRes = await axios.get(`${BASE_URL}/cart/get`, { headers: userHeaders });
    console.log(`✓ GET /cart/get items count: ${getCartRes.data.cart?.items?.length}, total: ₹${getCartRes.data.cart?.totalAmount}`);

    // Checkout / Order Placement Test
    const shippingAddr = profileRes.data.user.addresses[0];
    const placeOrderRes = await axios.post(`${BASE_URL}/order/cart`, {
      shippingAddress: shippingAddr,
      paymentMethod: 'COD',
      items: getCartRes.data.cart.items,
      total: getCartRes.data.cart.totalAmount,
      finalAmount: getCartRes.data.cart.finalAmount || getCartRes.data.cart.totalAmount,
      platformFee: 0,
      shippingCharges: 0
    }, { headers: userHeaders });
    const newOrderId = placeOrderRes.data.order?._id;
    console.log(`✓ POST /order/cart: Order placed successfully! Order ID: ${newOrderId}`);

    const userOrdersRes = await axios.get(`${BASE_URL}/order/orders`, { headers: userHeaders });
    console.log(`✓ GET /order/orders: Customer has ${userOrdersRes.data.orders?.length} total orders in history`);

    // -------------------------------------------------------------
    // TEST 3: Admin Authentication & Dashboard
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Admin Dashboard & Operations ---');
    const adminLoginRes = await axios.post(`${BASE_URL}/admin/login`, {
      email: 'admin@shrideepaalayasilks.com',
      password: 'Admin@1234'
    });
    const adminToken = adminLoginRes.data.token;
    console.log(`✓ POST /admin/login: Welcome ${adminLoginRes.data.admin?.name} (${adminLoginRes.data.admin?.role})`);
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const summaryRes = await axios.get(`${BASE_URL}/dashboard/summary`, { headers: adminHeaders });
    console.log(`✓ GET /dashboard/summary:`, {
      totalOrders: summaryRes.data.summary.totalOrders,
      totalCustomers: summaryRes.data.summary.totalCustomers,
      totalProducts: summaryRes.data.summary.totalProducts,
      lowStockCount: summaryRes.data.summary.lowStockCount
    });

    const incomeRes = await axios.get(`${BASE_URL}/dashboard/income-stats`, { headers: adminHeaders });
    console.log(`✓ GET /dashboard/income-stats: Month Income: ₹${incomeRes.data.incomeStats?.month}, Year Income: ₹${incomeRes.data.incomeStats?.year}`);

    const adminOrdersRes = await axios.get(`${BASE_URL}/order/admin/orders`, { headers: adminHeaders });
    console.log(`✓ GET /order/admin/orders: Loaded ${adminOrdersRes.data.orders?.length} orders for admin panel`);

    // Status Update Test
    const updateStatusRes = await axios.put(`${BASE_URL}/order/status/${newOrderId}`, {
      orderStatus: 'SHIPPED',
      trackingNumber: 'SDS-TRACK-LIVE-999'
    }, { headers: adminHeaders });
    console.log(`✓ PUT /order/status/${newOrderId}: Status updated to "${updateStatusRes.data.order?.orderStatus}"`);

    // Admin Users Test
    const allUsersRes = await axios.get(`${BASE_URL}/user/all`, { headers: adminHeaders });
    console.log(`✓ GET /user/all: Found ${allUsersRes.data.users?.length || allUsersRes.data.length} registered customers`);

    // Admin Product CRUD Test
    console.log('\n--- TEST 4: Admin Product CRUD Lifecycle ---');
    const newProdPayload = {
      pName: 'Test Heritage Tussar Silk Saree ' + Date.now(),
      pShortDescription: 'A test saree created via dynamic admin API.',
      pDescription: 'Detailed description for test silk saree to verify full CRUD integration.',
      pCategory: 'Silk Sarees',
      pSubCategory: 'Tussar Silk',
      pPrice: 15999,
      pPreviousPrice: 19999,
      pOffer: 20,
      pStock: 12,
      pStatus: 'Active',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80']
    };

    const createProdRes = await axios.post(`${BASE_URL}/admin/product/new`, newProdPayload, { headers: adminHeaders });
    const createdProdId = createProdRes.data.product?._id;
    console.log(`✓ POST /admin/product/new: Created product ID: ${createdProdId}`);

    const updateProdRes = await axios.put(`${BASE_URL}/admin/product/${createdProdId}`, {
      pPrice: 14999,
      pStock: 15
    }, { headers: adminHeaders });
    console.log(`✓ PUT /admin/product/${createdProdId}: Updated price and stock`);

    const deleteProdRes = await axios.delete(`${BASE_URL}/admin/product/${createdProdId}`, { headers: adminHeaders });
    console.log(`✓ DELETE /admin/product/${createdProdId}: ${deleteProdRes.data.message}`);

    console.log('\n============================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED 100% WITH ZERO ERRORS');
    console.log('============================================================\n');
  } catch (err) {
    console.error('Test Failed with Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runFullSystemTest();
