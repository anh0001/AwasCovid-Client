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