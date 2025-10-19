import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

export const createEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const event = await Event.create({ ...req.body, organizer: req.user.id, posterUrl });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const update = { ...req.body };
    if (posterUrl) update.posterUrl = posterUrl;
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizer: req.user.id }, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      status, 
      organizer,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    const filter = {};
    
    // Text search in title and description
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) filter.category = category;
    
    // Status filter
    if (status) filter.status = status;
    
    // Organizer filter
    if (organizer) filter.organizer = organizer;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .populate('organizer', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Event.countDocuments(filter);
    
    res.json({ 
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Not found' });
    const count = await Registration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    res.json({ event, registrations: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


