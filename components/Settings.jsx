const { React, i18n: { Messages } } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = class Settings extends React.Component {
  render() {
    let pronounDBisPresent = true

    // check topaz & powercord to see if pronounDB is installed. if we're somehow running in another client mod (!?), we just default to true ig
    if (typeof topaz !== "undefined") {
      // check all topaz modules' GitHub repo name to see if one has "pronoundb-powercord"
      pronounDBisPresent = topaz.getInstalled().some(module => module.split('/')[1] === "pronoundb-powercord")
    } else if (typeof powercord !== "undefined") {
      pronounDBisPresent = powercord.pluginManager.isInstalled("pronoundb-powercord") && powercord.pluginManager.isEnabled("pronoundb-powercord")
    }

    return (
      <div className="ppl-moe-settings">
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_SHOW_PRONOUNS_DESCRIPTION}
          value={this.props.getSetting('showPronouns', true)}
          onChange={() => { this.props.toggleSetting('showPronouns', true) }}
        >{Messages.PPL_MOE_SETTINGS_SHOW_PRONOUNS}</SwitchItem>
        <SwitchItem
          note={pronounDBisPresent ? Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION : Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB_DESCRIPTION_INSTALL}
          value={this.props.getSetting('hidePronounDB', true)}
          onChange={() => { this.props.toggleSetting('hidePronounDB', true) }}
          disabled={!this.props.getSetting('showPronouns', true) || !pronounDBisPresent}
        >{Messages.PPL_MOE_SETTINGS_HIDE_PRONOUNDB}</SwitchItem>
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_SHOW_PROFILE_BADGE_DESCRIPTION}
          value={this.props.getSetting('showProfileBadge', true)}
          onChange={() => { this.props.toggleSetting('showProfileBadge', true) }}
        >{Messages.PPL_MOE_SETTINGS_SHOW_PROFILE_BADGE}</SwitchItem>
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_USER_MODAL_ICON_DESCRIPTION}
          value={this.props.getSetting('userModalIcon', false)}
          onChange={() => { this.props.toggleSetting('userModalIcon', false) }}
        >{Messages.PPL_MOE_SETTINGS_USER_MODAL_ICON}</SwitchItem>
      </div>
    )
  }
}