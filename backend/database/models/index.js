const sequelize = require('../index');

const Bill = require('./Bill')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const User = require('./User')(sequelize);
const UserCart = require('./UserCart')(sequelize);
const UserMessage = require('./UserMessage')(sequelize);
const PaymentStatus = require('./PaymentStatus')(sequelize);
const EmailSent = require('./EmailSent')(sequelize);
const SubCategory = require('./SubCategory')(sequelize);
const ChatGroup = require('./ChatGroup')(sequelize);
const GroupMember = require('./GroupMember')(sequelize);

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(UserCart, { foreignKey: 'user_id', as: 'cartItems' });
UserCart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Product.hasMany(UserCart, { foreignKey: 'product_id', as: 'cartProduct' });
UserCart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

PaymentStatus.hasMany(Bill, { foreignKey: 'paymentStatusID', as: 'bills' });
Bill.belongsTo(PaymentStatus, { foreignKey: 'paymentStatusID', as: 'paymentStatus' });

Category.hasMany(SubCategory, { foreignKey: 'categoryID', as: 'subCategories' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryID', as: 'category' });

ChatGroup.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
ChatGroup.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
GroupMember.belongsTo(ChatGroup, { foreignKey: 'groupId', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'member' });
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });

ChatGroup.hasMany(UserMessage, { foreignKey: 'groupId', as: 'messages' });
UserMessage.belongsTo(ChatGroup, { foreignKey: 'groupId', as: 'group' });
UserMessage.belongsTo(User, { foreignKey: 'userID', as: 'sender' });

module.exports = {
  sequelize,
  Bill,
  Category,
  Product,
  User,
  UserCart,
  UserMessage,
  PaymentStatus,
  EmailSent,
  SubCategory,
  ChatGroup,
  GroupMember,
};

