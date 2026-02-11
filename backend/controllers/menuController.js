const Slot = require('../models/Slot');
const MenuItem = require('../models/MenuItem');
const Menu = require('../models/Menu');

/*
 * This function fetches all active time slots.
 * These slots are shown to both students and admin users.
 */
const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find({ isActive: true });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function is used to create a new slot.
 * Admins use it to set meal timings like breakfast or lunch.
 */
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

/*
 * This function updates details of an existing slot.
 * It can change the slot name, timing, or capacity.
 */
const updateSlot = async (req, res) => {
    try {
        const slot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        //if slot is not found, return 404  
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function retrieves all available menu items.
 * Only items that are currently available are returned.
 */
const getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ isAvailable: true });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function adds a new food item to the menu.
 * Admins provide item details such as name and price.
 */
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

/*
 * This function updates an existing menu item.
 * It allows editing item details like price or availability.
 */
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        // If menu item is not found
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function deletes a menu item permanently.
 * It is used when an item is removed from the menu.
 */
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

/*
 * This function returns the menu for a specific slot.
 * Example: fetching breakfast items for morning slot.
 */
const getMenuForSlot = async (req, res) => {
    try {
        const menu = await Menu.findOne({ slotId: req.params.slotId })
            .populate('menuItems')
            .populate('slotId', 'name startTime endTime');
        // If no menu is assigned, return empty list
        if (!menu) {
            return res.json({ menuItems: [] });
        }

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function assigns menu items to a slot.
 * It creates a new menu or updates an existing one.
 */
const assignMenuToSlot = async (req, res) => {
    try {
        const { menuItems } = req.body;
        const { slotId } = req.params;

        // Check if a menu already exists for the slot
        let menu = await Menu.findOne({ slotId });

        if (menu) {
            // Update  the existing menu items
            menu.menuItems = menuItems;
            await menu.save();
        } else {
            // Create new menu for the slot
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
