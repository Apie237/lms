import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Rating from '../../components/student/Rating';
import { toast } from 'react-toastify';
import Loading from './Loading';
import axios from 'axios';

const Player = () => {
  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, fetchUserEnrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course.courseRatings.map((item) => {
          if(item.userId){
            setInitialRating(item.rating)
          }          
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if(enrolledCourses.length > 0){
      getCourseData()
    }
  }, [courseId, enrolledCourses]);

  const markLectureAsCompleted = async (lectureId) => {
     try {
      const token = await getToken()
      const {data} = await axios.post(backendUrl + '/api/user/update-course-progress', {courseId, lectureId}, {headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }
     } catch (error) {
      toast.error(error.message)
     }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/user/get-course-progress', {courseId}, {headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        setProgressData(data.progressData)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const {data} = await axios.post(backendUrl + '/api/user/add-rating', {courseId, rating}, {headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        fetchUserEnrolledCourses()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getCourseProgress()
  }, [])

  return courseData ? (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        {/*left side*/}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className='pt-5'>
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between p-4 py-3 cursor-pointer' onClick={() => toggleSection(index)}>
                  <div className='flex items-center gap-2'>
                    <img src={assets.down_arrow_icon} alt='arrow icon' className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`} />
                    <p className='font-medium text-sm md:text-base'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                </div>

                {openSections[index] && (
                  <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className='flex items-start gap-2 py-1'>
                        <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt='play icon' className='w-4 h-4 mt-1' />
                        <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                          <p>{lecture.lectureTitle}</p>
                          <div className='flex gap-2'>
                            {lecture.lectureUrl && <p className='text-xs text-blue-500 cursor-pointer' onClick={() => setPlayerData({
                              ...lecture, chapter: index + 1, lecture: i + 1,
                            })}>Watch</p>}
                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this Course: </h1>
            <Rating initialRating={initialRating} onRate={handleRate}/>
          </div>
        </div>
        {/*right side*/}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube
              videoId={playerData.lectureUrl.split('/').pop()} iframeClassName='w-full aspect-video' />
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark complete'}</button>
              </div>
            </div>
          ) : <img src={courseData? courseData.courseThumbnail : ''} alt='' />}
        </div>
      </div>
    </>
  ) : <Loading/>
}

export default Player;
