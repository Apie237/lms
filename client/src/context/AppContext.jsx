import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth, useUser} from "@clerk/clerk-react"


export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const navigate = useNavigate();

    const { getToken } = useAuth()
    const { user } = useUser()

    const currency = import.meta.env.VITE_CURRENCY
    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    // Function to calculate ratings
const calculateRatings = (course) => {
    if (course.courseRatings.length === 0) return 0;

    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
        totalRating += rating.rating;
    });

    return totalRating / course.courseRatings.length;
};

// Function to calculate course chapter time
const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.forEach((lecture) => {
        time += lecture.lectureDuration;
    });

    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
};

// Function to calculate course duration
const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) => {
        chapter.chapterContent.forEach((lecture) => {
            time += lecture.lectureDuration;
        });
    });

    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
};

// Function to calculate total number of lectures
const calculateTotalNumberOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
        if (Array.isArray(chapter.chapterContent)) {
            totalLectures += chapter.chapterContent.length;
        }
    });

    return totalLectures;
};

// fetch user enrolled courses
const fetchEnrolledUserCourses = async () => {
    setEnrolledCourses(dummyCourses)
}

    useEffect(() => {
        fetchAllCourses()
        fetchEnrolledUserCourses()
    },[])

    const logToken = async () => {
        console.log(await getToken());
    }

    useEffect(() => {
        if(user){
            logToken()
        }
    }, [user])

    const value = {
       currency, allCourses, navigate, calculateRatings, isEducator, setIsEducator, calculateChapterTime,
     calculateCourseDuration, calculateTotalNumberOfLectures, enrolledCourses, fetchEnrolledUserCourses
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
} 