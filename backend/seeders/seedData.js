const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { connectDB } = require('../config/db');

dotenv.config();

const seedData = async (isAuto = false) => {
  try {
    if (!isAuto) {
      await connectDB();
    }

    console.log('🌱 Starting Sadguru Mart Demo Data Seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Shop.deleteMany();
    await Product.deleteMany();
    await Customer.deleteMany();
    await Supplier.deleteMany();
    await Sale.deleteMany();
    await Purchase.deleteMany();
    await Expense.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();

    console.log('🧹 Cleaned previous database collections.');

    // 1. Create Admin Account
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@sadgurumart.com',
      password: 'Admin@123',
      phone: '+91 98230 11223',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });

    // 2. Create Demo Shop
    const demoShop = await Shop.create({
      name: 'Sadguru Kirana & General Store',
      email: 'shopkeeper@sadgurumart.com',
      phone: '+91 98500 44556',
      address: 'Shop No. 4, Market Yard, Station Road, Pune, Maharashtra - 411001',
      gstNumber: '27AABCS1429B1Z8',
      currency: 'INR',
      currencySymbol: '₹',
      status: 'active',
    });

    // 3. Create Demo Shopkeeper
    const demoShopkeeper = await User.create({
      name: 'Santosh Yelpale',
      email: 'shopkeeper@sadgurumart.com',
      password: 'Shop@123',
      phone: '+91 98500 44556',
      role: 'shopkeeper',
      shop: demoShop._id,
      isActive: true,
      lastLogin: new Date(),
    });

    demoShop.owner = demoShopkeeper._id;
    await demoShop.save();

    // 4. Create 2nd Demo Shopkeeper (to test Multi-Tenant Data Isolation!)
    const demoShop2 = await Shop.create({
      name: 'Shree Ganesh Supermarket',
      email: 'ganesh@sadgurumart.com',
      phone: '+91 94220 77889',
      address: 'Near Bus Stand, Shivaji Chowk, Kolhapur, Maharashtra',
      gstNumber: '27AABCS9988C1Z1',
      currency: 'INR',
      currencySymbol: '₹',
      status: 'active',
    });

    const demoShopkeeper2 = await User.create({
      name: 'Ganesh Patil',
      email: 'ganesh@sadgurumart.com',
      password: 'Shop@123',
      phone: '+91 94220 77889',
      role: 'shopkeeper',
      shop: demoShop2._id,
      isActive: true,
      lastLogin: new Date(),
    });

    demoShop2.owner = demoShopkeeper2._id;
    await demoShop2.save();

    // 5. Create Suppliers for Shop 1
    const suppliers = await Supplier.insertMany([
      {
        shop: demoShop._id,
        name: 'Rajesh Trading Co.',
        company: 'Rajesh Agro Commodities Pvt Ltd',
        phone: '+91 98221 44550',
        email: 'rajeshtrading@gmail.com',
        address: 'APMC Market Yard, Gultekdi, Pune',
        productsSupplied: 'Grains, Rice, Wheat, Sugar, Pulses',
        gstNumber: '27AAECR1234F1Z5',
      },
      {
        shop: demoShop._id,
        name: 'Hindustan Consumer Supply',
        company: 'HUL Regional Distributors',
        phone: '+91 98223 88990',
        email: 'hul.distributor.pune@gmail.com',
        address: 'MIDC Bhosari, Pune',
        productsSupplied: 'Tea, Soaps, Detergent, Shampoo, Personal Care',
        gstNumber: '27AABCH4567G1Z8',
      },
      {
        shop: demoShop._id,
        name: 'Adani Wilmar & FMCG Depot',
        company: 'Fortune Foods Agency',
        phone: '+91 98229 11002',
        email: 'fortunefoods.agency@gmail.com',
        address: 'Hadapsar Industrial Estate, Pune',
        productsSupplied: 'Cooking Oil, Mustard Oil, Basmati Rice',
        gstNumber: '27AABCA7890H1Z2',
      },
      {
        shop: demoShop._id,
        name: 'Parle & Britannia Agencies',
        company: 'Shree Balaji Confectionery Dist.',
        phone: '+91 98224 55667',
        email: 'balajibiscuits@gmail.com',
        address: 'Raviwar Peth, Pune',
        productsSupplied: 'Biscuits, Wafers, Bakery, Snacks',
        gstNumber: '27AABCS3344J1Z9',
      },
    ]);

    // 6. Create Customers for Shop 1
    const customers = await Customer.insertMany([
      {
        shop: demoShop._id,
        name: 'Ramesh Kulkarni',
        phone: '+91 98901 12345',
        email: 'ramesh.kulkarni@gmail.com',
        address: 'Flat 302, Sai Residency, Model Colony, Pune',
        totalPurchases: 14500,
        outstandingBalance: 0,
        notes: 'Regular monthly grocery buyer',
      },
      {
        shop: demoShop._id,
        name: 'Sunita Deshmukh',
        phone: '+91 98902 23456',
        email: 'sunita.deshmukh@gmail.com',
        address: 'Row House 12, Green Acres, Aundh, Pune',
        totalPurchases: 8200,
        outstandingBalance: 0,
        notes: 'Prefers UPI payment',
      },
      {
        shop: demoShop._id,
        name: 'Mahesh Shinde',
        phone: '+91 98903 34567',
        email: 'mahesh.shinde@gmail.com',
        address: '45/B Narayan Peth, Pune',
        totalPurchases: 22400,
        outstandingBalance: 500,
        notes: 'Monthly credit account',
      },
      {
        shop: demoShop._id,
        name: 'Pooja Joshi',
        phone: '+91 98904 45678',
        email: 'pooja.joshi@gmail.com',
        address: 'B-10, Swapnashilp Apts, Kothrud, Pune',
        totalPurchases: 6300,
        outstandingBalance: 0,
        notes: 'Buys organic items',
      },
      {
        shop: demoShop._id,
        name: 'Anand Shirodkar',
        phone: '+91 98905 56789',
        email: 'anand.shirodkar@gmail.com',
        address: '77 Sadashiv Peth, Pune',
        totalPurchases: 11800,
        outstandingBalance: 0,
        notes: 'Wholesale inquiry for small canteen',
      },
    ]);

    // 7. Create Products for Shop 1 (Realistic Indian Grocery & FMCG items)
    const productsData = [
      {
        shop: demoShop._id,
        name: 'Daawat Rozana Basmati Rice',
        sku: 'RIC-001',
        category: 'Grains & Rice',
        brand: 'Daawat',
        purchasePrice: 85,
        sellingPrice: 110,
        currentStock: 120,
        minStockLevel: 25,
        unit: 'kg',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        description: 'Long grain aromatic basmati rice for daily cooking',
      },
      {
        shop: demoShop._id,
        name: 'Aashirvaad Superior Sharbati Atta',
        sku: 'ATT-002',
        category: 'Flour & Grains',
        brand: 'ITC Aashirvaad',
        purchasePrice: 42,
        sellingPrice: 52,
        currentStock: 80,
        minStockLevel: 20,
        unit: 'kg',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        description: '100% pure whole wheat MP Sharbati atta',
      },
      {
        shop: demoShop._id,
        name: 'Madhur Pure & Hygienic Sugar',
        sku: 'SUG-003',
        category: 'Sugar & Salt',
        brand: 'Madhur',
        purchasePrice: 38,
        sellingPrice: 46,
        currentStock: 95,
        minStockLevel: 30,
        unit: 'kg',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        description: 'Sulphur-free sparkling white crystal sugar',
      },
      {
        shop: demoShop._id,
        name: 'Tata Salt Vacuum Evaporated Iodized',
        sku: 'SLT-004',
        category: 'Sugar & Salt',
        brand: 'Tata',
        purchasePrice: 22,
        sellingPrice: 28,
        currentStock: 45,
        minStockLevel: 15,
        unit: 'pack',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        description: 'Desh Ka Namak - 1kg iodized salt pack',
      },
      {
        shop: demoShop._id,
        name: 'Fortune Sunlite Refined Sunflower Oil (1L)',
        sku: 'OIL-005',
        category: 'Edible Oils',
        brand: 'Fortune',
        purchasePrice: 115,
        sellingPrice: 138,
        currentStock: 65,
        minStockLevel: 15,
        unit: 'litre',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        description: 'Rich in Vitamin E & healthy light cooking oil',
      },
      {
        shop: demoShop._id,
        name: 'Gemini Pure Groundnut Oil (1L Pouch)',
        sku: 'OIL-006',
        category: 'Edible Oils',
        brand: 'Gemini',
        purchasePrice: 160,
        sellingPrice: 190,
        currentStock: 4, // LOW STOCK TRIGGER!
        minStockLevel: 10,
        unit: 'litre',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        description: 'Traditional aromatic groundnut oil',
      },
      {
        shop: demoShop._id,
        name: 'Tata Tea Premium Desh Ki Chai (500g)',
        sku: 'TEA-007',
        category: 'Beverages',
        brand: 'Tata Tea',
        purchasePrice: 230,
        sellingPrice: 280,
        currentStock: 30,
        minStockLevel: 8,
        unit: 'pack',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Rich blend of strong CTC tea grains and long leaves',
      },
      {
        shop: demoShop._id,
        name: 'Wagh Bakri Leaf Tea (250g)',
        sku: 'TEA-008',
        category: 'Beverages',
        brand: 'Wagh Bakri',
        purchasePrice: 135,
        sellingPrice: 160,
        currentStock: 18,
        minStockLevel: 5,
        unit: 'pack',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Strong authentic Gujarati leaf tea',
      },
      {
        shop: demoShop._id,
        name: 'Parle-G Gold Biscuits (Family Pack)',
        sku: 'BSC-009',
        category: 'Snacks & Biscuits',
        brand: 'Parle',
        purchasePrice: 24,
        sellingPrice: 30,
        currentStock: 110,
        minStockLevel: 25,
        unit: 'pack',
        supplier: suppliers[3]._id,
        supplierName: suppliers[3].name,
        description: 'Indias favorite glucose biscuit family size',
      },
      {
        shop: demoShop._id,
        name: 'Britannia Good Day Butter Cookies (200g)',
        sku: 'BSC-010',
        category: 'Snacks & Biscuits',
        brand: 'Britannia',
        purchasePrice: 32,
        sellingPrice: 40,
        currentStock: 50,
        minStockLevel: 15,
        unit: 'pack',
        supplier: suppliers[3]._id,
        supplierName: suppliers[3].name,
        description: 'Crunchy butter smile cookies',
      },
      {
        shop: demoShop._id,
        name: 'Dettol Original Germ Protection Soap (Pack of 4)',
        sku: 'SOP-011',
        category: 'Personal Care',
        brand: 'Reckitt Dettol',
        purchasePrice: 140,
        sellingPrice: 175,
        currentStock: 22,
        minStockLevel: 8,
        unit: 'pack',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Antibacterial bath soap with trusted pine fragrance',
      },
      {
        shop: demoShop._id,
        name: 'Lifebuoy Total 10 Handwash (750ml Refill)',
        sku: 'SOP-012',
        category: 'Personal Care',
        brand: 'HUL Lifebuoy',
        purchasePrice: 95,
        sellingPrice: 125,
        currentStock: 0, // OUT OF STOCK TRIGGER!
        minStockLevel: 6,
        unit: 'pack',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Anti-germ protective liquid handwash pouch',
      },
      {
        shop: demoShop._id,
        name: 'Head & Shoulders Cool Menthol Shampoo (340ml)',
        sku: 'SHM-013',
        category: 'Personal Care',
        brand: 'P&G Head & Shoulders',
        purchasePrice: 240,
        sellingPrice: 310,
        currentStock: 14,
        minStockLevel: 5,
        unit: 'bottle',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Anti-dandruff refreshing menthol shampoo bottle',
      },
      {
        shop: demoShop._id,
        name: 'Surf Excel Quick Wash Detergent Powder (1kg)',
        sku: 'DET-014',
        category: 'Cleaning & Household',
        brand: 'HUL Surf Excel',
        purchasePrice: 125,
        sellingPrice: 155,
        currentStock: 40,
        minStockLevel: 10,
        unit: 'kg',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        description: 'Quick stain removal laundry detergent powder',
      },
      {
        shop: demoShop._id,
        name: 'Tata Sampann Unpolished Toor Dal (1kg)',
        sku: 'PLS-015',
        category: 'Pulses & Dals',
        brand: 'Tata Sampann',
        purchasePrice: 148,
        sellingPrice: 180,
        currentStock: 35,
        minStockLevel: 10,
        unit: 'kg',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        description: 'Rich in natural protein, water-unpolished toor dal',
      },
    ];

    const products = await Product.insertMany(productsData);

    // Also add sample products for Shop 2 (to verify isolation)
    await Product.insertMany([
      {
        shop: demoShop2._id,
        name: 'Ganesh Premium Kolam Rice (25kg)',
        sku: 'KOLAM-01',
        category: 'Grains & Rice',
        brand: 'Kolam Gold',
        purchasePrice: 1400,
        sellingPrice: 1750,
        currentStock: 20,
        minStockLevel: 5,
        unit: 'bag',
      },
      {
        shop: demoShop2._id,
        name: 'Gokul Pure Cow Ghee (1 Litre Tin)',
        sku: 'GHEE-01',
        category: 'Dairy & Ghee',
        brand: 'Gokul Kolhapur',
        purchasePrice: 580,
        sellingPrice: 690,
        currentStock: 15,
        minStockLevel: 3,
        unit: 'can',
      },
    ]);

    // 8. Create Purchases for Shop 1
    const purchaseRecords = [
      {
        shop: demoShop._id,
        invoiceNumber: 'PUR-260101-001',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            sku: products[0].sku,
            quantity: 100,
            unit: 'kg',
            purchasePrice: 85,
            totalAmount: 8500,
          },
          {
            product: products[1]._id,
            name: products[1].name,
            sku: products[1].sku,
            quantity: 80,
            unit: 'kg',
            purchasePrice: 42,
            totalAmount: 3360,
          },
          {
            product: products[2]._id,
            name: products[2].name,
            sku: products[2].sku,
            quantity: 100,
            unit: 'kg',
            purchasePrice: 38,
            totalAmount: 3800,
          },
        ],
        totalAmount: 15660,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer',
        purchaseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        notes: 'Monthly bulk grains delivery',
      },
      {
        shop: demoShop._id,
        invoiceNumber: 'PUR-260105-002',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        items: [
          {
            product: products[4]._id,
            name: products[4].name,
            sku: products[4].sku,
            quantity: 50,
            unit: 'litre',
            purchasePrice: 115,
            totalAmount: 5750,
          },
        ],
        totalAmount: 5750,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Cooking oil cartons',
      },
    ];

    await Purchase.insertMany(purchaseRecords);

    // 9. Create Historical Sales (spanning last 6 days + today)
    const salesRecords = [
      // 5 days ago
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260814-0001',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            sku: products[0].sku,
            quantity: 10,
            unit: 'kg',
            purchasePrice: 85,
            sellingPrice: 110,
            totalCost: 850,
            totalRevenue: 1100,
            profit: 250,
          },
          {
            product: products[4]._id,
            name: products[4].name,
            sku: products[4].sku,
            quantity: 2,
            unit: 'litre',
            purchasePrice: 115,
            sellingPrice: 138,
            totalCost: 230,
            totalRevenue: 276,
            profit: 46,
          },
        ],
        totalAmount: 1376,
        totalCost: 1080,
        totalProfit: 296,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      // 4 days ago
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260815-0002',
        customer: customers[1]._id,
        customerName: customers[1].name,
        customerPhone: customers[1].phone,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            sku: products[1].sku,
            quantity: 10,
            unit: 'kg',
            purchasePrice: 42,
            sellingPrice: 52,
            totalCost: 420,
            totalRevenue: 520,
            profit: 100,
          },
          {
            product: products[6]._id,
            name: products[6].name,
            sku: products[6].sku,
            quantity: 2,
            unit: 'pack',
            purchasePrice: 230,
            sellingPrice: 280,
            totalCost: 460,
            totalRevenue: 560,
            profit: 100,
          },
        ],
        totalAmount: 1080,
        totalCost: 880,
        totalProfit: 200,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      // 3 days ago
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260816-0003',
        customer: customers[2]._id,
        customerName: customers[2].name,
        customerPhone: customers[2].phone,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            sku: products[0].sku,
            quantity: 20,
            unit: 'kg',
            purchasePrice: 85,
            sellingPrice: 110,
            totalCost: 1700,
            totalRevenue: 2200,
            profit: 500,
          },
          {
            product: products[14]._id,
            name: products[14].name,
            sku: products[14].sku,
            quantity: 5,
            unit: 'kg',
            purchasePrice: 148,
            sellingPrice: 180,
            totalCost: 740,
            totalRevenue: 900,
            profit: 160,
          },
        ],
        totalAmount: 3100,
        totalCost: 2440,
        totalProfit: 660,
        paymentMethod: 'Card',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      // 2 days ago
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260817-0004',
        customer: customers[3]._id,
        customerName: customers[3].name,
        customerPhone: customers[3].phone,
        items: [
          {
            product: products[8]._id,
            name: products[8].name,
            sku: products[8].sku,
            quantity: 10,
            unit: 'pack',
            purchasePrice: 24,
            sellingPrice: 30,
            totalCost: 240,
            totalRevenue: 300,
            profit: 60,
          },
          {
            product: products[10]._id,
            name: products[10].name,
            sku: products[10].sku,
            quantity: 3,
            unit: 'pack',
            purchasePrice: 140,
            sellingPrice: 175,
            totalCost: 420,
            totalRevenue: 525,
            profit: 105,
          },
        ],
        totalAmount: 825,
        totalCost: 660,
        totalProfit: 165,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      // Yesterday
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260818-0005',
        customer: customers[4]._id,
        customerName: customers[4].name,
        customerPhone: customers[4].phone,
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            sku: products[2].sku,
            quantity: 10,
            unit: 'kg',
            purchasePrice: 38,
            sellingPrice: 46,
            totalCost: 380,
            totalRevenue: 460,
            profit: 80,
          },
          {
            product: products[13]._id,
            name: products[13].name,
            sku: products[13].sku,
            quantity: 2,
            unit: 'kg',
            purchasePrice: 125,
            sellingPrice: 155,
            totalCost: 250,
            totalRevenue: 310,
            profit: 60,
          },
        ],
        totalAmount: 770,
        totalCost: 630,
        totalProfit: 140,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      // Today Sale 1
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260819-0006',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            sku: products[0].sku,
            quantity: 5,
            unit: 'kg',
            purchasePrice: 85,
            sellingPrice: 110,
            totalCost: 425,
            totalRevenue: 550,
            profit: 125,
          },
          {
            product: products[2]._id,
            name: products[2].name,
            sku: products[2].sku,
            quantity: 5,
            unit: 'kg',
            purchasePrice: 38,
            sellingPrice: 46,
            totalCost: 190,
            totalRevenue: 230,
            profit: 40,
          },
          {
            product: products[3]._id,
            name: products[3].name,
            sku: products[3].sku,
            quantity: 2,
            unit: 'pack',
            purchasePrice: 22,
            sellingPrice: 28,
            totalCost: 44,
            totalRevenue: 56,
            profit: 12,
          },
        ],
        totalAmount: 836,
        totalCost: 659,
        totalProfit: 177,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        date: new Date(),
      },
      // Today Sale 2
      {
        shop: demoShop._id,
        invoiceNumber: 'INV-260819-0007',
        customerName: 'Walk-in Customer',
        customerPhone: '+91 97654 32100',
        items: [
          {
            product: products[4]._id,
            name: products[4].name,
            sku: products[4].sku,
            quantity: 3,
            unit: 'litre',
            purchasePrice: 115,
            sellingPrice: 138,
            totalCost: 345,
            totalRevenue: 414,
            profit: 69,
          },
          {
            product: products[6]._id,
            name: products[6].name,
            sku: products[6].sku,
            quantity: 1,
            unit: 'pack',
            purchasePrice: 230,
            sellingPrice: 280,
            totalCost: 230,
            totalRevenue: 280,
            profit: 50,
          },
          {
            product: products[9]._id,
            name: products[9].name,
            sku: products[9].sku,
            quantity: 4,
            unit: 'pack',
            purchasePrice: 32,
            sellingPrice: 40,
            totalCost: 128,
            totalRevenue: 160,
            profit: 32,
          },
        ],
        totalAmount: 854,
        totalCost: 703,
        totalProfit: 151,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        date: new Date(),
      },
    ];

    await Sale.insertMany(salesRecords);

    // 10. Create Expenses for Shop 1
    const expenseRecords = [
      {
        shop: demoShop._id,
        title: 'Monthly Shop Rent (August)',
        category: 'Rent',
        amount: 8500,
        paymentMethod: 'Bank Transfer',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        description: 'Paid to shop landlord Mr. Kulkarni',
      },
      {
        shop: demoShop._id,
        title: 'MSEDCL Electricity Bill',
        category: 'Electricity',
        amount: 1450,
        paymentMethod: 'UPI',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        description: 'Monthly commercial meter power bill',
      },
      {
        shop: demoShop._id,
        title: 'Shop Helper / Boy Salary',
        category: 'Salary',
        amount: 6000,
        paymentMethod: 'Cash',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        description: 'Monthly advance for helper Rahul',
      },
      {
        shop: demoShop._id,
        title: 'Tempo Goods Transport Charge',
        category: 'Transportation',
        amount: 650,
        paymentMethod: 'Cash',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Transport from Market Yard wholesale godown',
      },
      {
        shop: demoShop._id,
        title: 'Packaging Bags & Carry Bags',
        category: 'Packaging',
        amount: 400,
        paymentMethod: 'UPI',
        date: new Date(),
        description: 'Cloth and bio-degradable grocery carry bags',
      },
      {
        shop: demoShop._id,
        title: 'Daily Tea & Refreshments',
        category: 'Tea & Refreshments',
        amount: 80,
        paymentMethod: 'Cash',
        date: new Date(),
        description: 'Evening tea for staff & visitors',
      },
    ];

    await Expense.insertMany(expenseRecords);

    // 11. Create Sample Notifications
    await Notification.insertMany([
      {
        shop: demoShop._id,
        title: 'Out of Stock Alert ❌',
        message: 'Lifebuoy Total 10 Handwash (750ml Refill) is completely out of stock!',
        type: 'danger',
        isRead: false,
        link: '/dashboard/inventory',
      },
      {
        shop: demoShop._id,
        title: 'Low Stock Warning ⚠️',
        message: 'Gemini Groundnut Oil has only 4 litres left (Minimum required: 10 litres).',
        type: 'warning',
        isRead: false,
        link: '/dashboard/inventory',
      },
      {
        shop: demoShop._id,
        title: 'New Stock Received 📦',
        message: 'Purchase order PUR-260105-002 from Adani Wilmar & FMCG Depot added.',
        type: 'success',
        isRead: true,
        link: '/dashboard/purchases',
      },
      {
        shop: demoShop._id,
        title: 'Daily Performance 💰',
        message: "Great sales today! Today's revenue crossed ₹1,690.",
        type: 'info',
        isRead: true,
        link: '/dashboard/sales',
      },
    ]);

    // 12. Create Activity Logs
    await ActivityLog.insertMany([
      {
        user: demoShopkeeper._id,
        shop: demoShop._id,
        userName: demoShopkeeper.name,
        userEmail: demoShopkeeper.email,
        action: 'Shop Initialized with Demo Grocery Data',
        module: 'System',
        details: '15 grocery products, 4 suppliers, 5 customers, initial sales recorded',
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        action: 'Admin System Health Check Passed',
        module: 'Admin',
        details: 'Multi-tenant database initialized',
      },
    ]);

    console.log('✅ Demo Data Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Credentials Summary:');
    console.log('👑 Admin Account:');
    console.log('   Email: admin@sadgurumart.com');
    console.log('   Pass:  Admin@123');
    console.log('🏪 Shopkeeper 1 (Sadguru Kirana & General Store):');
    console.log('   Email: shopkeeper@sadgurumart.com');
    console.log('   Pass:  Shop@123');
    console.log('🏪 Shopkeeper 2 (Shree Ganesh Supermarket):');
    console.log('   Email: ganesh@sadgurumart.com');
    console.log('   Pass:  Shop@123');
    console.log('----------------------------------------------------');

    if (!isAuto) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    if (!isAuto) {
      process.exit(1);
    }
  }
};

// Check if running directly
if (require.main === module) {
  seedData(false);
}

module.exports = seedData;
