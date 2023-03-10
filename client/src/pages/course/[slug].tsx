import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Course, Params, RootStore } from "../../utils/interface"
import { useParams, useHistory } from 'react-router-dom'
import CourseCard from '../../components/course/CourseCard'
import { getAPI } from '../../utils/fetchApi'
import { ALERT } from '../../store/types/alertTypes'
import { deleteCourse, getDetailCourse } from '../../store/actions/courseActions'
import "./Course.scss"
import CourseFormModal from '../../components/course/CourseFormModal'
import Loading from '../../components/globals/loading/Loading'

// MUI
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material'
import PrimaryTooltip from '../../components/globals/tool-tip/Tooltip'
import { makeStyles } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

/// Loading Imports
//import GlobalLoading from '../../components/globals/global-loading/GlobalLoading'

const useStyles = makeStyles({
    Button: {
        fontSize: "1rem !important",
        fontWeight: "600 !important",
        height: "36px",
        padding: "4px !important",

    },
})


const CourseDetal = () => {
    const classes = useStyles()
    const history = useHistory()
    const dispatch = useDispatch()
    const { slug }: Params = useParams()
    const { auth, profile, detailCourse } = useSelector((state: RootStore) => state)
    const [course, setCourse] = useState<Course>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [onEdit, setOnEdit] = useState<Course | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [loadingDeleteCourse, setLoadingDeleteCourse] = useState<boolean>(false)

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

    useEffect(() => {
        
        const getCourseDetail = async () => {
            setLoading(true)
            await dispatch(getDetailCourse(detailCourse, slug, auth))
            setLoading(false)
        }
        
        // replace GET wake_up_call with the current GET detail course here? (use then or sth)
        getCourseDetail()
        
        detailCourse.courses.forEach(course => {
            if (course._id === slug) {
                setCourse(course)
            }
        })

        // Unmounted
        return () => {
            setCourse({})
            setOnEdit(null)
            setOpen(false)
        }
    }, [slug, detailCourse, auth, dispatch])

    const handleClickOpen = (course: Course | null) => {
        setOnEdit(course)
        setOpen(true);
    };

    const hanldeDeleteCourse = async (id: string) => {
        setLoadingDeleteCourse(true);
        await dispatch(deleteCourse(id, auth, profile))
        setLoadingDeleteCourse(false);
        return history.push('/')
    }

    if (!auth.user || !auth.access_token) return "";

    return (
        <div className='course-detail'>
        {/* Added Global Page Loading (is used when waiting for API to be initialized) */}
        {
            // firstLoading ? 
            // <GlobalLoading /> :
            // <></>
        }

            <div className="dashbroad__body dashbroad__body--xl">
                <div className="course-detail__body">
                    <div className="body__control">
                        <h2>
                            Chi ti???t m??n h???c
                        </h2>
                        {
                            course.teacher && course.teacher._id === auth.user._id && <div style={{ display: "flex" }}>
                                <div className="course__control-remove" style={{ marginRight: "10px" }}>
                                    <PrimaryTooltip title="Xo?? m??n h???c">
                                        <Button variant='contained' color="error" onClick={() => setOpenDialog(true)}>
                                            <DeleteIcon style={{ marginRight: "5px" }} /> <span className="mui-text-btn">Xo??</span>
                                        </Button>
                                    </PrimaryTooltip>
                                </div>
                                <div className="course__control-add">
                                    <PrimaryTooltip title="Ch???nh s???a m??n h???c">
                                        <Button variant='contained' onClick={() => handleClickOpen(course)}>
                                            <EditIcon style={{ marginRight: "5px" }} /> <span className="mui-text-btn">Ch???nh s???a</span>
                                        </Button>
                                    </PrimaryTooltip>
                                </div>
                            </div>
                        }
                    </div>
                    <CourseFormModal open={open} hanldeSetOpen={setOpen} onEdit={onEdit} setOnEdit={setOnEdit} />
                    {/* Dialog confirm delete course */}
                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <h3 className='modal__heading' style={{ margin: "16px" }}>
                            B???n c?? ch???c mu???n xo?? m??n h???c n??y!
                        </h3>
                        <DialogActions>
                            <Button variant='contained' onClick={() => setOpenDialog(false)} color='error'>
                                <p style={{ textTransform: "capitalize", fontSize: '1.3rem' }}>
                                    Hu??? xo??
                                </p>
                            </Button>
                            <Button variant='contained' onClick={() => hanldeDeleteCourse(course._id as string)} className={classes.Button}>
                                {loadingDeleteCourse ? <Loading type='small' /> :
                                    <p style={{ textTransform: "capitalize", fontSize: '1.3rem' }}>
                                        ?????ng ??
                                    </p>}

                            </Button>
                        </DialogActions>
                    </Dialog>
                    <div className='course-detail__container'>
                        <CourseCard course={course} auth={auth} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseDetal

