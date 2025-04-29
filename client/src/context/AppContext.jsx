import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react"
import axios from 'axios'
import { toast } from "react-toastify";


export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate();

    const { getToken } = useAuth()
    const { user } = useUser()

    const currency = import.meta.env.CURRENCY
    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)

    const fetchAllCourses = async () => {
        try {
            
            const { data } = await axios.get(backendUrl + '/api/course/all');
    
            if (data.success) {
                setAllCourses(data.courses);
            } else {
                console.error("API response error:", data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Fetch error:", error.message);
            toast.error(error.message);
        }
    };
    // Fetch userdata
    const fetchUserData = async () => {
        if (user.publicMetadata.role === 'educator') {
            setIsEducator(true)
        }
        try {
            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/user/data', {
                headers:
                    { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(data.message)
        }
    }
    // Function to calculate ratings
    const calculateRatings = (course) => {
        if (course.courseRatings.length === 0) return 0;

        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });

        return Math.floor(totalRating / course.courseRatings.length);
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
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });

        return totalLectures;
    };

    // fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(data.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchAllCourses()
            fetchUserEnrolledCourses()
        }
    }, [user])


    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const value = {
        currency, allCourses, navigate, calculateRatings, isEducator, setIsEducator, calculateChapterTime,
        calculateCourseDuration, enrolledCourses, fetchUserEnrolledCourses,
        backendUrl, userData, setUserData, getToken, fetchAllCourses, calculateNoOfLectures
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
} 