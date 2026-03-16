const Menu = require('../models/Menu');

// @desc    Get menus
// @route   GET /api/menu
// @access  Public (Authenticated users)
const getMenus = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};
        if (date) {
            // If date is provided, find menu for that date
            // Assuming date is passed as YYYY-MM-DD
            const start = new Date(date);
            start.setHours(0,0,0,0);
            const end = new Date(date);
            end.setHours(23,59,59,999);
            query.date = { $gte: start, $lte: end };
        }
        
        const menus = await Menu.find(query).sort({ date: 1 });
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update menu
// @route   POST /api/menu
// @access  Private/Admin
const createOrUpdateMenu = async (req, res) => {
    const { date, breakfast, lunch, dinner } = req.body;

    try {
        const menuDate = new Date(date);
        menuDate.setHours(0, 0, 0, 0); // Normalize time

        // Check if menu exists for this date
        // Use findOne with date range to avoid time issues if stored differently
        const start = new Date(menuDate);
        const end = new Date(menuDate);
        end.setHours(23, 59, 59, 999);

        let menu = await Menu.findOne({ date: { $gte: start, $lte: end } });

        if (menu) {
            // Update
            menu.breakfast = breakfast || menu.breakfast;
            menu.lunch = lunch || menu.lunch;
            menu.dinner = dinner || menu.dinner;
            await menu.save();
            res.json(menu);
        } else {
            // Create
            menu = await Menu.create({
                date: menuDate,
                breakfast,
                lunch,
                dinner
            });
            res.status(201).json(menu);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenus, createOrUpdateMenu };
