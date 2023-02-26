import React from 'react'
import { useSelector } from 'react-redux'
import CourseBody from '../../components/course/CourseBody'
import DashBroadUser from '../../components/dashbroad/DashBroadUser'
import { RootStore } from "../../utils/interface"

/// Loading Imports
// import GlobalLoading from '../../components/globals/global-loading/GlobalLoading'
// import { ALERT } from '../../store/types/alertTypes'
// import { useDispatch,  } from 'react-redux'
// import { getAPI } from '../../utils/fetchApi'
// import { useRef, useEffect, useState } from 'react'

const Course = () => {

    const { auth } = useSelector((state: RootStore) => state)
    // loading modal (purely for page loading and API initializing)
    // const dispatch = useDispatch()
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

    return (
        <div className='course'>
            {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
            {
                // firstLoading ? 
                // <GlobalLoading /> :
                // <></>
            }

            <DashBroadUser auth={auth} />
            <CourseBody />
        </div>
    )
}

export default Course