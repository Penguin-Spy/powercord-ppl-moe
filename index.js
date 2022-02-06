const { Plugin } = require('powercord/entities')
const { inject, uninject, isInjected } = require('powercord/injector')
const { React, getModule, getAllModules, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { TabBar } = require('powercord/components')
const { get } = require('powercord/http')
const i18n = require('./i18n');
const { getStore } = require('./store/store.js')
const { loadProfile, doLoadProfile } = require('./store/action.js')

const Settings = require('./components/Settings.jsx')
const Pronouns = require('./components/Pronouns.jsx')
const Profile = require('./components/Profile.jsx')
const ProfileError = require('./components/ProfileError.jsx')

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

          if (!profile || profile.banned) return

          return ({
            type: "ppl-moe",
            url: profile.unique_url,
            name: profile.name,
            verified: true
          });
        } catch (e) {
          //Just ignore the error, probably just 404
        }
      },
      getPlatformUserUrl: (account) => {
        return `https://ppl.moe/u/${encodeURIComponent(account.url)}`;
      },
      onDisconnect: () => void 0
    });
    // end of yoinkage

    const MessageHeader = await this._getMessageHeader()
    const TabBar = await getModuleByDisplayName("TabBar")

    const pplMoeStore = getStore()
    const classes = {
      pplMoeSectionHeader: "ppl-moe-section-header",
      pplMoeSectionInfo: "ppl-moe-section-info",
      pplMoeSectionBio: "ppl-moe-section-bio",
      pplMoeLink: "ppl-moe-link",
      pplMoeBadges: "ppl-moe-badges",
      pplMoePronouns: "ppl-moe-pronouns",
      pplMoePronounsHidePronounDB: "ppl-moe-pronouns-hide-pronoundb",
      pplMoeTabIcon: "ppl-moe-tab-icon"
    }

    inject('ppl-moe-messages-header', MessageHeader, 'default', function ([props], res) {
      // unknown author, bot author, or the PronounDB example message in the settings
      if (!props.message.author.id || props.message.author.bot || props.message.id == "pronoundb-fake") return res
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

    inject('ppl-moe-tab-bar', TabBar.prototype, 'render', function (_, res) {
      if (!res.props.className.includes(classes.userProfileTabBar)) return res
      //if (!res || !this.props.user || this.props.user.bot) return res // Do not add a tab if there is no tab bar, no user, or the user's a bot

      // the user's profile has already been loaded/requested to load by the "user-load" inject
      //const profile = pplMoeStore.getProfile(user.id)
      //if (!profile || profile == 0) return res
      // if it hasn't loaded yet or the user has no profile, just return

      // Check if the Comfy theme is installed AND enabled, because isEnabled defaults to true if the theme doesnt exist (for some reason????)
      // Or if the config setting is enabled
      const tabIcon = (powercord.styleManager.isInstalled("Comfy") && powercord.styleManager.isEnabled("Comfy"))
        || powercord.api.settings.store.getSetting("powercord-ppl-moe", "userModalIcon", false)

      const bioTab = React.createElement(TabBar.Item, {
        key: "PPL_MOE",
        className: classes.userProfileTabBarItem + (tabIcon ? " " + classes.pplMoeTabIcon : ""),
        id: "PPL_MOE"
      }, Messages.PPL_MOE_TAB)

      // grab the function that sets the 'selectedSection' to the tab's id
      bioTab.props.onItemSelect = res.props.children[0].props.onItemSelect;

      // Add the ppl.moe tab bar item to the list
      res.props.children.push(bioTab)
      return res
    })

    this.lazyPatchProfileModal(
      m => m.default && m.default.displayName === 'UserProfileModal',
      UserProfileModal => {
        inject('ppl-moe-user-profile-modal', UserProfileModal, 'default', ([{ user }], res) => {
          // these must be loaded here because modal classes are lazily loaded
          if (!classes.lazyLoadedClasses) {
            classes.userProfileTabBar = getAllModules(['tabBar'], false)[6].tabBar;
            classes.userProfileTabBarItem = getAllModules(['tabBar'], false)[6].tabBarItem;
            classes.infoScroller = getModule(['infoScroller'], false).infoScroller + " " + getAllModules(['scrollerBase'], false)[1].thin + " " + getAllModules(['scrollerBase'], false)[1].fade;
            classes.userInfoSectionHeader = getModule(['userInfoSectionHeader'], false).userInfoSectionHeader + " " + getModule(['size12'], false).size12 + " " + getModule(['uppercase'], false).uppercase;
            classes.userInfoSectionText = getAllModules(['marginBottom8'], false)[0].marginBottom8 + " " + getAllModules(['size14'], false)[0].size14 + " " + getModule(['colorStandard'], false).colorStandard;
            classes.lazyLoadedClasses = true;
          }

          // fetch their profile for later viewing
          if (pplMoeStore.shouldFetchProfile(user.id)) doLoadProfile(user.id);

          // re-inject into the function that decides which tab to display
          if (isInjected('ppl-moe-user-profile-tab-bar')) uninject('ppl-moe-user-profile-tab-bar');
          inject('ppl-moe-user-profile-tab-bar', res.props.children.props.children[1].props.children, 'type', ([props], res) => {
            if (props.selectedSection != "PPL_MOE") return res;

            const profile = pplMoeStore.getProfile(user.id)
            if (!profile) return React.createElement(ProfileError, {
              classes: classes,
              error: '404',
            });
            if (profile.banned) return React.createElement(ProfileError, {
              classes: classes,
              error: 'BANNED',
            });

            return React.createElement(Profile, {
              classes: classes,
              profile: profile
            });
          });

          return res;
        });
        UserProfileModal.default.displayName = 'UserProfileModal'
      }
    )
  }

  pluginWillUnload() {
    powercord.api.connections.unregisterConnection('ppl-moe');
    powercord.api.settings.unregisterSettings('ppl-moe');

    uninject('ppl-moe-messages-header')
    uninject('ppl-moe-tab-bar')
    uninject('ppl-moe-user-profile-modal')
    uninject('ppl-moe-user-profile-tab-bar')
  }

  /* The following code is slightly modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */
  async _getMessageHeader() {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default
      return typeof def === 'function' ? def : null
    }
    return getModule((m) => d(m)?.toString().includes('showTimestampOnHover'))
  }
  /* End of code from pronoundb-powercord */

  /* The following code is slightly modified from code found in https://github.com/Juby210/user-details, license/copyright can be found in that repository. */
  async lazyPatchProfileModal(filter, patch) {
    const m = getModule(filter, false)
    if (m) patch(m)
    else {
      const { useModalsStore } = await getModule(['useModalsStore'])
      inject('ppl-moe-lazy-modal', useModalsStore, 'setState', a => {
        const og = a[0]
        a[0] = (...args) => {
          const ret = og(...args)
          try {
            if (ret?.default?.length) {
              const el = ret.default[0]
              if (el && el.render && el.render.toString().indexOf(',friendToken:') !== -1) {
                uninject('ppl-moe-lazy-modal')
                patch(getModule(filter, false))
              }
            }
          } catch (e) {
            this.error(e)
          }
          return ret
        }
        return a
      }, true)
    }
  }
  /* End of code from user-details */
}

module.exports = PplMoe
