import * as types from './dashboardConstants';

//= ====================================
//  User Profile
//-------------------------------------

export const getImageAction = (deviceId, imageType) => ({
    type: types.GET_IMAGE,
    deviceId,
    imageType
});

export const getImageSuccessAction = payload => ({
    type: types.GET_IMAGE_SUCCESS,
    payload
});

export const openGlobalSettingAction = {
    type: types.OPEN_GLOBAL_SETTING,
};

export const closeGlobalSettingFormAction = {
    type: types.CLOSE_GLOBAL_SETTING_FORM,
};

export const openDeviceSettingAction = {
    type: types.OPEN_DEVICE_SETTING,
};

export const closeDeviceSettingFormAction = {
    type: types.CLOSE_DEVICE_SETTING_FORM,
};

export const uploadDetectedImage2FirebaseAction = (userId, deviceId, imageId) => ({
    type: types.UPLOAD_DETECTED_IMAGE_TO_FIREBASE,
    userId,
    deviceId,
    imageId,
});