import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { Helmet } from 'react-helmet';

import reducer from './reducers/dashboardReducers';
import saga from './reducers/dashboardSagas';

import axios from 'axios';

import {
  getImageAction,
  openGlobalSettingAction,
  closeGlobalSettingFormAction,
  openDeviceSettingAction,
  closeDeviceSettingFormAction,
} from './reducers/dashboardActions';

import brand from 'enl-api/dummy/brand';
import {
  PapperBlock,
  GlobalSetting,
  DeviceSetting,
  ImageCard,
} from 'enl-components';
import CompossedLineBarArea from './CompossedLineBarArea';
import StrippedTable from '../Table/StrippedTable';

import {
  Grid,
} from '@material-ui/core';

class BasicTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerVal: parseInt(props.startTimeInSeconds, 10) || 0,
      imageURL: null,
      imageType: 'photo',
      scaleImage: 6,
      status: null,
    };
  }

  tick() {
    this.props.getImageHandler('0001', this.state.imageType);  // devide id 0001

    // this.setState(state => ({
    //   timerVal: state.timerVal + 1
    // }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1750);
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate outside');
    if (this.props.imageURL) {
      // console.log(this.props.imageURL.name);
      if (!prevProps.imageURL ||  // if it is the first time
        (prevProps.imageURL && (this.props.imageURL.size !== prevProps.imageURL.size))) {  // TODO: Use a unique field instead of the size

        // console.log('this.imageURL', this.props.imageURL);
        // console.log('prev.imageURL', prevProps.imageURL);

        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
          this.setState({
            imageURL: e.target.result,
            status: JSON.parse(this.props.status),
          });
        });
        reader.readAsDataURL(this.props.imageURL);
        // console.log('componentDidUpdate inside condition');
      }

    };
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // readFileAsync(blob) {

  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       resolve(e.target.result);
  //       // console.log('onload', e.target.result);
  //     };
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   })
  // };

  // readBlob = async (blob) => {
  //   try {
  //     const imageURL = await this.readFileAsync(blob);

  //     return imageURL;
  //   } catch (e) {
  //     console.log(e);
  //     return;
  //   }
  // }

  saveGlobalSetting = (items) => {
    const values = items.toJS();
    // console.log('items: ', values);
    if (!values) {
      this.setState({ imageType: 'photo', scaleImage: values.scaleImage });
    } else if (values.photoOrThermal) {
      this.setState({ imageType: 'thermal', scaleImage: values.scaleImage });
    } else {
      this.setState({ imageType: 'photo', scaleImage: values.scaleImage });
    }
    this.props.closeGlobalSettingFormHandler();
  }

  saveDeviceSetting = (items) => {
    const values = items.toJS();
    // console.log('items: ', values);

    if (values.deviceId) {
      const formData = new FormData();
      formData.append('device_id', values.deviceId);

      if (values.scaleImage)
        formData.append('scale', values.scaleImage.toString());
      else
        formData.append('scale', '1.0');

      if (values.rotateImage)
        formData.append('rotate', values.rotateImage);  // Already a string
      else
        formData.append('rotate', '0');

      if (values.offsetRotateImage)
        formData.append('offsetRotate', values.offsetRotateImage.toString());
      else
        formData.append('offsetRotate', '0.0');

      axios.post('http://localhost:8000/api/settings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }

    this.props.closeDeviceSettingFormHandler();
  }

  render() {
    const title = brand.name + ' - Monitoring';
    const description = brand.desc;
    const {
      status,
      scaleImage,
    } = this.state;
    const {
      openGlobalSettingHandler,
      openGlobalSettingForm,
      closeGlobalSettingFormHandler,
      openDeviceSettingHandler,
      openDeviceSettingForm,
      closeDeviceSettingFormHandler,
    } = this.props;

    // console.log('status: ', status)

    return (
      <div>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={description} />
        </Helmet>
        <PapperBlock title="Monitoring" icon="camera_alt" desc="" overflowX>
          <div>
            <Grid container spacing={1} direction="row" justify="flex-start" alignItems="flex-start">
              {/* <Grid item xs={12} sm={8} md={5}> */}
              <Grid item xs={scaleImage}>
                {/* <img src={this.state.imageURL} width='100%' /> */}
                {this.state.imageURL ?
                  <ImageCard
                    covid_is_detected={status.status !== 'normal'}
                    image={this.state.imageURL}
                    title="Device-Id = 0001"
                  >
                    Id = 0001
                  </ImageCard> : null}
              </Grid>

              <Grid item xs={scaleImage}>
                {/* <img src={this.state.imageURL} width='100%' /> */}
                {this.state.imageURL ?
                  <ImageCard
                    covid_is_detected={status.status !== 'normal'}
                    image={this.state.imageURL}
                    title="Device-Id=0002"
                  >
                    Id = 0002
                  </ImageCard> : null}
              </Grid>

            </Grid>
          </div>
        </PapperBlock>
        {/* <PapperBlock title="Table" whiteBg icon="grid_on" desc="UI Table when no data to be shown">
          <div>
            <StrippedTable />
          </div>
        </PapperBlock> */}
        <GlobalSetting
          openSetting={openGlobalSettingHandler}
          openForm={openGlobalSettingForm}
          closeForm={closeGlobalSettingFormHandler}
          submit={this.saveGlobalSetting}
        />
        <DeviceSetting
          openSetting={openDeviceSettingHandler}
          openForm={openDeviceSettingForm}
          closeForm={closeDeviceSettingFormHandler}
          submit={this.saveDeviceSetting}
        />
      </div>
    );
  }
}

BasicTable.propTypes = {
  getImageHandler: PropTypes.func.isRequired,
  imageURL: PropTypes.object,
  openGlobalSettingHandler: PropTypes.func.isRequired,
  openGlobalSettingForm: PropTypes.bool.isRequired,
  closeGlobalSettingFormHandler: PropTypes.func.isRequired,
  openDeviceSettingHandler: PropTypes.func.isRequired,
  openDeviceSettingForm: PropTypes.bool.isRequired,
  closeDeviceSettingFormHandler: PropTypes.func.isRequired,
  status: PropTypes.string,
};

BasicTable.defaultProps = {
  imageURL: null,
  openGlobalSettingForm: false,
  openDeviceSettingForm: false,
  status: '',
};

const reducerKey = 'dashboardReducer';
const sagaKey = reducerKey;

const mapStateToProps = state => ({
  imageURL: state.getIn([reducerKey, 'imageURL']),
  openGlobalSettingForm: state.getIn([reducerKey, 'openGlobalSettingForm']),
  openDeviceSettingForm: state.getIn([reducerKey, 'openDeviceSettingForm']),
  status: state.getIn([reducerKey, 'status']),
  ...state
});

const mapDispatchToProps = dispatch => ({
  getImageHandler: bindActionCreators(getImageAction, dispatch),
  openGlobalSettingHandler: () => dispatch(openGlobalSettingAction),
  closeGlobalSettingFormHandler: () => dispatch(closeGlobalSettingFormAction),
  openDeviceSettingHandler: () => dispatch(openDeviceSettingAction),
  closeDeviceSettingFormHandler: () => dispatch(closeDeviceSettingFormAction),
});

const withReducer = injectReducer({ key: reducerKey, reducer });
const withSaga = injectSaga({ key: sagaKey, saga });

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withReducer,
  withSaga,
  withConnect
)(BasicTable);
