const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class PplMoeSettings extends React.Component {
  render() {
    return (
      <div className="ppl-moe-settings">
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION}
          value={this.props.getSetting('hidePronounDB', true)}
          onChange={() => { this.props.toggleSetting('hidePronounDB', true) }}
        >
          {Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB}
        </SwitchItem>
      </div>
    )
  }
}