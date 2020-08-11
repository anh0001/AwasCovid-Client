// import { Record } from 'immutable';
import {
    GET_IMAGE,
    GET_IMAGE_SUCCESS,
} from './dashboardConstants';

export const initialState = {
    loading: false,
    deviceId: '',
    message: null,
    imageURL: null,
    status: '',
};

export default function dashboardReducer(state = initialState, action = {}) {
    switch (action.type) {
        case GET_IMAGE:
            return {
                ...state,
                loading: true,
                message: null,
                deviceId: action.deviceId,
                status: 'Buffering',
            };

        case GET_IMAGE_SUCCESS:
            return {
                ...state,
                loading: false,
                message: null,
                imageURL: action.payload.imageURL,
                status: action.payload.status,
            };

        default:
            return state;
    }
}
