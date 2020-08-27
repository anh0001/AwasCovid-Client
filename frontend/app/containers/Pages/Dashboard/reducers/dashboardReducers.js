import { fromJS, List, Map } from 'immutable';

import {
    GET_IMAGE,
    GET_IMAGE_SUCCESS,
    OPEN_SETTING,
    CLOSE_SETTING_FORM,
} from './dashboardConstants';

export const initialState = {
    loading: false,
    deviceId: '',
    message: null,
    imageURL: null,
    status: '',
    settingFormValues: Map(),
    openSettingForm: false,
};

const initialImmutableState = fromJS(initialState);

export default function dashboardReducer(state = initialImmutableState, action = {}) {
    switch (action.type) {
        case GET_IMAGE:
            return state.withMutations((mutableState) => {
                mutableState
                    .set('loading', true)
                    .set('message', null)
                    .set('deviceId', action.deviceId);
            });

        case GET_IMAGE_SUCCESS:
            return state.withMutations((mutableState) => {
                const payload = fromJS(action.payload);
                mutableState
                    .set('loading', false)
                    .set('message', null)
                    .set('imageURL', payload.get('imageURL'))
                    .set('status', payload.get('status'));
            });

        case OPEN_SETTING:
            return state.withMutations((mutableState) => {
                mutableState
                    .set('settingFormValues', Map())
                    .set('openSettingForm', true);
            });

        case CLOSE_SETTING_FORM:
            return state.withMutations((mutableState) => {
                mutableState
                    .set('settingFormValues', Map())
                    .set('openSettingForm', false);
            });

        default:
            return state;
    }
}
