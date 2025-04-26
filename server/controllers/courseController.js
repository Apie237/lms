import Course from "../models/Course.js"


// Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }) // Fixed typo
            .select(["-courseContent", "-enrolledStudents"]) // Excluding large fields
            .populate({ path: "educator" });

        res.json({ success: true, courses });
    } catch (error) {
        console.error("Error fetching courses:", error); // Added logging for debugging
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get course by ID
export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch course data with educator populated
        const courseData = await Course.findById(id).populate({ path: "educator" });

        // Handle case where the course doesn't exist
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Modify course content safely
        courseData.courseContent = courseData.courseContent.map(chapter => ({
            ...chapter,
            chapterContent: chapter.chapterContent.map(lecture => ({
                ...lecture,
                lectureUrl: lecture.isPreviewFree ? lecture.lectureUrl : ""
            }))
        }));

        res.json({ success: true, courseData });

    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

