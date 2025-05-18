const Course = require('../Modals/courseModal');

exports.createCourse = async (req , res) => {
    const { title,description,topics,link,level } = req.body;
    try{
        const course = await Course.create({title,description,topics,link,level});
        res.status(200).json(course);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

exports.getCourse = async (req,res) => {
    try{
        const course = await Course.find();
        res.status(200).json(course);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req,res) => {
    try{
        const course = await Course.findById(req.params.id);
        if(!course) return res.status(404).json({ message: 'course not found'});
        res.status(200).json(course); 
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req,res) => {
    try{
        const course = await Course.findByIdAndUpdate(req.params.id,req.body, {new: true});
        if(!course) return res.status(404).json({message: 'course not found'});
        res.status(200).json(course);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.deleteCourse = async (req,res) => {
    try{
        const course = await Course.findByIdAndDelete(req.params.id);
        if(!course) return res.status(404).json({message: 'course not found'});
        res.status(200).json(course);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};