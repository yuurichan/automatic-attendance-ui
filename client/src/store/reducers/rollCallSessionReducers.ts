import * as types from '../types/rollCallSessionTypes'
import { RollCallSessionType, RollCallSessionPayload } from '../types/rollCallSessionTypes'

const initialState: RollCallSessionPayload = {
    rollCallSessions: []
}

const rollCallSessionReducer = (state: RollCallSessionPayload = initialState, action: RollCallSessionType): RollCallSessionPayload => {
    switch (action.type) {
        case types.CREATE_ROLL_CALL_SESSION: {
            return {
                ...state,
                rollCallSessions: state.rollCallSessions ? [{ ...action.payload.rollCallSession }, ...state.rollCallSessions] : []
            }
        }
        case types.GET_ROLL_CALL_SESSION_USER: {
            return {
                ...state,
            }
        }
        case types.DELETE_ROLL_CALL_SESSION: {
            console.log('This is called: ', action.payload.rollCallSession_id)
            console.log('Current rcSes state (before filtering): ', state.rollCallSessions)
            return {
                ...state,
                rollCallSessions: state.rollCallSessions?.filter((rcSession) => {
                    return rcSession._id !== action.payload.rollCallSession_id
                })
                // Essentially removing the deleted rcSes from the rcSes array
            }
        }
        default:
            return {
                ...state
            }
    }
}

export default rollCallSessionReducer;
