import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';
import SettingForm from './SettingForm';
import FloatingPanel from '../Panel/FloatingPanel';
import styles from './setting-jss';

class Setting extends React.Component {
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
        <Tooltip title={intl.formatMessage(messages.open_setting)}>
          <Fab color="secondary" onClick={() => openSetting()} className={classes.addBtn}>
            <SettingsIcon />
          </Fab>
        </Tooltip>
        <FloatingPanel title={intl.formatMessage(messages.setting_parameters)} openForm={openForm} branch={branch} closeForm={closeForm}>
          <SettingForm
            onSubmit={this.sendValues}
          />
        </FloatingPanel>
      </div>
    );
  }
}

Setting.propTypes = {
  classes: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired,
  openSetting: PropTypes.func.isRequired,
  openForm: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

Setting.defaultProps = {
  openForm: false
};

export default withStyles(styles)(injectIntl(Setting));
