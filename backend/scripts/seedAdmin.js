require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const MenuItem = require('../models/MenuItem');
const Menu = require('../models/Menu');
const connectDB = require('../config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Create admin user
        const adminExists = await User.findOne({ email: 'chsairithivik@gmail.com' });

        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'chsairithivik@gmail.com',
                password: 'abcdefgh',
                role: 'admin',
            });
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create slots
        const slotsData = [
            { name: 'Breakfast', startTime: '08:00', endTime: '11:00', capacity: 50 },
            { name: 'Lunch', startTime: '12:00', endTime: '16:00', capacity: 100 },
            { name: 'Snacks', startTime: '17:00', endTime: '19:00', capacity: 50 },
            { name: 'Dinner', startTime: '19:00', endTime: '22:00', capacity: 80 },
        ];

        for (const slotData of slotsData) {
            const slotExists = await Slot.findOne({ name: slotData.name });
            if (!slotExists) {
                await Slot.create(slotData);
                console.log(`✅ ${slotData.name} slot created`);
            } else {
                console.log(`ℹ️  ${slotData.name} slot already exists`);
            }
        }

        // Create sample menu items
        const menuItemsData = [
            // Breakfast items
            { name: 'Idli', description: 'Steamed rice cakes', category: 'veg', price: 30, imageUrl: 'https://via.placeholder.com/150?text=Idli' },
            { name: 'Dosa', description: 'Crispy rice crepe', category: 'veg', price: 40, imageUrl: 'https://via.placeholder.com/150?text=Dosa' },
            { name: 'Poha', description: 'Flattened rice', category: 'veg', price: 25, imageUrl: 'https://via.placeholder.com/150?text=Poha' },
            { name: 'Tea', description: 'Hot tea', category: 'beverage', price: 10, imageUrl: 'https://via.placeholder.com/150?text=Tea' },
            { name: 'Coffee', description: 'Hot coffee', category: 'beverage', price: 15, imageUrl: 'https://via.placeholder.com/150?text=Coffee' },

            // Lunch items
            { name: 'Rice', description: 'Steamed rice', category: 'veg', price: 20, imageUrl: 'https://via.placeholder.com/150?text=Rice' },
            { name: 'Dal', description: 'Lentil curry', category: 'veg', price: 30, imageUrl: 'https://via.placeholder.com/150?text=Dal' },
            { name: 'Roti', description: 'Indian bread', category: 'veg', price: 5, imageUrl: 'https://via.placeholder.com/150?text=Roti' },
            { name: 'Chicken Curry', description: 'Spicy chicken curry', category: 'non-veg', price: 80, imageUrl: 'https://via.placeholder.com/150?text=Chicken' },
            { name: 'Paneer Curry', description: 'Cottage cheese curry', category: 'veg', price: 60, imageUrl: 'https://via.placeholder.com/150?text=Paneer' },

            // Snacks items
            { name: 'Samosa', description: 'Fried pastry', category: 'veg', price: 15, imageUrl: 'https://via.placeholder.com/150?text=Samosa' },
            { name: 'Pakora', description: 'Fried fritters', category: 'veg', price: 20, imageUrl: 'https://via.placeholder.com/150?text=Pakora' },
            { name: 'Sandwich', description: 'Veg sandwich', category: 'veg', price: 35, imageUrl: 'https://via.placeholder.com/150?text=Sandwich' },

            // Dinner items (similar to lunch)
            { name: 'Biryani', description: 'Fragrant rice dish', category: 'non-veg', price: 100, imageUrl: 'https://via.placeholder.com/150?text=Biryani' },
            { name: 'Veg Biryani', description: 'Vegetable biryani', category: 'veg', price: 70, imageUrl: 'https://via.placeholder.com/150?text=VegBiryani' },

            // Desserts
            { name: 'Ice Cream', description: 'Vanilla ice cream', category: 'dessert', price: 25, imageUrl: 'https://via.placeholder.com/150?text=IceCream' },
            { name: 'Gulab Jamun', description: 'Sweet dumplings', category: 'dessert', price: 20, imageUrl: 'https://via.placeholder.com/150?text=GulabJamun' },
        ];

        const createdItems = [];
        for (const itemData of menuItemsData) {
            const itemExists = await MenuItem.findOne({ name: itemData.name });
            if (!itemExists) {
                const item = await MenuItem.create(itemData);
                createdItems.push(item);
                console.log(`✅ ${itemData.name} menu item created`);
            } else {
                createdItems.push(itemExists);
                console.log(`ℹ️  ${itemData.name} menu item already exists`);
            }
        }

        // Assign menu items to slots
        const slots = await Slot.find({});

        // Breakfast menu
        const breakfastSlot = slots.find(s => s.name === 'Breakfast');
        if (breakfastSlot) {
            const breakfastItems = createdItems.filter(item =>
                ['Idli', 'Dosa', 'Poha', 'Tea', 'Coffee'].includes(item.name)
            );
            const breakfastMenu = await Menu.findOne({ slotId: breakfastSlot._id });
            if (!breakfastMenu) {
                await Menu.create({
                    slotId: breakfastSlot._id,
                    menuItems: breakfastItems.map(item => item._id),
                });
                console.log('✅ Breakfast menu assigned');
            }
        }

        // Lunch menu
        const lunchSlot = slots.find(s => s.name === 'Lunch');
        if (lunchSlot) {
            const lunchItems = createdItems.filter(item =>
                ['Rice', 'Dal', 'Roti', 'Chicken Curry', 'Paneer Curry', 'Ice Cream'].includes(item.name)
            );
            const lunchMenu = await Menu.findOne({ slotId: lunchSlot._id });
            if (!lunchMenu) {
                await Menu.create({
                    slotId: lunchSlot._id,
                    menuItems: lunchItems.map(item => item._id),
                });
                console.log('✅ Lunch menu assigned');
            }
        }

        // Snacks menu
        const snacksSlot = slots.find(s => s.name === 'Snacks');
        if (snacksSlot) {
            const snacksItems = createdItems.filter(item =>
                ['Samosa', 'Pakora', 'Sandwich', 'Tea', 'Coffee'].includes(item.name)
            );
            const snacksMenu = await Menu.findOne({ slotId: snacksSlot._id });
            if (!snacksMenu) {
                await Menu.create({
                    slotId: snacksSlot._id,
                    menuItems: snacksItems.map(item => item._id),
                });
                console.log('✅ Snacks menu assigned');
            }
        }

        // Dinner menu
        const dinnerSlot = slots.find(s => s.name === 'Dinner');
        if (dinnerSlot) {
            const dinnerItems = createdItems.filter(item =>
                ['Biryani', 'Veg Biryani', 'Roti', 'Dal', 'Gulab Jamun'].includes(item.name)
            );
            const dinnerMenu = await Menu.findOne({ slotId: dinnerSlot._id });
            if (!dinnerMenu) {
                await Menu.create({
                    slotId: dinnerSlot._id,
                    menuItems: dinnerItems.map(item => item._id),
                });
                console.log('✅ Dinner menu assigned');
            }
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📧 Admin credentials:');
        console.log('   Email: chsairithivik@gmail.com');
        console.log('   Password: abcdefgh\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
