import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import ComputerIcon from '@material-ui/icons/Computer';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';
import DeviceSettingForm from './DeviceSettingForm';
import FloatingPanel from '../Panel/FloatingPanel';
import styles from './setting-jss';

class DeviceSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  sendValues = (values) => {
    const { submit } = this.props;
    setTimeout(() => {
      submit(values);
    }, 500);
  }

  render() {
    const {
      classes,
      openForm,
      closeForm,
      openSetting,
      submit,
      intl
    } = this.props;
    const { img } = this.state;
    const branch = '';
    return (
      <div>
        <Tooltip title={intl.formatMessage(messages.open_device_setting)}>
          <Fab size="small" color="secondary" onClick={() => openSetting()} className={classes.imageSettingBtn}>
            <ComputerIcon />
          </Fab>
        </Tooltip>
        <FloatingPanel title={intl.formatMessage(messages.device_setting_parameters)} openForm={openForm} branch={branch} closeForm={closeForm}>
          <DeviceSettingForm
            onSubmit={this.sendValues}
          />
        </FloatingPanel>
      </div>
    );
  }
}

DeviceSetting.propTypes = {
  classes: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired,
  openSetting: PropTypes.func.isRequired,
  openForm: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

DeviceSetting.defaultProps = {
  openForm: false
};

export default withStyles(styles)(injectIntl(DeviceSetting));
