import {
    call, fork, put, take, takeLatest, takeEvery, select
} from 'redux-saga/effects';
import { firebase } from '../../../../firebase';
import history from 'utils/history';
import axios from 'axios';
import {
    GET_IMAGE,
} from './dashboardConstants';
import {
    getImageSuccessAction,
} from './dashboardActions';

const reducerKey = 'dashboardReducer';
export const getImageURL = (state) => state.get(reducerKey).imageURL;

function* getImageSaga({ deviceId, imageType }) {
    try {
        let imageURL = yield select(getImageURL);
        
        const response = yield call(() => axios.get('http://localhost:8000/api/image/', {
            params: {
                device_id: deviceId,
                image_type: imageType,
            },
            responseType: 'blob',
        }));
        
        if (response.headers.status) {
            imageURL = response.data;
        }

        yield put(getImageSuccessAction({imageURL: imageURL, status: response.headers.status}));
    
    } catch (error) {
        console.log(error);
        // yield put(getUserProfileError(error));
    }
}

//= ====================================
//  WATCHERS
//-------------------------------------

export default function* dashboardRootSaga() {
    yield takeEvery(GET_IMAGE, getImageSaga);
}