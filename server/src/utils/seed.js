require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('[Seeder] Creating demo users...');

    // 1. Create Users
    const usersData = [
      {
        name: 'Administrator',
        username: 'admin',
        email: 'admin@connectx.com',
        password: 'Password123!',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: '⚡ CONNECTX System Admin | Real-Time Platform Active',
        onlineStatus: 'online',
      },
      {
        name: 'Alex Chen',
        username: 'alexchen',
        email: 'alex@connectx.com',
        password: 'Password123!',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: '🚀 Designing modern real-time WebApps & WebSockets',
        onlineStatus: 'online',
      },
      {
        name: 'Sarah Miller',
        username: 'sarahm',
        email: 'sarah@connectx.com',
        password: 'Password123!',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: '✨ Scaling Node.js microservices & MongoDB streams',
        onlineStatus: 'online',
      },
      {
        name: 'Maya Patel',
        username: 'mayap',
        email: 'maya@connectx.com',
        password: 'Password123!',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        status: '🎨 Crafting glassmorphism UI & rich micro-interactions',
        onlineStatus: 'away',
      },
      {
        name: 'Liam Wilson',
        username: 'liamw',
        email: 'liam@connectx.com',
        password: 'Password123!',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: '🛡️ Securing JWT tokens & Socket.IO pipelines',
        onlineStatus: 'offline',
        lastSeen: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      },
    ];

    const users = [];
    for (const u of usersData) {
      const created = await User.create(u);
      users.push(created);
    }

    const [admin, alex, sarah, maya, liam] = users;

    console.log('[Seeder] Creating demo conversations & messages...');

    // Conversation 1: Alex & Sarah
    const conv1 = await Conversation.create({
      participants: [alex._id, sarah._id],
      isGroup: false,
    });

    const messagesConv1 = [
      {
        conversationId: conv1._id,
        sender: sarah._id,
        text: 'Hey Alex! Have you reviewed the new Socket.IO cluster setup?',
        createdAt: new Date(Date.now() - 3600000 * 2),
        readBy: [sarah._id, alex._id],
      },
      {
        conversationId: conv1._id,
        sender: alex._id,
        text: 'Hey Sarah! Yes, the latency benchmarks look incredible! Sub-20ms delivery across all nodes.',
        createdAt: new Date(Date.now() - 3600000 * 1.5),
        readBy: [sarah._id, alex._id],
      },
      {
        conversationId: conv1._id,
        sender: sarah._id,
        text: 'Awesome! Did you also check the typing indicator debouncing and read receipts?',
        createdAt: new Date(Date.now() - 3600000 * 1),
        readBy: [sarah._id, alex._id],
      },
      {
        conversationId: conv1._id,
        sender: alex._id,
        text: 'Working like a charm with optimistic updates and sound feedback!',
        createdAt: new Date(Date.now() - 3600000 * 0.5),
        readBy: [sarah._id, alex._id],
      },
    ];

    let lastMsg1 = null;
    for (const msgData of messagesConv1) {
      lastMsg1 = await Message.create(msgData);
    }
    conv1.lastMessage = lastMsg1._id;
    await conv1.save();

    // Conversation 2: Alex & Maya
    const conv2 = await Conversation.create({
      participants: [alex._id, maya._id],
      isGroup: false,
    });

    const messagesConv2 = [
      {
        conversationId: conv2._id,
        sender: maya._id,
        text: 'Hi Alex! Look at the new dark glassmorphic UI color scheme I finalized for CONNECTX!',
        messageType: 'image',
        attachment: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          fileName: 'nebula_theme_preview.jpg',
          fileSize: 428000,
          fileType: 'image/jpeg',
        },
        createdAt: new Date(Date.now() - 3600000 * 4),
        readBy: [maya._id, alex._id],
      },
      {
        conversationId: conv2._id,
        sender: alex._id,
        text: 'This neon emerald + deep obsidian palette is breathtaking! It gives such a sleek, premium experience.',
        createdAt: new Date(Date.now() - 3600000 * 3),
        readBy: [maya._id, alex._id],
      },
      {
        conversationId: conv2._id,
        sender: maya._id,
        text: 'Thanks! Let me know when the mobile drawer interactions are ready to test.',
        createdAt: new Date(Date.now() - 3600000 * 0.2),
        readBy: [maya._id],
      },
    ];

    let lastMsg2 = null;
    for (const msgData of messagesConv2) {
      lastMsg2 = await Message.create(msgData);
    }
    conv2.lastMessage = lastMsg2._id;
    await conv2.save();

    // Conversation 3: Alex & Liam
    const conv3 = await Conversation.create({
      participants: [alex._id, liam._id],
      isGroup: false,
    });

    const messagesConv3 = [
      {
        conversationId: conv3._id,
        sender: liam._id,
        text: 'Alex, I configured the MongoDB compound indexes for conversationId and createdAt.',
        createdAt: new Date(Date.now() - 3600000 * 8),
        readBy: [liam._id, alex._id],
      },
      {
        conversationId: conv3._id,
        sender: alex._id,
        text: 'Great work Liam! Message queries and pagination will stay lightning fast under heavy load.',
        createdAt: new Date(Date.now() - 3600000 * 7),
        readBy: [liam._id, alex._id],
      },
    ];

    let lastMsg3 = null;
    for (const msgData of messagesConv3) {
      lastMsg3 = await Message.create(msgData);
    }
    conv3.lastMessage = lastMsg3._id;
    await conv3.save();

    // Conversation 4: Sarah & Maya
    const conv4 = await Conversation.create({
      participants: [sarah._id, maya._id],
      isGroup: false,
    });

    const lastMsg4 = await Message.create({
      conversationId: conv4._id,
      sender: sarah._id,
      text: 'Hey Maya! The image upload endpoint with Multer is all set.',
      createdAt: new Date(Date.now() - 3600000 * 5),
      readBy: [sarah._id, maya._id],
    });
    conv4.lastMessage = lastMsg4._id;
    await conv4.save();

    console.log('----------------------------------------------------');
    console.log('✅ CONNECTX Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('👑 Admin:  admin@connectx.com   / Password123!');
    console.log('👤 Alex:   alex@connectx.com    / Password123!');
    console.log('👤 Sarah:  sarah@connectx.com   / Password123!');
    console.log('👤 Maya:   maya@connectx.com    / Password123!');
    console.log('👤 Liam:   liam@connectx.com    / Password123!');
    console.log('----------------------------------------------------');

    return true;
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    throw error;
  }
};

// If run directly via node src/utils/seed.js
if (require.main === module) {
  seedData()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;
