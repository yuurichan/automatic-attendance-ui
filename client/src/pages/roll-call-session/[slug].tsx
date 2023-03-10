import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FormSubmit, InputChange, Params } from '../../utils/interface'
import { RootStore, RollCallSession, Attendance } from '../../utils/interface'
import { useDispatch, useSelector } from 'react-redux'
import { getDetailRollCallSession, updateDetailRollCallSession, updateAttendanceDetail } from '../../store/actions/rollCallSession'
import dayjs from 'dayjs'
import "./RollCallSessionDetail.scss"
import Loading from '../../components/globals/loading/Loading'
import Logo from '../../images/logo.png';
import { ALERT } from '../../store/types/alertTypes'
import { countAbsent } from '../../utils/student'
import { postAPI, putAPI } from '../../utils/fetchApi'

// Face Api
import * as faceapi from 'face-api.js';

// MUI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AttendanceDetailRow from '../../components/roll-call-session/AttendanceDetailRow'
import { makeStyles } from '@mui/styles';
import PrimaryTooltip from '../../components/globals/tool-tip/Tooltip'
import { Button } from '@mui/material'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';


const useStyles = makeStyles({
    TableContainer: {
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important",
        borderRadius: "5px !important",
    },
    TableCellHead: {
        fontSize: "1.4rem !important",
        fontFamily: "-apple-system, BlinkMacSystemFont, Inter,' Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;",
        fontWeight: "600 !important",
        height: "60px !important",
    },
    SekeletonRadius: {
        borderRadius: "5px"
    },
    TableCellBody: {
        fontSize: "1.4rem !important",
        fontFamily: "-apple-system, BlinkMacSystemFont, Inter,' Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;",
        fontWeight: "500 !important",
    },

    TableCellBodyId: {
        fontSize: "1.4rem !important",
        fontFamily: "-apple-system, BlinkMacSystemFont, Inter,' Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;",
        fontWeight: "500 !important",
        "maxWidth": "150px",
        "WebkitLineClamp": "1",
        "WebkitBoxOrient": "vertical",
        "overflow": "hidden",
        "textOverflow": "ellipsis",
    },
    TableCellBodyDate: {
        width: "100px !important"
    }
});

const RollCallSessionDetail = () => {

    const classes = useStyles();
    const dispatch = useDispatch();
    const { slug }: Params = useParams();
    const { detailRollCallSession: detailRollCallSessionStore, auth, lessonDetail } = useSelector((state: RootStore) => state)

    // State
    const [detailRollCallSession, setDetailRollCallSession] = useState<RollCallSession>({})
    const [comment, setComment] = useState<string>();
    const [loadingComment, setLoadingCommnet] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [openControlAttendace, setOpenControlAttendance] = useState<boolean>(true);
    const [handmade, setHandmade] = useState<number>(0)
    const [loadingAttendace, setLoadingAttendace] = useState<boolean>(false)
    const [tracks, setTracks] = useState<any>()
    const [playing, setPlaying] = useState<boolean>(false)
    const [loadingModel, setLoadingModel] = useState<boolean>(false)
    const [loadingDescriptors, setLoadingDescriptors] = useState<boolean>(false)
    const [isEmptyDescriptors, setIsEmptyDescriptors] = useState<boolean>(false)
    const [faceMatcher, setFaceMatcher] = useState<any>()

    const [timers, setTimers] = useState<any>()
    const [studentCodeList, setStudentCodeList] = useState<any[]>()
    const [isButtonAvailable, setButtonAvailable] = useState<boolean>(true)
    //const [isSessionEnd, setSessionEnd] = useState<boolean>(false)

    //test (this is used for the sake of re-rendering the attendance list)
    const [rerender, setRender] = useState<Number>(0);
    const forceUpdateRe = React.useReducer(() => ({}), {})[1] as () => void

    const [, updateState] = useState<any>();
    const forceUpdate = useCallback(() => updateState({}), []);

    // Ref
    const refCamera = useRef<any>(null);
    const refCanvas = useRef<any>(null);

    console.log('detailRollCallSession: ', detailRollCallSession);
    // this might be used to refresh and/or re-render components but it doesn't seem to work
    // l?? do c?? th??? 2 lu???ng API ????a chi ti???t v?? nh???n chi ti???t ??i???m danh ch???y song song v?? kh??c nhau => trang ko nh???n ra v?? rerender ??c
    useEffect(() => {
        console.log('This is triggered');
        if (slug) {
            const handleGetDetailRollCallSession = async () => {
                dispatch(getDetailRollCallSession(detailRollCallSessionStore, slug, auth))
            }
            handleGetDetailRollCallSession()
            console.log('Get Detail');
        }
        

        detailRollCallSessionStore.rollCallSessions?.filter(rollCallSession => {
            if (rollCallSession._id === slug) {
                setDetailRollCallSession({...rollCallSession})
                setComment(rollCallSession.comment)
            }
            console.log('Get Session');
        })

    }, [slug, auth, detailRollCallSessionStore.rollCallSessions, rerender])

    // Load models
    useEffect(() => {
        if (handmade === 2) {
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
            }
            loadModels()
        }
    }, [handmade])

    // Get Descriptor from server
    useEffect(() => {
        if (handmade === 2) {
            const getDescriptors = async () => {
                let studentCodeList: any[] = [];
                detailRollCallSession?.attendanceDetails?.forEach((attendanceDetail) => {
                    studentCodeList.push(attendanceDetail?.student?.studentCode)
                })
                setStudentCodeList(studentCodeList)

                const res = await postAPI('face_api_descriptors', { studentCodeList }, auth.access_token)

                console.log('Response: ', res)

                const faceDescriptors: any[] = [];


                if (res.data.descriptors.length !== 0) {
                    res.data.descriptors.forEach((_descriptors: any) => {
                        faceDescriptors.push(new faceapi.LabeledFaceDescriptors(_descriptors.label, [new Float32Array(_descriptors.descriptors[0],_descriptors.descriptors[1],_descriptors.descriptors[2])]))

                    })

                    console.log(faceDescriptors)

                    const faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.6)
                    setFaceMatcher(faceMatcher)
                    setLoadingDescriptors(true)
                    dispatch({ type: ALERT, payload: { success: res.data.msg } })
                    setIsEmptyDescriptors(false)
                } else {
                    setIsEmptyDescriptors(true)
                    dispatch({ type: ALERT, payload: { error: "Trong l???p h???c ch??a c?? sinh vi??n n??o ???????c nh???n di???n khu??n m???t t??? tr?????c" } })

                }
            }
            getDescriptors()
        }
    }, [handmade])

    useEffect(() => {
        if (isEmptyDescriptors) {
            hanldeCloseCamera();
        }
    }, [isEmptyDescriptors])

    //  Luu nhan xet
    const handleSubmit = async (e: FormSubmit) => {
        e.preventDefault()
        setLoadingCommnet(true)
        await dispatch(updateDetailRollCallSession({ ...detailRollCallSession, comment }, auth, detailRollCallSessionStore, lessonDetail))
        setLoadingCommnet(false)
    }

    // Ket thuc buoi diem danh
    const handleEndRollCallSession = async (detailRollCallSession: RollCallSession) => {
        try {
            dispatch({ type: ALERT, payload: { loading: true } })
            await dispatch(updateDetailRollCallSession({ ...detailRollCallSession, end: true }, auth, detailRollCallSessionStore, lessonDetail))
            handleCloseDialog()
        } catch (error: any) {
            dispatch({ type: ALERT, payload: { loading: false } })
            dispatch({ type: ALERT, payload: { error: error.response.d??t.msg } })
        }

        setButtonAvailable(false);
    }

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleCloseDialogControlAttendance = (isClose: boolean) => {

        if (isEmptyDescriptors) {
            setHandmade(1);
            return;
        }

        if (isClose) setHandmade(1)
        setOpenControlAttendance(false)
    }

    useEffect(() => {
        forceUpdateRe();
        console.log('rerender: ', rerender);        
    }, [rerender])

    // useEffect(() => {
    //     return () => {
    //         if (playing === true && tracks && timers) {
    //             //console.log(playing, tracks, timers, '+++ UseEff is triggered')
    //             hanldeCloseCamera()
    //             setIsEmptyDescriptors(false)
    //             clearInterval(timers)
    //             console.log('Camera closed since there is a change in either playing/tracks/timers')
    //             console.log(playing, tracks, timers)
    //         }
    //     }
    // }, [playing, tracks, timers])
    useEffect(() => {
        return () => {
            if (playing === true && timers && tracks) {
                console.log(playing, tracks, timers, '+++ UseEff is triggered')
                setPlaying(false)
                setTracks(null)
                setTimers(0)
                tracks && tracks.forEach((track: any) => { track.stop(); })
                refCamera.current?.srcObject?.getTracks()[0].stop();
                setIsEmptyDescriptors(false);
                clearInterval(timers);
                console.log('Camera closed since there is a change in either playing/tracks/timers')
                //console.log(playing, tracks, timers)
            }
        }
    }, [playing, timers, tracks]) // useEff dc goi khi mot trong cac gtri thay doi
    // EDIT: it's finally fixed! literally an hour before New Years Eve
    // ch??? y???u ???????c d??ng khi camera c??n m??? v?? ng?????i d??ng chuy???n qua trang kh??c b???t ng??? => t??? ?????ng t???t cam

    // Open camera
    const handleOpenCamera = () => {
        if (navigator.mediaDevices) {
            setPlaying(true)
            navigator.mediaDevices.getUserMedia({
                video: true
            }).then(stream => {
                let video = refCamera.current
                if (video) {
                    video.srcObject = stream
                    const track = stream.getTracks()
                    setTracks(track)
                    console.log('Camera Opened');
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }

    // Close camera
    const hanldeCloseCamera = () => {
        if (tracks) {
            setPlaying(false)
            tracks && tracks.forEach((track: any) => { track.stop(); })
            refCamera.current?.srcObject?.getTracks()[0].stop();
            clearInterval(timers)
            console.log('Camera Close Handler: ', playing, tracks, timers)
        }
    }

    // Play camera
    const hanldeCameraPlay = () => {
        if (loadingModel && loadingDescriptors && !isEmptyDescriptors) {
            const timer = setInterval(async () => {
                console.log('playing')

                // Tao canvas de ve 
                refCanvas.current.innerHTML = faceapi.createCanvasFromMedia(refCamera.current)
                const displaySize = {
                    width: 640, height: 480
                }

                faceapi.matchDimensions(refCanvas.current, displaySize)

                // Computing Face Descriptors
                // T??nh to??n c??c g???c c???nh tr??n khu??n m???t
                const detection = await faceapi.detectSingleFace(refCamera.current, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor()

                if (detection) {
                    const fullFaceDescriptions = faceapi.resizeResults(detection, displaySize)
                    // // Xoa cac canvas truoc
                    if (refCanvas.current) {
                        refCanvas.current.getContext('2d').clearRect(0, 0, 640, 480)
                    }

                    // L???y c??c ??i???m trong khu??n m???t, sau ???? v??? l??n canvas
                    const box = fullFaceDescriptions?.detection?.box
                    const drawBox = new faceapi.draw.DrawBox(box as any, {
                        label: faceMatcher.findBestMatch(detection.descriptor)
                    })
                    drawBox.draw(refCanvas.current)

                    const face = faceMatcher.findBestMatch(detection.descriptor)

                    //let attendance: any;
                    let attendance : Attendance = {} as Attendance;
                    detailRollCallSession.attendanceDetails?.forEach(_attendance => {
                        if (_attendance.student?.studentCode === face.label) {
                            attendance = _attendance;
                        }
                    })
                    // This one takes singular values, so it only updates for one student at a time?

                    // Is it singular or multiples because there's some sort of a visual error with this one as far as I'm concerned
                    // It affects the checkmark and the counts as well, visually speaking
                    // It updates every 200ms, the data is saved but the checkmarks aren't displaying correctly (as in it only renders the current student being checked?)
                    // Only after refreshing the page do the checkmarks work correctly
                    console.log(attendance)
                    if (attendance) {
                        if (attendance.absent === true) {
                            const data = {
                                absent: false
                            }

                            await putAPI(`attendance_detail/${attendance._id}`, data, auth.access_token)
                            dispatch({ type: ALERT, payload: { success: "??i???m danh th??nh c??ng" } })

                            const newAttendanceDetails = detailRollCallSession.attendanceDetails?.map((_attendanceDetail) => {
                                //console.log('_attendanceDetail: ', _attendanceDetail);
                                return _attendanceDetail._id === attendance._id ? { ...attendance, absent: !attendance.absent } : _attendanceDetail
                            })

                            console.log('newAttendanceDetails: ', newAttendanceDetails);
                            dispatch(updateAttendanceDetail({ ...detailRollCallSession, attendanceDetails: newAttendanceDetails }, auth, detailRollCallSessionStore, lessonDetail))
                            setDetailRollCallSession({
                                ...detailRollCallSession,
                                attendanceDetails : newAttendanceDetails
                            })

                            
                            
                            rerender === 0 ? setRender(1) : setRender(0)
                        } else {
                            return;
                        }
                        // attendance obj needs to be flushed and made anew?
                        // if (slug) {
                        //     const handleGetDetailRollCallSession = async () => {
                        //         dispatch(getDetailRollCallSession(detailRollCallSessionStore, slug, auth))
                        //     }
                        //     handleGetDetailRollCallSession()
                        //     console.log('Get Detail 2');
                        // }
                        // detailRollCallSessionStore?.rollCallSessions?.filter(rollCallSession => {
                        //     if (rollCallSession._id === slug) {
                        //         setDetailRollCallSession({...rollCallSession})
                        //         setComment(rollCallSession.comment)
                        //     }
                        //     console.log('Get Session 2');
                        // })
                    }

                }
            }, 200)
            console.log({ timer })
            setTimers(timer)
        }
        console.log('Camera Recog. stopped since models aren\'t loaded')
    }



    return (
        <div className='dashbroad__body dashbroad__body--xl'>
            <div className='rollcallsession-detail'>
                {/* Header */}
                <div className="rollcallsession-detail__header">
                    <div className="header__left">
                        <h2>
                            {
                                detailRollCallSession.lesson?.course?.name
                            }
                            {
                                detailRollCallSessionStore.loading && <Box display={'flex'} marginLeft={"-10px"}>
                                    <Skeleton width={300} height={40} variant='text'></Skeleton>
                                    <Box>
                                        <Skeleton width={50} height={40} variant='text'></Skeleton>
                                    </Box>
                                </Box>
                            }

                            {
                                !detailRollCallSessionStore.loading && <span>
                                    #{
                                        detailRollCallSession.lesson?.course?.courseCode
                                    }
                                </span>
                            }
                        </h2>
                        <div className="header__left-comment">
                            {
                                detailRollCallSessionStore.loading && <Box display={'flex'}>
                                    <Skeleton width={300} height={25} variant='text'></Skeleton>
                                </Box>
                            }
                            {

                                !detailRollCallSessionStore.loading && (detailRollCallSession.comment ? detailRollCallSession.comment : "Ch??a c?? nh???n x???t v??? bu???i h???c")

                            }
                        </div>

                    </div>
                    <div className="header__right">
                        {
                            detailRollCallSession.end && <h2><i className='bx bxs-alarm-exclamation' ></i>Bu???i h???c ???? k???t th??c</h2>
                        }
                        <div className="header__btn-end">
                            {
                                detailRollCallSessionStore.loading && <Box display={'flex'}>
                                    <Skeleton className={classes.SekeletonRadius} width={100} height={40} variant='rectangular'></Skeleton>
                                </Box>
                            }
                            {
                                (!detailRollCallSession.end && detailRollCallSessionStore.loading === false) && <PrimaryTooltip title="K???t th??c bu???i ??i???m danh" color='error'>
                                    <Button onClick={() => setOpen(true)} variant='contained'>
                                        <i style={{ fontSize: '2.4rem', marginRight: "5px" }} className='bx bx-stopwatch'></i>  <p className="button-text">K???t Th??c</p>
                                    </Button>
                                </PrimaryTooltip>
                            }
                            {/* Dialog Confirm End Roll Call Session */}
                            <Dialog
                                open={open}
                                onClose={handleCloseDialog}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <Box padding={2}>
                                    <Box display='flex' justifyContent="space-between" alignItems='center' mb={2}>
                                        <h2 className="modal__heading" style={{ color: "crimson" }}>K???t th??c bu???i ??i???m danh</h2>
                                        <Box>
                                            <PrimaryTooltip title='????ng h???p tho???i'>
                                                <IconButton size="medium" onClick={handleCloseDialog}>
                                                    <i className='bx bx-x' style={{ color: "#473fce", fontSize: "2.6rem" }}></i>
                                                </IconButton>
                                            </PrimaryTooltip>
                                        </Box>
                                    </Box>
                                    <div style={{ marginBottom: "20px" }}>
                                        <p style={{ fontSize: "1.4rem" }}>
                                            B???n c?? ch???c mu???n k???t th??c bu???i ??i???m danh, m???i h??nh ?????ng ??i???m danh s??? kh??ng c??n ???????c th???c hi???n n???a !!!
                                        </p>
                                    </div>
                                    <DialogActions>
                                        <PrimaryTooltip title="K???t th??c bu???i ??i???m danh">
                                            <Button color="success" onClick={handleCloseDialog} variant='contained'>
                                                <p className="button-text">????ng</p>
                                            </Button>
                                        </PrimaryTooltip>
                                        <PrimaryTooltip title="K???t th??c bu???i ??i???m danh" >
                                            <Button color="error" onClick={(() => {handleEndRollCallSession(detailRollCallSession); hanldeCloseCamera();})} variant='contained'>
                                                <i style={{ fontSize: '2.4rem', marginRight: "5px" }} className='bx bx-exit'></i>  <p className="button-text">K???t Th??c</p>
                                            </Button>
                                        </PrimaryTooltip>
                                    </DialogActions>
                                </Box>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Control */}
                <div className="rollcallsession-detail__control">
                    {/* Detail Roll Call Session Card */}
                    <div className='rollcallsession-detail__control-detail'>
                        <div className="detail__infor">
                            <div className="detail__infor-header">
                                <img src={Logo} alt="logo" />
                                <div className="header__right">
                                    <span className="header__right-badge">
                                        C?? m???t: {countAbsent(detailRollCallSession.attendanceDetails ? detailRollCallSession.attendanceDetails : [], false)}
                                    </span>
                                    <span className="header__right-badge header__right-badge--absent">
                                        V???ng: {countAbsent(detailRollCallSession.attendanceDetails ? detailRollCallSession.attendanceDetails : [], true)}
                                    </span>
                                </div>
                            </div>
                            <div className="detail__infor-group">
                                {
                                    detailRollCallSessionStore.loading ? <Skeleton height={22} variant="text" width={50} />
                                        : <>
                                            <i className='bx bxs-calendar-week' ></i>
                                            <span>{detailRollCallSession.lesson?.weekday}</span>
                                        </>
                                }
                            </div>
                            <div className="detail__infor-group">
                                {
                                    detailRollCallSessionStore.loading ? <Skeleton height={22} variant="text" width={200} />
                                        : <>
                                            <i className='bx bxs-time'></i>
                                            <span>Th???i gian b???t ?????u: {dayjs(detailRollCallSession.lesson?.timeStart).format("hh:mm a")}</span>
                                        </>
                                }
                            </div>
                            <div className="detail__infor-group">
                                {
                                    detailRollCallSessionStore.loading ? <Skeleton height={22} variant="text" width={200} />
                                        : <>
                                            <i className='bx bxs-time-five'></i>
                                            <span>Th???i gian k???t th??c: {dayjs(detailRollCallSession.lesson?.timeEnd).format("hh:mm a")}</span>
                                        </>
                                }
                            </div>
                            <div className="detail__infor-group">
                                {
                                    detailRollCallSessionStore.loading ? <Skeleton height={22} variant="text" width={220} />
                                        : <>
                                            <i className='bx bxs-graduation'></i>
                                            {
                                                <span>{detailRollCallSession.teacher?.name} ({detailRollCallSession.teacher?.account})</span>
                                            }
                                        </>
                                }

                            </div>

                        </div>

                        {/* Comment */}
                        <div className="detail__comment">
                            <form onSubmit={handleSubmit}>
                                <div className="form__group">
                                    <label htmlFor="comment">Nh???n x??t bu???i h???c</label>
                                    <textarea
                                        cols={20}
                                        rows={5}
                                        value={comment ? comment : ""}
                                        name='commnet'
                                        id='comment'
                                        onChange={(e: InputChange) => setComment(e.target.value)} />
                                </div>
                                <div className="form__button">
                                    <PrimaryTooltip title="L??u nh???n x??t">
                                        <Button variant='contained' type='submit'>
                                            {
                                                loadingComment ?
                                                    <><Loading type='small'></Loading><p style={{ textTransform: "initial", fontSize: "1.3rem", marginLeft: "15px" }}>??ang l??u...</p></>
                                                    : <p style={{ textTransform: "initial", fontSize: "1.3rem" }}>L??u</p>
                                            }
                                        </Button>
                                    </PrimaryTooltip>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>

                {/* Tabel */}
                <div className='rollcallsession-detail__table'>

                    {handmade === 1 || (handmade === 2 && isEmptyDescriptors === true) ? <TableContainer className={classes.TableContainer} component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.TableCellHead} align="left">H??? v?? t??n</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">MSSV</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">Gi???i t??nh</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">Ng??y</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">H???c ph???n</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">??i???m danh</TableCell>
                                    <TableCell className={classes.TableCellHead} align="left">Ghi ch??</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    detailRollCallSession.attendanceDetails?.map((attendance) => {
                                        return <AttendanceDetailRow key={attendance._id} attendance={attendance} detailRollCallSession={detailRollCallSession} />
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer> : handmade === 2 ? <div className="rollcallsession-detail__camera">
                        {/* <p> Hi???n ch???c n??ng ??ang ph??t tri???n!</p> */}
                        {/* Everything works data-wise, couldn't fix the visual part though */}
                        {
                            !playing ? <Button variant='contained' onClick={handleOpenCamera} disabled={!isButtonAvailable}>
                                <p className="button-text">M??? camera</p>
                            </Button> :
                                <Button variant='contained' onClick={hanldeCloseCamera}>
                                    <p className="button-text">????ng camera</p>
                                </Button>
                        }
                        {
                            playing && <div className="rollcallsession-detail__camera-wrapper">
                                <video onPlay={hanldeCameraPlay} ref={refCamera} autoPlay muted></video>
                                <canvas ref={refCanvas}></canvas>
                            </div>
                        }
                        <TableContainer className={classes.TableContainer} component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.TableCellHead} align="left">H??? v?? t??n</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">MSSV</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">Gi???i t??nh</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">Ng??y</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">H???c ph???n</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">??i???m danh</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        detailRollCallSession.attendanceDetails?.map((attendance) => {
                                            return <TableRow
                                                key={attendance._id}
                                                className="detail__row"
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        !attendance.student?._id && <p style={{ color: "crimson" }}>Sinh vi??n n??y ???? b??? xo?? kh???i l???p h???c</p>
                                                    }
                                                    {
                                                        attendance.student?.name
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        attendance.student?.studentCode
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        attendance.student?.gender
                                                    }
                                                </TableCell>
                                                <TableCell className={`${classes.TableCellBody} ${classes.TableCellBodyDate}`} align="left">
                                                    <p style={{ width: "100px" }}>
                                                        {
                                                            dayjs(attendance?.date).format("DD-MM-YYYY")
                                                        }
                                                    </p>
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        detailRollCallSession.lesson?.course?.courseCode
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    <FormGroup>
                                                        {
                                                            attendance.student?._id && <FormControlLabel control={!loadingAttendace ? <Checkbox disabled={true} checked={attendance.absent ? false : true} color='secondary' sx={{ '& .MuiSvgIcon-root': { fontSize: 30 } }} /> : <CircularProgress />} label="C?? m???t" />
                                                        }
                                                    </FormGroup>
                                                </TableCell>

                                            </TableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div> : <TableContainer className={classes.TableContainer} component={Paper}>
                            {/* Cho ph??p hi???n th??? n???u handmade === 0; TH???p c???n xem chi ti???t ??i???m danh */}
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.TableCellHead} align="left">H??? v?? t??n</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">MSSV</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">Gi???i t??nh</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">Ng??y</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">H???c ph???n</TableCell>
                                        <TableCell className={classes.TableCellHead} align="left">??i???m danh</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        detailRollCallSession.attendanceDetails?.map((attendance) => {
                                            return <TableRow
                                                key={attendance._id}
                                                className="detail__row"
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        !attendance.student?._id && <p style={{ color: "crimson" }}>Sinh vi??n n??y ???? b??? xo?? kh???i l???p h???c</p>
                                                    }
                                                    {
                                                        attendance.student?.name
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        attendance.student?.studentCode
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        attendance.student?.gender
                                                    }
                                                </TableCell>
                                                <TableCell className={`${classes.TableCellBody} ${classes.TableCellBodyDate}`} align="left">
                                                    <p style={{ width: "100px" }}>
                                                        {
                                                            dayjs(attendance?.date).format("DD-MM-YYYY")
                                                        }
                                                    </p>
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    {
                                                        detailRollCallSession.lesson?.course?.courseCode
                                                    }
                                                </TableCell>
                                                <TableCell className={classes.TableCellBody} align="left">
                                                    <FormGroup>
                                                        {
                                                            attendance.student?._id && <FormControlLabel control={!loadingAttendace ? <Checkbox disabled={true} checked={attendance.absent ? false : true} color='secondary' sx={{ '& .MuiSvgIcon-root': { fontSize: 30 } }} /> : <CircularProgress />} label="C?? m???t" />
                                                        }
                                                    </FormGroup>
                                                </TableCell>

                                            </TableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </div>

                {/* Dialog Controll Attendance */}
                {
                    !detailRollCallSession.end ? <Dialog
                        open={openControlAttendace}
                        onClose={handleCloseDialogControlAttendance}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <Box padding={2}>
                            <Box display='flex' justifyContent="space-between" alignItems='center' mb={2}>
                                <h2 className="modal__heading">Ch???n c??ch th???c ??i??m danh</h2>
                            </Box>
                            <DialogActions>
                                <PrimaryTooltip title="??i???m danh th??? c??ng b???ng tay">
                                    <Button color="success" variant='contained' onClick={() => { setHandmade(1); handleCloseDialogControlAttendance(false) }}>
                                        <i style={{ fontSize: '2.4rem', marginRight: "5px" }} className='bx bx-table'></i>  <p className="button-text">??i???m danh th??? c??ng</p>
                                    </Button>
                                </PrimaryTooltip>
                                <PrimaryTooltip title="??i???m danh t??? ?????ng b???ng khu??n m???t" >
                                    <Button color="info" variant='contained' onClick={() => { setHandmade(2); handleCloseDialogControlAttendance(false); handleOpenCamera() }}>
                                        <i style={{ fontSize: '2.4rem', marginRight: "5px" }} className='bx bx-user-circle'></i>  <p className="button-text">??i???m danh t??? ?????ng</p>
                                    </Button>
                                </PrimaryTooltip>
                            </DialogActions>
                        </Box>
                    </Dialog> : <></>
                }
            </div>
        </div>

    )
}

export default RollCallSessionDetail