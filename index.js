const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getAllModules, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { TabBar } = require('powercord/components')
const { get } = require('powercord/http')
const i18n = require('./i18n');
const { getStore } = require('./store/store.js')
const { loadProfile, doLoadProfile } = require('./store/action.js')

const Settings = require('./components/Settings.jsx')
const Pronouns = require('./components/Pronouns.jsx')
const Profile = require('./components/Profile.jsx')

class PplMoe extends Plugin {

  async startPlugin() {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.css')
    powercord.api.settings.registerSettings('ppl-moe', {
      category: this.entityID,
      label: 'ppl.moe',
      render: Settings
    })

    // yoinked from the discord.bio plugin
    powercord.api.connections.registerConnection({
      type: "ppl-moe",
      name: "ppl.moe",
      color: "#DB325C",
      icon: {
        color: "https://i.imgur.com/KqbpO1x.png"
      },
      enabled: true,
      fetchAccount: async (id) => {
        try {
          if (!id) {
            ({
              id
            } = (await getModule(["getCurrentUser"])).getCurrentUser());
          }

          let profile
          if (pplMoeStore.shouldFetchProfile(id)) {
            profile = await doLoadProfile(id)
          } else {
            profile = pplMoeStore.getProfile(id)
          }

          if (!profile) return

          return ({
            type: "ppl-moe",
            id: profile.unique_url,
            name: profile.name,
            verified: true
          });
        } catch (e) {
          //Just ignore the error, probably just 404
        }
      },
      getPlatformUserUrl: (account) => {
        return `https://ppl.moe/u/${encodeURIComponent(account.id)}`;
      },
      onDisconnect: () => void 0
    });
    // end of yoinkage

    const MessageHeader = await this._getMessageHeader()
    //const UserProfile = await this._getUserProfile()
    const UserProfileModal = (await getModule((m) => m.default?.displayName == 'UserProfileModal'))
    console.log(UserProfileModal)
    var UserProfileBody = null; // man i love react/electron/discord/me not knowing wtf i'm doing (probably that last one)

    var selectedSection = null; // i hate this

    const UserInfoBase = await getModule((m) => m.default?.displayName == 'UserInfoBase')


    //const UserProfile = (await getModule((m) => m.default?.displayName == 'UserProfileModal')).default
    //const UserProfile = (await getModule((m) => m.default?.displayName == 'UserProfileModal'))
    const TabBar = await getModuleByDisplayName("TabBar")

    const pplMoeStore = getStore()
    const classes = {
      tabBarItem: await getAllModules(['tabBarItem'])[1].tabBarItem,
      infoScroller: getModule(['infoScroller'], false).infoScroller + " " + await getAllModules(['scrollerBase'])[0].thin + " " + getAllModules(['fade'])[0].fade,
      userInfoSectionHeader: getModule(['userInfoSectionHeader'], false).userInfoSectionHeader,
      userInfoSectionText: getAllModules(['marginBottom8'])[0].marginBottom8 + " " + getAllModules(['size14'])[0].size14 + " " + getModule(['colorStandard'], false).colorStandard,
      pplMoeSectionHeader: "ppl-moe-section-header",
      pplMoeSectionInfo: "ppl-moe-section-info",
      pplMoeSectionBio: "ppl-moe-section-bio",
      pplMoeLink: "ppl-moe-link",
      pplMoePronouns: "ppl-moe-pronouns",
      pplMoePronounsHidePronounDB: "ppl-moe-pronouns-hide-pronoundb",
      pplMoeTabIcon: "ppl-moe-tab-icon"
    }

    inject('ppl-moe-messages-header', MessageHeader, 'default', function ([props], res) {
      if (!props.message.author.id || props.message.author.bot) return res
      if (!powercord.api.settings.store.getSetting("powercord-ppl-moe", "showPronouns", true)) return res

      const hidePronounDB = powercord.api.settings.store.getSetting("powercord-ppl-moe", "hidePronounDB", true)
      const element = React.createElement('span',
        { className: classes.pplMoePronouns + (hidePronounDB ? " " + classes.pplMoePronounsHidePronounDB : "") },
        React.createElement(Pronouns, {
          userId: props.message.author.id
        })
      )

      try { // Attempt to put our span before PronounDB's (so that the CSS can apply)
        res.props.children[1].props.children.splice(3, 0, element)
      } catch (e) { // If it fails, just shove it on the end and call it a day, who knows what the array looks like.
        res.props.children[1].props.children.push(element)
      }

      return res
    })

    /*inject('ppl-moe-user-load', UserProfile.prototype, 'componentDidMount', function (_, res) {
      console.log("ppl-moe-user-load")
      console.log(res)
      //const { user } = this.props
      //if (!user || user.bot) return res

      //loadProfile(user.id) // Make sure this user's profile is loaded, that way can check if they have a profile during the tab-bar inject

      /*try {
        const profile = pplMoeStore.getProfile(user.id)
        this.setState({ ppl_moe: { profile: profile } })
      } catch (e) {
        this.setState({
          ppl_moe: {
            error: e.statusCode ? e.statusCode : 'UNKNOWN'  // Directly corresponds to a translation key
          }
        })
      }*/
    //})

    /*inject('ppl-moe-tab-bar-load', TabBar.prototype, 'componentDidMount', function (a, res) {
      console.log("ppl-moe-tab-bar-load")
      console.log(this)
      //const { user } = this.props
      //if (!user || user.bot) return res

      //loadProfile(user.id) // Make sure this user's profile is loaded, that way can check if they have a profile during the tab-bar inject

      /*try {
        const profile = pplMoeStore.getProfile(user.id)
        this.setState({ ppl_moe: { profile: profile } })
      } catch (e) {
        this.setState({
          ppl_moe: {
            error: e.statusCode ? e.statusCode : 'UNKNOWN'  // Directly corresponds to a translation key
          }
        })
      }*/
    //})

    inject('ppl-moe-tab-bar', TabBar.prototype, 'render', function (_, res) {
      console.log("ppl-moe-tab-bar")
      console.log(res)
      if (!res.props.className.includes(TabBar.Types.TOP)) return res
      //console.log(this.props)
      //if (!res || !this.props.user || this.props.user.bot) return res // Do not add a tab if there is no tab bar, no user, or the user's a bot

      // the user's profile has already been loaded/requested to load by the "user-load" inject
      //const profile = pplMoeStore.getProfile(user.id)
      //if (!profile || profile == 0) return res
      // if it hasn't loaded yet or the user has no profile, just return

      // Check if the Comfy theme is installed AND enabled, because isEnabled defaults to true if the theme doesnt exist (for some reason????)
      const tabIcon = powercord.styleManager.isInstalled("Comfy-git-clone") && powercord.styleManager.isEnabled("Comfy-git-clone")

      const bioTab = React.createElement(TabBar.Item, {
        key: "PPL_MOE",
        className: classes.tabBarItem + (tabIcon ? " " + classes.pplMoeTabIcon : ""),
        id: "PPL_MOE"
      }, Messages.PPL_MOE_TAB)

      // uhhh
      bioTab.props.onItemSelect = res.props.children[0].props.onItemSelect

      console.log(bioTab)

      // Add the ppl.moe tab bar item to the list
      res.props.children.push(bioTab)

      return res
    })

    inject('ppl-moe-user-body', UserProfileModal, 'default', function (_, res) {
      console.log("ppl-moe-user-body")
      console.log(res)

      selectedSection = res.props.children.props.children[1].props.children.props.selectedSection;

      if (UserProfileBody == null) {
        UserProfileBody = res.props.children.props.children[1].props.children
        console.log(UserProfileBody)

        inject('ppl-moe-user-body-wtf-is-this', UserProfileBody, 'type', function (_, res) {
          console.log("body?????????")
          console.log(res)

          /*const bioTab = React.createElement(TabBar.Item, {
            key: "PPL_MOE",
            className: classes.tabBarItem,
            id: "PPL_MOE"
          }, Messages.PPL_MOE_TAB)

          console.log(bioTab)
          res.props.children.props.children.push(bioTab)*/

          return res
        })

        console.log(UserProfileBody.default)
      }
      return res
      // If we're in a different section, don't do anything
      /*if (this.props.section !== "PPL_MOE") return res

      // Find the body, clear it, & add our info
      const body = res.props.children.props.children[1]
      body.props.children = []

      const profile = pplMoeStore.getProfile(this.props.user.id)
      if (!profile || profile == 0) return res
      // if it hasn't loaded yet or the user has no profile, just return

      body.props.children.push(React.createElement(Profile, {
        classes: classes,
        profile: profile
      }))

      return res*/
    })

    inject('ppl-moe-user-profile-body-base', UserInfoBase, 'default', function ([props], res) {
      console.log("UserInfoBase")
      console.log(props)
      console.log(res)
      console.log(selectedSection)

      /*res.props.children[0].props.children.push(
        React.createElement(Pronouns, {
          userId: props.user.id,
          region: 'profile',
          render: (p) => React.createElement(
            React.Fragment,
            null,
            React.createElement('div', { className: 'userInfoSectionHeader-3TYk6R base-1x0h_U size12-3cLvbJ uppercase-3VWUQ9' }, 'Pronouns'),
            React.createElement('div', { className: 'marginBottom8-AtZOdT size14-e6ZScH colorStandard-2KCXvj' }, p)
          )
        })
      );*/
      const profile = pplMoeStore.getProfile(props.user.id)
      if (!profile || profile == 0) return res

      return React.createElement(Profile, {
        classes: classes,
        profile: profile
      });
    });

  }

  pluginWillUnload() {
    powercord.api.connections.unregisterConnection('ppl-moe');
    powercord.api.settings.unregisterSettings('ppl-moe');

    uninject('ppl-moe-messages-header')
    uninject('ppl-moe-user-load')
    //uninject('ppl-moe-tab-bar-load')
    uninject('ppl-moe-tab-bar')
    uninject('ppl-moe-user-body-wtf-is-this')
    uninject('ppl-moe-user-body')
  }

  /* The following code is slightly modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */
  async _getMessageHeader() {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default
      return typeof def === 'function' ? def : null
    }
    return getModule((m) => d(m)?.toString().includes('showTimestampOnHover'))
  }

  async _getUserProfile() {
    const VeryVeryDecoratedUserProfile = await getModuleByDisplayName('UserProfileModal')
    const VeryDecoratedUserProfileBody = VeryVeryDecoratedUserProfile.prototype.render().type
    const DecoratedUserProfileBody = this._extractFromFlux(VeryDecoratedUserProfileBody).render().type
    const UserProfile = DecoratedUserProfileBody.prototype.render.call({ props: { forwardedRef: null } }).type

    return UserProfile
  }

  _extractFromFlux(FluxContainer) {
    return FluxContainer.prototype.render.call({ memoizedGetStateFromStores: () => null }).type
  }
  /* End of code from pronoundb-powercord */

}

module.exports = PplMoe
