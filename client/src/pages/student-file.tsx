import React, { useRef, useEffect, useState } from 'react'
import * as faceapi from 'face-api.js';
import { ALERT } from '../store/types/alertTypes'
import { useDispatch, useSelector } from 'react-redux'
import { RootStore, Course } from '../utils/interface'
import { postAPI, getAPI } from '../utils/fetchApi'
import Logo from '../images/logo.png'
import { Link } from 'react-router-dom'
import "../components/auth/auth.scss"
// Loading Imports
import GlobalLoading from '../components/globals/global-loading/GlobalLoading'
import Loading from '../components/globals/loading/Loading'

// MUI
import PrimaryTooltip from '../components/globals/tool-tip/Tooltip'
import { Button } from '@mui/material'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';

const StudentUpload = () => {
    const dispatch = useDispatch()
    const { auth, course: courses } = useSelector((state: RootStore) => state)
    const [loadingModel, setLoadingModel] = useState<boolean>(false)
    const [studentCode, setStudentCode] = useState<string>("")
    const [isDetecttion, setIsDetection] = useState<boolean>(false)
    const [isRecognition, setIsRecognition] = useState<boolean>(false)
    const [isFile, setIsFile] = useState<boolean>(false)
    const [image, setImage] = useState<any>(null)
    const [isFinished, setFinished] = useState<boolean>(false)
    // locking modal (as in restricting access to page)
    const [accessCode, setAccessCode] = useState<string>("")
    const [idList, setIdList] = useState<Course[]>()
    const [open, setOpen] = useState<boolean>(true)

    const refInput = useRef() as React.MutableRefObject<HTMLInputElement>;

    // loading modal (purely for page loading and API initializing)
    const [firstLoading, setFirstLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    // zoom test
    // useEffect(() => {
    //     document.body.style.transform = 'scale(.75)';

    //     return () => {
    //         // Return things to normal when this page is unmounted
    //         document.body.style.transform = 'scale(1)';
    //     }
    // }, [])

      // Tai cac mo hinh nhan dien khuon mat da duoc train san
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URI = process.env.PUBLIC_URL + '/models'

            Promise.all(
                [
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URI), // Pre-trained model d??ng ????? ph??t hi???n g????ng m???t.
                // faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URI),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI), // FaceLandmark68Net Model: Pre-trained model d??ng ????? x??c ?????nh ???????c c??c ??i???m xung quanh m???t.
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI) // Pre-trained model d??ng ????? nh???n d???ng g????ng m???t.
                ]
            )

            // Tai cac model nhan dien khuon mat thanh cong
            setLoadingModel(true);
            dispatch({ type: ALERT, payload: { success: "T???i c??c Pre-trained model th??nh c??ng" } })
            console.log('Models loaded');
        }
        loadModels()
    }, [])

    // get/grabbing courses id for the sake of verifying things
    const loadData = async () => {
        try {
            //const res = await getAPI('get_courses_student_guest').then(
            await getAPI('get_courses_student_guest').then(    
                (data) => {
                    console.log('Courses Length: ', data.data.courses.length);
                    console.log('Courses obtained');
                    setIdList(data.data.courses);
                }
            );
            setTimeout(() => {setFirstLoading(false)}, 1000);       // Moving this out seemed to have worked
            // If getAPI returns an error, the catch clause will run instead of setFirstLoading

            //console.log(res.data.courses);
            //setIdList(res.data.courses);
            //setTimeout(() => {setFirstLoading(false)}, 5000);
            
            //console.log('idList: ', idList);
            // only prints out the state prior to it since it belongs to a useState

            // res.data.courses?.forEach((obj: any) => {
            //     console.log(obj._id);
            // })
            
        }
        catch (error: any) {
            console.error(error.response);
            dispatch({ type: ALERT, payload: { error: `API is not available` } })
        } 
    }
    useEffect(() => {
        loadData();
    }, [])

    const getDesc = async () => {
        const descriptors: any[] = [];
        let flag = false;
        const user = studentCode;
        console.log('Requirements fulfilled');
        const img = await faceapi.fetchImage(image);

        const detection = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
            const fullFaceDescriptors = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            console.log('Fullface Descriptors: ', fullFaceDescriptors)
            
            if (!fullFaceDescriptors) {
                throw new Error(`No faces detected for ${user}`)
            }
            
            // Saving 128 descs
            descriptors.push(fullFaceDescriptors.descriptor)
            descriptors.forEach(desc => {
                console.log('Current Descriptors: ', desc)
            })
            console.log('Descs length: ', descriptors.length)

            const labeldFaceDescriptors = new faceapi.LabeledFaceDescriptors(user, descriptors);
            console.log({ labeldFaceDescriptors }, labeldFaceDescriptors.descriptors.length)

            console.log('Descriptors: ', labeldFaceDescriptors);
            if (labeldFaceDescriptors) saveFile(labeldFaceDescriptors);

            dispatch({ type: ALERT, payload: { success: `Nh???n di???n ${user} th??nh c??ng` } })
            setFinished(true);
            setLoading(false);
        }
        else {
            dispatch({ type: ALERT, payload: { error: `Kh??ng th??? x??c ?????nh khu??n m???t` } })
            setFinished(true);
            setLoading(false);
        }
    }
    const handleImageTraining = () => {
        if (loadingModel && image && studentCode) {
            setLoading(true);
            getDesc();
            handleResetInput();
        }
        

    }

    // save descriptors
    const saveFile = async (labedlFaceDescriptors: any) => {
        const labedlFaceDescriptorsJson = faceapi.LabeledFaceDescriptors.fromJSON(labedlFaceDescriptors).toJSON()
        try {
            //const res = await postAPI('face_api', labedlFaceDescriptorsJson, auth.access_token)
            const res = await postAPI('face_api_guest', labedlFaceDescriptorsJson)
            
            console.log(res)

        } catch (error: any) {
            console.log(error.response)
            dispatch({ type: ALERT, payload: { error: `L???i khi g???i d??? li???u` } })
        }
    }

    const handleResetInput = () => {
        // console.log('reset input');
        console.log('handleResetInput success');
        setStudentCode("");
        setImage(null);
        refInput.current.value = "";
        // if (studentCode && image && isFinished === true) {
        // }
    }

    // Misc.
    const onImageChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
        }
    }

    const handleAccessCodeChange = (e: any) => {
        setAccessCode(e.target.value);
        console.log(e.target.value);
    }

    useEffect(() => {
        console.log('useEff is called');

        // /api/get_courses
        idList?.forEach((obj) => {
            //if (accessCode === '63a9faac67069e00fcf5351c')
            if (accessCode === obj._id)
                handleClose();
        })

    }, [accessCode])

    const handleClose = () => {
        console.log('This is called');
        setOpen(false);
    }

    return (
        <div className="student-file auth-page">
            {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
            {
                firstLoading ? 
                <GlobalLoading /> :
                <></>
            }

            <div className="auth-page__form">
                <div className="auth-page__form-wrapper">
                    <img src={Logo} alt="logo" className="auth-page__form-logo" />
                    <h2 className="auth-page__form-title">Th??m D??? Li???u</h2>
                    <p className="auth-page__form-detail"><Link to='..'>Quay l???i</Link></p>

                    <div className='form-group'>
                        <label id="studentLabel" htmlFor="studentCode">M?? s??? sinh vi??n *</label>
                        <input id="studentCode"
                            value={studentCode}
                            disabled={loading}
                            onChange={(e) => setStudentCode(e.target.value)}
                            type="text" placeholder='Vui l??ng nh???p MSSV...' name='studentCode' />
                    </div>

                    <div className='form-group'>
                        <label id="fileLabel" htmlFor="fileInput">File h??nh ???nh khu??n m???t *</label>
                        <div className="auth-page__form-file">
                            <input name="fileInput" id="fileInput"
                            ref={refInput}
                            disabled={loading} 
                            type="file" 
                            accept="image/*" 
                            placeholder='Th??m file...'
                            onChange={onImageChange} />
                            <img width={240} src={image} alt="Image Preview" />
                        </div>
                    </div>
                    <Button disabled={(studentCode && image) ? false : true} variant='contained' className="identifie__btn-open" onClick={handleImageTraining}>
                        {loading ? 
                            <Loading type='small'/> :
                            <p className='button-text'>B???t ?????u nh???n di???n</p>
                        }
                    </Button>
                </div>
            </div>

            <div className="auth-page__background">
                <div className='auth-page__background-content'>
                    <h2>Ch??o m???ng b???n ?????n v???i CLASSKIT</h2>
                    <p>V???i trang web n??y vi???c ??i???m danh sinh vi??n tr??? n??n d??? d??ng khi gi??o vi??n c?? th??? t??? ??i???m danh, ho???c c?? th??? ??i???m danh t??? ?????ng b???ng khu??n m???t m???t c??ch ch??nh x??c,
                        nhanh g???n, ???n ?????nh, h???n ch??? m???i th??? t???c r?????m r??.</p>
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

            {/* Dialog Controll Attendance */}
        {
        <Dialog
            open={open}
            onClose={() => {}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <Box padding={2}>
                <Box display='flex' justifyContent="space-between" alignItems='center'>
                    <h2 className="modal__heading">Nh???p m?? cung c???p b???i gi??o vi??n</h2>
                    <br/>
                </Box>
                <Box display='flex' justifyContent="space-between" alignItems='center'>
                    <p className="auth-page__form-detail"><Link to='..'>Quay l???i</Link></p>
                </Box>
                <DialogActions>
                    <div className='form-group-access'>
                        <input id="studentAccessCode"
                            value={accessCode}
                            onChange={handleAccessCodeChange}
                            disabled={idList?.length === 0 || idList === undefined}
                            type="text" placeholder='Vui l??ng nh???p m??...' name='accessCode' />
                    </div>
                </DialogActions>
            </Box>
        </Dialog>
        }
        </div>
    )
}

export default StudentUpload;