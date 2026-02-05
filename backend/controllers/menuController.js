const Slot = require('../models/Slot');
const MenuItem = require('../models/MenuItem');
const Menu = require('../models/Menu');

// @desc    Get all slots
// @route   GET /api/menu/slots
// @access  Public
const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ isActive: true });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new slot
// @route   POST /api/menu/slots
// @access  Private (Admin)
const createSlot = async (req, res) => {
    try {
        const { name, startTime, endTime, capacity } = req.body;

        const slot = await Slot.create({
            name,
            startTime,
            endTime,
            capacity,
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update slot
// @route   PUT /api/menu/slots/:id
// @access  Private (Admin)
const updateSlot = async (req, res) => {
    try {
        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
const getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ isAvailable: true });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add menu item
// @route   POST /api/menu/items
// @access  Private (Admin)
const addMenuItem = async (req, res) => {
    try {
        const { name, description, category, price, imageUrl } = req.body;

        const menuItem = await MenuItem.create({
            name,
            description,
            category,
            price,
            imageUrl,
        });

        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private (Admin)
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private (Admin)
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get menu for specific slot
// @route   GET /api/menu/slot/:slotId
// @access  Public
const getMenuForSlot = async (req, res) => {
    try {
        const menu = await Menu.findOne({ slotId: req.params.slotId })
            .populate('menuItems')
            .populate('slotId', 'name startTime endTime');

        if (!menu) {
            return res.json({ menuItems: [] });
        }

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign menu items to slot
// @route   POST /api/menu/slot/:slotId
// @access  Private (Admin)
const assignMenuToSlot = async (req, res) => {
    try {
        const { menuItems } = req.body;
        const { slotId } = req.params;

        // Check if menu exists for this slot
        let menu = await Menu.findOne({ slotId });

        if (menu) {
            // Update existing menu
            menu.menuItems = menuItems;
            await menu.save();
        } else {
            // Create new menu
            menu = await Menu.create({
                slotId,
                menuItems,
            });
        }

        const populatedMenu = await Menu.findById(menu._id)
            .populate('menuItems')
            .populate('slotId', 'name');

        res.json(populatedMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSlots,
    createSlot,
    updateSlot,
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuForSlot,
    assignMenuToSlot,
};
