import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../student/Loading';
import axios from 'axios'; // Missing import
import { toast } from 'react-toastify'; // Missing import

const MyCourses = () => {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      data.success && setCourses(data.courses);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    if(isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);
  
  return courses ? (
    <div className="flex-1 flex flex-col md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className='w-full mb-auto'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => {
                // Safely handle enrolledStudents that might be undefined or null
                const studentCount = course.enrolledStudents?.length || 0;
                const coursePrice = course.coursePrice || 0;
                const discount = course.discount || 0;
                
                return (
                  <tr key={course._id} className='border-b border-gray-500/20 hover:bg-gray-50'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                      <img 
                        src={course.courseThumbnail || '/placeholder-image.jpg'} 
                        alt="Course Image" 
                        className='w-16 h-12 object-cover rounded' 
                      />
                      <span className='hidden truncate md:block'>{course.courseTitle || 'Untitled Course'}</span>
                    </td>
                    <td className='px-4 py-3'>
                      {currency} {Math.floor(studentCount * (coursePrice - discount * coursePrice / 100))}
                    </td>
                    <td className='px-4 py-3'>{studentCount}</td>
                    <td className='px-4 py-3'>
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-16"></div>
    </div>
  ) : <Loading />;
};

export default MyCourses;