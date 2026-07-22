const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, type, message } = req.body;
    if (!name || !email || !type) {
      return res.status(400).json({ error: 'Name, email and type are required.' });
    }
    const inquiry = await Contact.create({ name, email, type, message });
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Not found.' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};