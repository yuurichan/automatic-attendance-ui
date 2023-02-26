import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootStore } from '../utils/interface'
import { Link } from 'react-router-dom'
import "./index.scss"
import DashBroadUser from '../components/dashbroad/DashBroadUser'

/// Loading Imports
import GlobalLoading from '../components/globals/global-loading/GlobalLoading'
import { ALERT } from '../store/types/alertTypes'
import { useDispatch } from 'react-redux'
import { getAPI } from '../utils/fetchApi'

const Home = () => {

    const { auth } = useSelector((state: RootStore) => state)

    // loading modal (purely for page loading and API initializing)
    const dispatch = useDispatch()
    const [firstLoading, setFirstLoading] = useState<boolean>(true);
    const wakeUpAddress = 'wake_up_call'

    // API call to wake the API site up (since it tends to be disabled after a period of inactivity)
    const wake_up_call = async () => {
        await getAPI(wakeUpAddress)
        .then(
            (data) => {
                console.log(data.data);     // should be API is available message
                setTimeout(() => {setFirstLoading(false)}, 1000);       // set Global Loading to false
            }
        )
        .catch(
            (error: any) => {
                console.error(error.response);
                dispatch({ type: ALERT, payload: { error: `API is not available` } })
            }
        );
        
    }
    useEffect(() => {
        wake_up_call();
    }, [])

    return (
        <div className="dashbroad">
            {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
            {
                firstLoading ? 
                <GlobalLoading /> :
                <></>
            }

            <DashBroadUser auth={auth} />
            <div className="dashbroad__body">
                <div className="dashbroad__body-box">
                    {
                        auth.user?.role === 'admin' && <Link className="box-item" to="/teacher">
                            <i className='bx bxs-graduation'></i>
                            <h3>Giáo viên</h3>
                        </Link>
                    }
                    {/* <Link className="box-item" to="/student">
                        <i className='bx bx-id-card'></i>
                        <h3>Sinh viên</h3>
                    </Link> */}
                    <Link className="box-item" to="/identifie">
                        <i className='bx bx-user-circle'></i>
                        <h3>Nhận diện</h3>
                    </Link>
                    {/* <Link className="box-item" to="/roll-call-session">
                        <i className='bx bx-edit'></i>
                        <h3>Buổi điểm danh</h3>
                    </Link> */}
                    <Link className="box-item" to="/course">
                        <i className='bx bx-book-open'></i>
                        <h3>Môn học</h3>
                    </Link>
                    <Link className="box-item" to="/lesson">
                        <i className='bx bx-chalkboard'></i>
                        <h3>Buổi học</h3>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default Home