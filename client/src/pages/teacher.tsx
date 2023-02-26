import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import NotFound from '../components/globals/not-found/NotFound';
import { RootStore } from '../utils/interface'
import DashBroadUser from '../components/dashbroad/DashBroadUser';
import TeacherCp from '../components/teacher/teacher/Teacher';
import { getTeachers } from '../store/actions/teacherActions'

/// Loading Imports
// import GlobalLoading from '../components/globals/global-loading/GlobalLoading'
// import { ALERT } from '../store/types/alertTypes'
// import { getAPI } from '../utils/fetchApi'

const Teacher = () => {

    const dispatch = useDispatch();
    const { auth } = useSelector((state: RootStore) => state)

    // loading modal (purely for page loading and API initializing)
    // const [firstLoading, setFirstLoading] = useState<boolean>(true);
    // const wakeUpAddress = 'wake_up_call'

    // API call to wake the API site up (since it tends to be disabled after a period of inactivity)
    // const wake_up_call = async () => {
    //     await getAPI(wakeUpAddress)
    //     .then(
    //         (data) => {
    //             console.log(data.data);     // should be API is available message
    //             setTimeout(() => {setFirstLoading(false)}, 1000);       // set Global Loading to false
    //         }
    //     )
    //     .catch(
    //         (error: any) => {
    //             console.error(error.response);
    //             dispatch({ type: ALERT, payload: { error: `API is not available` } })
    //         }
    //     );
        
    // }
    // useEffect(() => {
    //     wake_up_call();
    // }, [])

    
    // window.addEventListener("beforeunload", (event) => {
    //     wake_up_call();
    //     console.log("API call before page reload");
    // });

    // Using getTeachers as an API call instead of using wake_up_call
    useEffect(() => {
        if (auth.access_token) {
            dispatch(getTeachers(auth.access_token))
        }
    }, [dispatch, auth.access_token])

    // Không phải admin thì không được vào router này
    if (auth.user?.role !== "admin") return <NotFound />

    return <div className="dashbroad">
        {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
        {
            // firstLoading ? 
            // <GlobalLoading /> :
            // <></>
        }
        <DashBroadUser auth={auth} />
        <TeacherCp />
    </div>;
};

export default Teacher;
