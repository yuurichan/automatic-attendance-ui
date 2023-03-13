import { RollCallSession } from '../../utils/interface'

export const CREATE_ROLL_CALL_SESSION = "CREATE_ROLL_CALL_SESSION"
export const GET_ROLL_CALL_SESSION_USER = "GET_ROLL_CALL_SESSION_USER"
export const DELETE_ROLL_CALL_SESSION = "DELETE_ROLL_CALL_SESSION"


export interface RollCallSessionPayload {
    rollCallSessions?: RollCallSession[]
}

interface CreateRollCallSession {
    type: typeof CREATE_ROLL_CALL_SESSION,
    payload: {
        rollCallSession: RollCallSession
    }
}

interface getRollCallSessionUser{
    type: typeof GET_ROLL_CALL_SESSION_USER,
    payload: {
        rollCallSessions: RollCallSession[]
    }
}

interface DeleteRollCallSession {
    type: typeof DELETE_ROLL_CALL_SESSION
    payload: {
        rollCallSession_id: string
    }
}

export type RollCallSessionType = CreateRollCallSession | getRollCallSessionUser | DeleteRollCallSession