const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  render() {
    return (
      <div className="ppl-moe-settings">
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_SHOW_PRONOUNS_DESCRIPTION}
          value={this.props.getSetting('showPronouns', true)}
          onChange={() => { this.props.toggleSetting('showPronouns', true) }}
        >
          {Messages.PPL_MOE_SETTINGS_SHOW_PRONOUNS}
        </SwitchItem>
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION}
          value={this.props.getSetting('hidePronounDB', true)}
          onChange={() => { this.props.toggleSetting('hidePronounDB', true) }}
          disabled={!this.props.getSetting('showPronouns', true)}
        >
          {Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB}
        </SwitchItem>
      </div>
    )
  }
}