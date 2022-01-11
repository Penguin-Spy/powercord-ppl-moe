const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  render() {
    const pronounDBisPresent = powercord.pluginManager.isInstalled("pronoundb-powercord") && powercord.pluginManager.isEnabled("pronoundb-powercord");
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
          note={pronounDBisPresent ? Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION : Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION_INSTALL}
          value={this.props.getSetting('hidePronounDB', true)}
          onChange={() => { this.props.toggleSetting('hidePronounDB', true) }}
          disabled={!this.props.getSetting('showPronouns', true) || !pronounDBisPresent}
        >
          {Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB}
        </SwitchItem>
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_USER_MODAL_ICON_DESCRIPTION}
          value={this.props.getSetting('userModalIcon', false)}
          onChange={() => { this.props.toggleSetting('userModalIcon', false) }}
        >
          {Messages.PPL_MOE_SETTINGS_USER_MODAL_ICON}
        </SwitchItem>
      </div>
    )
  }
}