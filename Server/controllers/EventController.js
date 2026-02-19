const Event = require('../models/EventModel');
const { startOfMonth, endOfMonth, parseISO } = require('date-fns');

// GET /api/admin/events?month=YYYY-MM
const getEvents = async (req, res) => {
  try {
    const { month } = req.query; // format YYYY-MM
    const monthDate = month ? parseISO(`${month}-01`) : new Date();

    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const events = await Event.find({ start: { $gte: start, $lte: end } }).sort({ start: 1 });
    return res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

// POST /api/admin/events
const createEvent = async (req, res) => {
  try {
    const { title, description = '', start, end, allDay = true } = req.body;
    if (!title || !start || !end) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const event = await Event.create({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      allDay,
      createdBy: req.id,
    });

    // Broadcast the newly created event to all connected clients
    if (global.io) {
      global.io.emit("calendarEventCreated", event);
    }

    return res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Error creating event', error);
    return res.status(500).json({ success: false, message: 'Failed to create event' });
  }
};

// DELETE /api/admin/events/:id
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Optionally verify permissions here
    const deleted = await Event.findOneAndDelete({ _id: id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event', error);
    return res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
};

module.exports = { getEvents, createEvent, deleteEvent };