const User = require('../models/User');

const getOrCreateUser = async (clerkId) => {
  let user = await User.findOne({ clerkId });
  if (!user) user = await User.create({ clerkId });
  return user;
};

exports.getWorkspace = async (req, res) => {
  try {
    const user = await getOrCreateUser(req.auth.userId);
    res.status(200).json({ success: true, saved: user.savedListings, trash: user.trashListings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobData } = req.body;
    const user = await getOrCreateUser(req.auth.userId);
    
    const existsInSaved = user.savedListings.find(j => j.job_id === jobData.job_id);
    const existsInTrash = user.trashListings.find(j => j.job_id === jobData.job_id);

    if (!existsInSaved && !existsInTrash) {
      user.savedListings.push(jobData);
      user.markModified('savedListings');
      await user.save();
    }
    res.status(200).json({ success: true, message: "Job Saved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.moveToTrash = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user = await getOrCreateUser(req.auth.userId);

    const jobToTrash = user.savedListings.find(j => j.job_id === job_id);
    if (jobToTrash) {
      user.savedListings = user.savedListings.filter(j => j.job_id !== job_id);
      user.trashListings.push(jobToTrash);
      
      user.markModified('savedListings');
      user.markModified('trashListings'); 
      await user.save();
    }
    res.status(200).json({ success: true, message: "Moved to Trash" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recoverFromTrash = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user = await getOrCreateUser(req.auth.userId);

    const jobToRecover = user.trashListings.find(j => j.job_id === job_id);
    if (jobToRecover) {
      user.trashListings = user.trashListings.filter(j => j.job_id !== job_id);
      user.savedListings.push(jobToRecover);
      
      user.markModified('trashListings'); 
      user.markModified('savedListings'); 
      await user.save();
    }
    res.status(200).json({ success: true, message: "Job Recovered" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.permanentDelete = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user = await getOrCreateUser(req.auth.userId);
    
    user.trashListings = user.trashListings.filter(j => j.job_id !== job_id);
    user.markModified('trashListings'); 
    await user.save();
    
    res.status(200).json({ success: true, message: "Deleted Permanently" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};