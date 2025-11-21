const {
  User,
  Category,
  Product,
  ChatGroup,
  GroupMember,
  UserMessage,
  PaymentStatus,
} = require('./models');

const ensureUser = async (seed) => {
  const [user] = await User.findOrCreate({
    where: { email: seed.email },
    defaults: seed,
  });
  return user;
};

const ensureCategory = async (name) => {
  const [category] = await Category.findOrCreate({
    where: { name },
  });
  return category;
};

const ensureProduct = async (seed) => {
  const [product] = await Product.findOrCreate({
    where: { name: seed.name },
    defaults: seed,
  });
  return product;
};

const ensureGroup = async (seed) => {
  const [group] = await ChatGroup.findOrCreate({
    where: { name: seed.name },
    defaults: seed,
  });
  return group;
};

const ensurePaymentStatus = async (paymentStatusName) => {
  const [status] = await PaymentStatus.findOrCreate({
    where: { paymentStatusName },
  });
  return status;
};

const seedDatabase = async () => {
  await ensurePaymentStatus('Pending');
  await ensurePaymentStatus('Paid');

  const admin = await ensureUser({
    name: 'Demo Admin',
    email: 'demo.admin@cartsystem.dev',
    phone: '123456789',
    password: 'admin123',
    status: true,
    role: 'admin',
    loggedIn: new Date(),
  });

  const userA = await ensureUser({
    name: 'Alice Demo',
    email: 'alice.demo@cartsystem.dev',
    phone: '987654321',
    password: 'demo123',
    status: true,
    role: 'user',
    loggedIn: new Date(),
  });

  const userB = await ensureUser({
    name: 'Bob Demo',
    email: 'bob.demo@cartsystem.dev',
    phone: '1122334455',
    password: 'demo123',
    status: true,
    role: 'user',
    loggedIn: new Date(),
  });

  const electronics = await ensureCategory('Electronics');
  const lifestyle = await ensureCategory('Lifestyle');

  await ensureProduct({
    name: 'Noise Cancelling Headphones',
    description: 'Premium ANC headphones with 30h battery life.',
    price: 199,
    categoryId: electronics.id,
    subCategoryID: 'ANC',
    image: 'https://placehold.co/600x400?text=Headphones',
    status: true,
    inventoryLeft: 64,
    totalInventory: 80,
    sales: 12,
    product_views: 240,
  });

  await ensureProduct({
    name: 'Smart Fitness Watch',
    description: 'Track workouts, ECG, and sleep with polished UI.',
    price: 149,
    categoryId: lifestyle.id,
    subCategoryID: 'Wearables',
    image: 'https://placehold.co/600x400?text=Watch',
    status: true,
    inventoryLeft: 120,
    totalInventory: 150,
    sales: 30,
    product_views: 300,
  });

  const showcaseGroup = await ensureGroup({
    name: 'Showcase Lounge',
    description: 'Demo group to test real-time messaging.',
    ownerId: admin.id,
    requiresApproval: true,
  });

  await GroupMember.findOrCreate({
    where: { groupId: showcaseGroup.id, userId: admin.id },
    defaults: { status: 'approved', role: 'owner' },
  });

  await GroupMember.findOrCreate({
    where: { groupId: showcaseGroup.id, userId: userA.id },
    defaults: { status: 'approved', role: 'member' },
  });

  await GroupMember.findOrCreate({
    where: { groupId: showcaseGroup.id, userId: userB.id },
    defaults: { status: 'pending', role: 'member' },
  });

  const existingMessages = await UserMessage.count({ where: { groupId: showcaseGroup.id } });
  if (!existingMessages) {
    await UserMessage.create({
      userID: admin.id,
      userName: admin.name,
      userEmail: admin.email,
      userMessage: 'Welcome to the showcase lounge! Post here to demo sockets.',
      groupId: showcaseGroup.id,
      uuid_User: `seed-${Date.now()}`,
      isAdmin: true,
    });
    await UserMessage.create({
      userID: userA.id,
      userName: userA.name,
      userEmail: userA.email,
      userMessage: 'Thanks! Messages feel instant ✨',
      groupId: showcaseGroup.id,
      uuid_User: `seed-${Date.now()}-1`,
      isAdmin: false,
    });
  }
};

module.exports = seedDatabase;

