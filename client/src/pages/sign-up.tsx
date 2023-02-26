import React from 'react'
import SignUpForm from '../components/auth/SignUpForm'
import Logo from '../images/logo.png'
import { Link } from 'react-router-dom'

/// Loading Imports
// import GlobalLoading from '../components/globals/global-loading/GlobalLoading'
// import { ALERT } from '../store/types/alertTypes'
// import { useDispatch, useSelector } from 'react-redux'
// import { getAPI } from '../utils/fetchApi'
// import { useRef, useEffect, useState } from 'react'

const SignUp = () => {
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
        <div className="sign-up auth-page">
            {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
            {
                // firstLoading ? 
                // <GlobalLoading /> :
                // <></>
            }

            <div className="auth-page__form">
                <div className="auth-page__form-wrapper">
                    <img src={Logo} alt="logo" className="auth-page__form-logo" />
                    <h2 className="auth-page__form-title">Đăng Kí</h2>
                    <p className="auth-page__form-detail">Bạn có sẳn tài khoản? <Link to='/sign-in'>Đăng nhập</Link></p>
                    <SignUpForm />
                </div>
            </div>
            <div className="auth-page__background">
                <div className='auth-page__background-content'>
                    <h2>Chào mừng bạn đến với CLASSKIT</h2>
                    <p>Với trang web này việc điểm danh sinh viên trở nên dễ dàng khi giáo viên có thể tự điểm danh, hoặc có thể điểm danh tự động bằng khuôn mặt một cách chính xác,
                        nhanh gọn, ổn định, hạn chế mọi thủ tục rườm rà.</p>
                    <div className='auth-page__background-circle auth-page__background-circle--small'></div>
                    <div className='auth-page__background-circle auth-page__background-circle--medium'></div>
                    <div className='auth-page__background-dots'>
                        <svg width="300" height="200" viewBox="0 0 100 100">
                            <defs>
                                <pattern id="lines" height="10" width="10" patternUnits="userSpaceOnUse">
                                    <line x1="0" y1="4" x2="2" y2="4" strokeWidth="2" stroke="rgba(90, 102, 119, 0.5)" />
                                </pattern>
                            </defs>
                            <rect x="10" y="10" width="80" height="80" fill="url(#lines)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp
