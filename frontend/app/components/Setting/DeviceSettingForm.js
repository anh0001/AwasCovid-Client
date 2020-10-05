import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Type from 'enl-styles/Typography.scss';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form/immutable';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormLabel from '@material-ui/core/FormLabel';
import PermContactCalendar from '@material-ui/icons/PermContactCalendar';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Bookmark from '@material-ui/icons/Bookmark';
import LocalPhone from '@material-ui/icons/LocalPhone';
import Email from '@material-ui/icons/Email';
import Smartphone from '@material-ui/icons/Smartphone';
import LocationOn from '@material-ui/icons/LocationOn';
import Work from '@material-ui/icons/Work';
import Language from '@material-ui/icons/Language';
import css from 'enl-styles/Form.scss';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  Switch as SwitchRedux,
  Slider as SliderRedux,
  TextField as TextFieldRedux,
  Select as SelectRedux,
} from 'redux-form-material-ui-adapter';
import messages from './messages';
import styles from './setting-jss';

// validation functions
const required = value => (value == null ? 'Required' : undefined);
const email = value => (
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email'
    : undefined
);

class DeviceSettingForm extends React.Component {
  saveRef = ref => {
    this.ref = ref;
    return this.ref;
  };

  render() {
    const {
      classes,
      reset,
      pristine,
      submitting,
      handleSubmit,
      intl
    } = this.props;
    let dropzoneRef;
    const acceptedFiles = ['image/jpeg', 'image/png', 'image/bmp'];
    const fileSizeLimit = 100000;
    const imgPreview = img => {
      if (typeof img !== 'string' && img !== '') {
        return URL.createObjectURL(imgAvatar);
      }
      return img;
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <section className={css.bodyForm}>
            <div>
              <Field
                name="deviceId"
                component={TextFieldRedux}
                placeholder={intl.formatMessage(messages.device_id)}
                label={intl.formatMessage(messages.device_id)}
                className={classes.field}
              />
            </div>
            <div>
              <Typography id="rotate-image" gutterBottom>
                Rotate Image
              </Typography>
              <Field
                name="rotateImage"
                component={SelectRedux}
                placeholder="Rotate Image"
              >
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="90">90</MenuItem>
                <MenuItem value="-90">-90</MenuItem>
                <MenuItem value="180">180</MenuItem>
              </Field>
            </div>
            <div>
              <Typography id="rotate-image" gutterBottom>
                Offset Rotation
              </Typography>
              <Field
                name="offsetRotateImage"
                component={SliderRedux}
                defaultValue={0}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                // format={null}
                min={-180}
                max={180}
                step={1}
              />
            </div>
            <div>
              <Typography id="scale-image" gutterBottom>
                Scale
              </Typography>
              <Field
                name="scaleImage"
                component={SliderRedux}
                defaultValue={1}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                // format={null}
                min={0.01}
                max={3}
                step={0.01}
              />
            </div>
            <div>
              <Typography id="offset-value" gutterBottom>
                Offset Value (Celcius)
              </Typography>
              <Field
                name="offsetValue"
                component={SliderRedux}
                defaultValue={0.0}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                // format={null}
                min={-2.00}
                max={2.00}
                step={0.01}
              />
            </div>
            <div>
              
                <Typography id="auto-save-cloud" gutterBottom>
                  Auto Save to Cloud
                </Typography>
                <Field name="autoSaveToCloud" component={SwitchRedux} />
              
            </div>
          </section>

          <div className={css.buttonArea}>
            <div>
              <Button variant="contained" color="secondary" type="submit" disabled={submitting}>
                <FormattedMessage {...messages.save} />
              </Button>
              <Button
                type="button"
                disabled={pristine || submitting}
                onClick={() => reset()}
              >
                <FormattedMessage {...messages.reset} />
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

DeviceSettingForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: intlShape.isRequired
};

const reducerKey = 'dashboardReducer';

const DeviceSettingFormRedux = reduxForm({
  form: 'deviceSettingForm',
  enableReinitialize: true,
})(DeviceSettingForm);

const DeviceSettingFormInit = connect(
  state => ({
    initialValues: state.getIn([reducerKey, 'deviceSettingFormValues']),
    ...state
  })
)(DeviceSettingFormRedux);

export default withStyles(styles)(injectIntl(DeviceSettingFormInit));
