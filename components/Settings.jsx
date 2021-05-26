const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class PplMoeSettings extends React.Component {
  render() {
    return (
      <div className="ppl-moe-settings">
        <SwitchItem
          note={Messages.PPL_MOE_SETTINGS_TAB_ICON_DESCRIPTION}
          value={this.props.getSetting('tabIcon', false)}
          onChange={(/*v*/) => {
            this.props.toggleSetting('tabIcon', false)
            //console.log(this.props)
            /*try {
              if (v) {
                const styles = powercord.pluginManager.plugins.get("powercord-ppl-moe").styles
                Object.keys(styles).forEach(key => {
                  if (styles[key].compiler.file.includes("comfy")) {
                    console.log("ppl-moe-settings v=true")
                    console.log(styles[key])
                  }
                })
              }
              else {
                const styles = powercord.pluginManager.plugins.get("powercord-ppl-moe").styles
                Object.keys(styles).forEach(key => {
                  if (styles[key].compiler.file.includes("comfy")) {
                    console.log("ppl-moe-settings v=false")
                    console.log(styles[key])
                  }
                })
              }
            } catch (e) {
              console.log("[powercord-ppl-moe] oopsy whoopsy, we made a fu\");")
              console.log(e)
            }*/
          }}
        >
          {Messages.PPL_MOE_SETTINGS_TAB_ICON}
        </SwitchItem>
      </div>
    )
  }
}