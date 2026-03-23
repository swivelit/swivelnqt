const Course = require("../models/course.model");

/* GET COURSES */
exports.getCourses = (req,res)=>{
    Course.getAllCourses((err,data)=>{
        if(err) return res.status(500).json({message:"DB error"});
        res.json(data);
    });
};

/* GET SINGLE COURSE */
exports.getCourseById = (req,res)=>{

    Course.getCourseById(req.params.id,(err,data)=>{
        if(err) return res.status(500).json({message:"DB error"});
        res.json(data[0]);
    });

};

/* ADD COURSE */
exports.addCourse = (req,res)=>{

    const {
        course_name,
        description,
        duration,
        fee,
        trainer_name,
        trainer_email,
        gmeet_link,
        status
    } = req.body;

    Course.addCourse([
        course_name,
        description,
        duration,
        fee,
        trainer_name,
        trainer_email,
        gmeet_link,
        status
    ],(err)=>{
        if(err) return res.status(500).json({message:"Insert failed"});
        res.json({message:"Course added successfully"});
    });

};

/* UPDATE COURSE */
exports.updateCourse = (req,res)=>{

    const {
        course_name,
        description,
        duration,
        fee,
        trainer_name,
        trainer_email,
        gmeet_link,
        status
    } = req.body;

    Course.updateCourse(
        req.params.id,
        [
            course_name,
            description,
            duration,
            fee,
            trainer_name,
            trainer_email,
            gmeet_link,
            status
        ],
        (err)=>{
            if(err) return res.status(500).json({message:"Update failed"});
            res.json({message:"Course updated"});
        }
    );
};

/* DELETE COURSE */
exports.deleteCourse = (req,res)=>{

    Course.deleteCourse(req.params.id,(err)=>{
        if(err) return res.status(500).json({message:"Delete failed"});
        res.json({message:"Course deleted"});
    });

};