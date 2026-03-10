const {
    getAllSlots,
    createSlot,
    updateSlot,
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuForSlot,
    assignMenuToSlot,
} = require('../../backend/controllers/menuController');
const SlotTemplate = require('../../backend/models/SlotTemplate');
const Slot = require('../../backend/models/Slot');
const MenuItem = require('../../backend/models/MenuItem');
const Menu = require('../../backend/models/Menu');
const { getOrCreateTodaySlots } = require('../../backend/utils/slotManager');

// Mock all dependencies
jest.mock('../../backend/models/SlotTemplate');
jest.mock('../../backend/models/Slot');
jest.mock('../../backend/models/MenuItem');
jest.mock('../../backend/models/Menu');
jest.mock('../../backend/utils/slotManager');

/*
 * Unit tests for the menu controller.
 * Tests slot management, menu item CRUD, and menu assignment.
 */
describe('Menu Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('getAllSlots', () => {
        test('should return all today slots', async () => {
            const mockSlots = [
                { name: 'Breakfast', startTime: '07:00' },
                { name: 'Lunch', startTime: '12:00' },
            ];
            getOrCreateTodaySlots.mockResolvedValue(mockSlots);

            await getAllSlots(req, res);

            expect(res.json).toHaveBeenCalledWith(mockSlots);
        });

        test('should return 500 on error', async () => {
            getOrCreateTodaySlots.mockRejectedValue(new Error('DB Error'));

            await getAllSlots(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createSlot', () => {
        test('should create a new slot template', async () => {
            req.body = {
                name: 'Dinner',
                startTime: '19:00',
                endTime: '21:00',
                capacity: 20,
            };

            const mockTemplate = { _id: 'tmpl1', ...req.body };
            SlotTemplate.create.mockResolvedValue(mockTemplate);

            await createSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTemplate);
        });

        test('should return 500 on creation error', async () => {
            req.body = { name: 'Dinner' };
            SlotTemplate.create.mockRejectedValue(new Error('Validation error'));

            await createSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateSlot', () => {
        test('should update a slot template when daily slot exists', async () => {
            req.params.id = 'dailySlot1';
            req.body = { capacity: 25 };

            const mockDailySlot = { _id: 'dailySlot1', templateId: 'tmpl1' };
            Slot.findById.mockResolvedValue(mockDailySlot);

            const mockUpdatedTemplate = {
                _id: 'tmpl1',
                capacity: 25,
                toObject: jest.fn().mockReturnValue({ _id: 'tmpl1', capacity: 25 }),
            };
            SlotTemplate.findByIdAndUpdate.mockResolvedValue(mockUpdatedTemplate);

            await updateSlot(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ _id: 'dailySlot1', capacity: 25 })
            );
        });

        test('should return 404 if daily slot not found', async () => {
            req.params.id = 'nonexistent';
            Slot.findById.mockResolvedValue(null);

            await updateSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 404 if template not found', async () => {
            req.params.id = 'dailySlot1';
            Slot.findById.mockResolvedValue({ templateId: 'tmpl1' });
            SlotTemplate.findByIdAndUpdate.mockResolvedValue(null);

            await updateSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getAllMenuItems', () => {
        test('should return only available menu items', async () => {
            const mockItems = [
                { name: 'Burger', isAvailable: true },
                { name: 'Pizza', isAvailable: true },
            ];
            MenuItem.find.mockResolvedValue(mockItems);

            await getAllMenuItems(req, res);

            expect(MenuItem.find).toHaveBeenCalledWith({ isAvailable: true });
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });
    });

    describe('addMenuItem', () => {
        test('should add a new menu item', async () => {
            req.body = {
                name: 'Veggie Wrap',
                description: 'Fresh veggie wrap',
                category: 'veg',
                price: 80,
            };

            const mockItem = { _id: 'item1', ...req.body };
            MenuItem.create.mockResolvedValue(mockItem);

            await addMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockItem);
        });
    });

    describe('updateMenuItem', () => {
        test('should update an existing menu item', async () => {
            req.params.id = 'item1';
            req.body = { price: 100, isAvailable: false };

            const mockUpdated = { _id: 'item1', price: 100, isAvailable: false };
            MenuItem.findByIdAndUpdate.mockResolvedValue(mockUpdated);

            await updateMenuItem(req, res);

            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        test('should return 404 if item not found', async () => {
            req.params.id = 'nonexistent';
            MenuItem.findByIdAndUpdate.mockResolvedValue(null);

            await updateMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteMenuItem', () => {
        test('should delete a menu item', async () => {
            req.params.id = 'item1';
            MenuItem.findByIdAndDelete.mockResolvedValue({ _id: 'item1' });

            await deleteMenuItem(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Menu item removed' });
        });

        test('should return 404 if item not found', async () => {
            req.params.id = 'nonexistent';
            MenuItem.findByIdAndDelete.mockResolvedValue(null);

            await deleteMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getMenuForSlot', () => {
        test('should return menu for a valid slot', async () => {
            req.params.slotId = 'slot123';

            const mockSlot = { _id: 'slot123', templateId: 'tmpl1' };
            Slot.findById.mockResolvedValue(mockSlot);

            const mockMenu = {
                menuItems: [{ name: 'Burger' }],
                slotTemplateId: { name: 'Lunch' },
                toObject: jest.fn().mockReturnValue({
                    menuItems: [{ name: 'Burger' }],
                    slotTemplateId: { name: 'Lunch' },
                }),
            };
            Menu.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockMenu),
                }),
            });

            await getMenuForSlot(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    menuItems: [{ name: 'Burger' }],
                    slotId: mockSlot,
                })
            );
        });

        test('should return 404 if slot not found', async () => {
            req.params.slotId = 'nonexistent';
            Slot.findById.mockResolvedValue(null);

            await getMenuForSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return empty list if no menu assigned', async () => {
            req.params.slotId = 'slot123';

            Slot.findById.mockResolvedValue({ _id: 'slot123', templateId: 'tmpl1' });
            Menu.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });

            await getMenuForSlot(req, res);

            expect(res.json).toHaveBeenCalledWith({ menuItems: [] });
        });
    });

    describe('assignMenuToSlot', () => {
        test('should create menu when none exists for slot', async () => {
            req.params.slotId = 'slot123';
            req.body = { menuItems: ['item1', 'item2'] };

            const mockSlot = { _id: 'slot123', templateId: 'tmpl1' };
            Slot.findById.mockResolvedValue(mockSlot);
            Menu.findOne.mockResolvedValue(null);

            const mockCreatedMenu = {
                _id: 'menu1',
                slotTemplateId: 'tmpl1',
                menuItems: ['item1', 'item2'],
            };
            Menu.create.mockResolvedValue(mockCreatedMenu);

            const mockPopulated = {
                _id: 'menu1',
                menuItems: [{ name: 'Burger' }, { name: 'Pizza' }],
                slotTemplateId: { name: 'Lunch' },
                toObject: jest.fn().mockReturnValue({
                    _id: 'menu1',
                    menuItems: [{ name: 'Burger' }, { name: 'Pizza' }],
                    slotTemplateId: { name: 'Lunch' },
                }),
            };
            Menu.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPopulated),
                }),
            });

            await assignMenuToSlot(req, res);

            expect(Menu.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    slotId: mockSlot,
                })
            );
        });

        test('should update existing menu for the slot', async () => {
            req.params.slotId = 'slot123';
            req.body = { menuItems: ['item3'] };

            const mockSlot = { _id: 'slot123', templateId: 'tmpl1' };
            Slot.findById.mockResolvedValue(mockSlot);

            const mockExistingMenu = {
                _id: 'menu1',
                menuItems: ['item1'],
                save: jest.fn().mockResolvedValue(true),
            };
            Menu.findOne.mockResolvedValue(mockExistingMenu);

            const mockPopulated = {
                toObject: jest.fn().mockReturnValue({
                    _id: 'menu1',
                    menuItems: [{ name: 'Pasta' }],
                }),
            };
            Menu.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPopulated),
                }),
            });

            await assignMenuToSlot(req, res);

            expect(mockExistingMenu.menuItems).toEqual(['item3']);
            expect(mockExistingMenu.save).toHaveBeenCalled();
        });

        test('should return 404 if slot not found', async () => {
            req.params.slotId = 'nonexistent';
            Slot.findById.mockResolvedValue(null);

            await assignMenuToSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
