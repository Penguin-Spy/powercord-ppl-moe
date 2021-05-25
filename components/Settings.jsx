const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class PplMoeSettings extends React.Component {
  constructor (props) {
    super(props);
  }
  
  render() {
    return React.createElement('div', {className: 'ppl-moe-settings'})
    /*(
      
      <div className='ppl-moe-settings'>
        <SwitchItem
          note=Messages.PPL_MOE_SETTINGS_TAB_ICON,
          value={this.props.getSetting('tabIcon', true)},
          onChange={() => {/*(v) => {
            if(v) {
              styles = powercord.pluginManager.plugins.get("powercord-ppl-moe").styles
              Object.keys(styles).forEach(key => {
                if(styles[key].compiler.file.includes("comfy")) {
                  console.log("ppl-moe-settings v=true")
                  console.log(styles[key])
                }
              })
            }
            else {
              styles = powercord.pluginManager.plugins.get("powercord-ppl-moe").styles
              Object.keys(styles).forEach(key => {
                if(styles[key].compiler.file.includes("comfy")) {
                  console.log("ppl-moe-settings v=false")
                  console.log(styles[key])
                }
              })
            }*//*
            this.props.toggleSetting('tabIcon', true)
          }}
        >*//*
      </div>
    )*/
  }
}