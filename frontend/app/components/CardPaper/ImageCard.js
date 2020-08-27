import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import styles from './cardStyle-jss';

class ImageCard extends React.Component {
  render() {
    const {
      classes,
      children,
      title,
      image,
      covid_is_detected,
      ...rest
    } = this.props;
    return (
      <Card className={classes.cardMedia} {...rest}>
        <div className={classes.status}>
          {covid_is_detected? <Chip label="Detected" className={classes.redStatus}/> : <Chip label="Normal" className={classes.normalStatus}/>}
        </div>
        <CardMedia
          className={classes.mediaProduct}
          image={image}
          title={title}
        />
        <CardContent>
          {children}
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
        </CardActions>
      </Card>
    );
  }
}

ImageCard.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  covid_is_detected: PropTypes.bool,
};

ImageCard.defaultProps = {
  covid_is_detected: false,
};

export default withStyles(styles)(ImageCard);
