const { React, i18n: { Messages } } = require('powercord/webpack')

module.exports = class ProfileError extends React.Component {
  render() {
    const { classes, error } = this.props;
    return (
      <div className={classes.infoScroller} dir="ltr" style={{ 'overflow': "hidden scroll", 'padding-right': "12px" }}>
        <div className={classes.pplMoeSectionHeader}>
          <div className={classes.userInfoSectionHeader}>{Messages.PPL_MOE_ERROR}</div>
          <div className={classes.userInfoSectionText}>{Messages[`PPL_MOE_ERROR_${error}`]}</div>
        </div>
      </div>
    )
  }
}