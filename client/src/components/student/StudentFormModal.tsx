import React, { useState, useEffect } from 'react'
import { RootStore, FormSubmit, InputChange, Student, ErrorStudent, Course } from '../../utils/interface'
import { modelStyle } from '../../utils/model-style'
import Loading from '../../components/globals/loading/Loading'
import "./StudentFormModal.scss"
import { updateStudent } from '../../store/actions/courseActions'
import { useDispatch, useSelector } from 'react-redux'
import { validUpdateStudent } from '../../utils/valid'

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal'
import { IconButton } from '@mui/material';
import PrimaryTooltip from '../globals/tool-tip/Tooltip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { makeStyles } from '@mui/styles';

interface StudentFormModalProps {
    open: boolean
    hanldeSetOpen: React.Dispatch<React.SetStateAction<boolean>>
    onEdit?: Student | null
    setOnEdit: React.Dispatch<React.SetStateAction<Student | null>>
    course?: Course
}

const useStyles = makeStyles({
    Button: {
        fontSize: "1.3rem !important",
        fontWeight: "600 !important",
        height: "36px",
        padding: "10px !important",
    },
});

const StudentFormModal: React.FC<StudentFormModalProps> = ({ open, hanldeSetOpen, onEdit, setOnEdit, course }) => {

    const { auth, detailRollCallSession } = useSelector((state: RootStore) => state);
    const dispatch = useDispatch()
    const classes = useStyles()

    const initialStudent: Student = {
        name: "",
        studentCode: "",
        gender: "male",
        phone: "",
    }

    const initialErrorStudent: ErrorStudent = {
        errorName: "",
        errorStudentCode: "",
        errorGender: "",
        errorPhone: ""
    }

    const [student, setStudent] = useState<Student>(initialStudent)
    const [loading, setLoading] = useState<boolean>(false);
    const [errorStudent, setErrorStudent] = useState<ErrorStudent>(initialErrorStudent)

    const { name, studentCode, gender, phone } = student;

    const handleClose = () => {
        hanldeSetOpen(false)
        setOnEdit(null)
        setErrorStudent(initialErrorStudent)
    }

    // Handle change
    const hanldeChange = (e: InputChange) => {
        setStudent({
            ...student,
            [e.target.name]: e.target.value
        })

        if (e.target.name === "name") {
            setErrorStudent({
                ...errorStudent,
                errorName: ""
            })
        }

        if (e.target.name === "studentCode") {
            setErrorStudent({
                ...errorStudent,
                errorStudentCode: ""
            })
        }

    }

    // Submit Form to edit student
    const handleSubmit = async (e: FormSubmit) => {
        e.preventDefault()

        const errors = validUpdateStudent(student)

        if (Object.keys(errors).length > 0) {
            setErrorStudent(errors)
        } else {
            setLoading(true)
            await dispatch(updateStudent(student, auth, course as Course, detailRollCallSession))
            setLoading(false)
        }

    }

    useEffect(() => {
        if (onEdit) {
            setStudent(onEdit)
        } else {
            setStudent(initialStudent)
        }
    }, [onEdit])

    return <div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modelStyle}>
                <Box display="flex" alignItems='center' justifyContent="space-between" mb={2}>
                    <h2 className="modal__heading">Ch???nh s???a sinh vi??n</h2>
                    <Box>
                        <PrimaryTooltip title='????ng h???p tho???i'>
                            <IconButton size="medium" onClick={handleClose}>
                                <i className='bx bx-x' style={{ color: "#473fce", fontSize: "2.6rem" }}></i>
                            </IconButton>
                        </PrimaryTooltip>
                    </Box>
                </Box>
                <form className="student__form" onSubmit={handleSubmit}>
                    <div className="form__group">
                        <label htmlFor="name">H??? v?? t??n</label>
                        <input type="text" name="name" id="name" disabled={loading} value={name} onChange={hanldeChange} />
                        {
                            errorStudent?.errorName && <small className="text-error">{errorStudent?.errorName}</small>
                        }
                    </div>
                    <div className="form__group">
                        <label htmlFor="name">M?? s??? sinh vi??n</label>
                        <input type="text" name="studentCode" id="studentCode" disabled={loading} value={studentCode} onChange={hanldeChange} />
                        {
                            errorStudent?.errorStudentCode && <small className="text-error">{errorStudent?.errorStudentCode}</small>
                        }
                    </div>
                    <div className="form__group">
                        <label htmlFor="name">Gi???i t??nh</label>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="gender"
                            onChange={hanldeChange}
                            value={gender}
                        >
                            <FormControlLabel value="Nam" disabled={loading} 
                                control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 20, }, }} />}
                                label="Nam" />

                            <FormControlLabel value="Nu" disabled={loading} 
                                control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 20, }, }} />}
                                label="N???" />

                            <FormControlLabel value="Khac" disabled={loading} control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 20, }, }} />}
                                label="Kh??c" />
                        </RadioGroup>
                    </div>
                    <div className="form__group">
                        <label htmlFor="name">S??? ??i???n tho???i</label>
                        <input type="text" name="phone" id="phone" value={phone} disabled={loading} onChange={hanldeChange} />
                    </div>
                    <Box display="flex" justifyContent='flex-end'>
                        <Box>
                            <PrimaryTooltip title="T???o kho?? h???c">
                                <Button type="submit" variant='contained' className={classes.Button}>{loading ? <><Loading type='small' /><p style={{ textTransform: "initial", marginLeft: "10px" }}>??ang c???p nh???t...</p></> : <p style={{ textTransform: "capitalize" }}>C???p nh???t</p>}</Button>
                            </PrimaryTooltip>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Modal>
    </div >

}

export default StudentFormModal