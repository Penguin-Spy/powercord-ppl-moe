/* powercord-ppl-moe
 * Copyright (c) 2021-2022 Penguin_Spy
 * See LICENSE for full text
*/

const { Plugin } = require('powercord/entities')
const { inject, uninject, isInjected } = require('powercord/injector')
const { React, getModule, getAllModules, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')

const pplMoeStore = require('./store/store.js')
const Settings = require('./components/Settings.jsx')
const Pronouns = require('./components/Pronouns.jsx')
const ProfileBadge = require('./components/ProfileBadge.jsx')
const Profile = require('./components/Profile.jsx')

module.exports = class PplMoe extends Plugin {

  async startPlugin() {
    powercord.api.i18n.loadAllStrings(require('./i18n'))
    this.loadStylesheet('style.css')
    powercord.api.settings.registerSettings('ppl-moe', {
      category: this.entityID,
      label: Messages.PPL_MOE,
      render: Settings
    })

    if(powercord.api.connections.registerConnection) {
      const CONNECTION_TYPE = "ppl-moe"

      powercord.api.connections.registerConnection({
        type: CONNECTION_TYPE,
        name: Messages.PPL_MOE,
        color: "#DB325C",
        icon: {
          darkSVG: "https://i.imgur.com/KqbpO1x.png",
          lightSVG: "https://i.imgur.com/KqbpO1x.png"
        },
        enabled: true,
        fetchAccount: async (id) => {
          const profile = await pplMoeStore.getProfile(id)

          if(!profile) return

          return {
            type: CONNECTION_TYPE,
            url: profile.unique_url,
            name: profile.name,
            verified: true
          }
        },
        getPlatformUserUrl: (account) => {
          return `https://ppl.moe/u/${encodeURIComponent(account.url)}`
        },
        onConnect: (e) => {
          window.open("https://ppl.moe/li")
        },
        onDisconnect: () => {
          powercord.api.notices.closeToast("ppl-moe-disconnect")
          powercord.api.notices.sendToast('ppl-moe-disconnect', {
            header: Messages.PPL_MOE,
            content: Messages.PPL_MOE_CONNECTION_DISCONNECT_CONTENT,
            buttons: [{ text: Messages.PPL_MOE_CONNECTION_OK }]
          });
        },
        setVisibility: (visible) => {
          powercord.api.notices.closeToast("ppl-moe-visibility")
          powercord.api.notices.sendToast('ppl-moe-visibility', {
            header: Messages.PPL_MOE,
            content: Messages.PPL_MOE_CONNECTION_VISIBILITY_CONTENT,
            buttons: [{ text: Messages.PPL_MOE_CONNECTION_OK }]
          });
          return true
        }
      })
    }

    const MessageHeader = await this._getMessageHeader()
    const TabBar = await getModuleByDisplayName("TabBar")

    const classes = {
      pplMoeSectionHeader: "ppl-moe-section-header",
      pplMoeSectionInfo: "ppl-moe-section-info",
      pplMoeSectionBio: "ppl-moe-section-bio",
      pplMoeLink: "ppl-moe-link",
      pplMoeBadges: "ppl-moe-badges",
      pplMoePronouns: "ppl-moe-pronouns",
      pplMoePronounsHidePronounDB: "ppl-moe-pronouns-hide-pronoundb",
      pplMoeTabIcon: "ppl-moe-tab-icon",
      pplMoeDisableTab: "ppl-moe-disable-tab"
    }

    let memoizedMessageHeader
    inject('ppl-moe-messages-header', MessageHeader, 'default', function (_, res) {
      if(!memoizedMessageHeader) {
        const originalMessageHeader = res.type
        memoizedMessageHeader = (props) => {
          const res = originalMessageHeader(props)

          // unknown author, bot author, or the PronounDB example message in the settings
          if(!props.message.author.id || props.message.author.bot || props.message.id.includes("pronoundb-fake")) return res

          /*const headerItems = findInReactTree(res,
            e => Array.isArray(e) && e.find(c => c?.props?.timestamp)
          )*/
          const headerItems = res.props.children?.[1]?.props?.children

          if(powercord.api.settings.store.getSetting("powercord-ppl-moe", "showPronouns", true) && headerItems) {
            const hidePronounDB = powercord.api.settings.store.getSetting("powercord-ppl-moe", "hidePronounDB", true)
            const pronouns = React.createElement('span',
              { className: classes.pplMoePronouns + (hidePronounDB ? " " + classes.pplMoePronounsHidePronounDB : "") },
              React.createElement(Pronouns, {
                userId: props.message.author.id
              })
            )
            // Attempt to put our span before PronounDB's (so that the CSS can apply)
            const insertIndex = headerItems.findIndex(e => e.props?.className === "pronoundb-pronouns") - 1
            if(insertIndex >= 0) {
              headerItems.splice(insertIndex, 0, pronouns)
            } else { // If it fails, just shove it on the end and call it a day, who knows what the array looks like.
              headerItems.push(pronouns)
            }
          }

          if(powercord.api.settings.store.getSetting("powercord-ppl-moe", "showProfileBadge", true) && headerItems) {
            /*const usernameItems = findInReactTree(res,
              e => Array.isArray(e) && e.find(c => c?.props?.message)
            )*/
            const usernameItems = headerItems.find(e => e?.props?.id?.startsWith("message-username-"))?.props?.children?.props?.children?.[1]?.props?.children
            if(usernameItems) {
              usernameItems.push(React.createElement(ProfileBadge, {
                userId: props.message.author.id
              }))
            }
          }

          return res
        } // end memoizedMessageHeader(props)
      }

      res.type = memoizedMessageHeader
      return res
    })

    inject('ppl-moe-tab-bar', TabBar.prototype, 'render', function (_, res) {
      if(!res.props.className.includes(classes.userProfileTabBar)) return res

      const bioTab = React.createElement(TabBar.Item, {
        key: "PPL_MOE",
        className: classes.userProfileTabBarItem + (powercord.api.settings.store.getSetting("powercord-ppl-moe", "userModalIcon", false)
          ? " " + classes.pplMoeTabIcon : ""),
        id: "PPL_MOE"
      }, Messages.PPL_MOE)

      // grab the function that sets the 'selectedSection' to the tab's id
      bioTab.props.onItemSelect = res.props.children[0].props.onItemSelect
      // copy the selectedItem key, so that the ppl.moe tab button looks selected
      bioTab.props.selectedItem = res.props.children[0].props.selectedItem

      // Add the ppl.moe tab bar item to the list
      res.props.children.push(bioTab)
      return res
    })

    this.lazyPatchProfileModal(
      m => m.default && m.default.displayName === 'UserProfileModal',
      UserProfileModal => {
        inject('ppl-moe-user-profile-modal', UserProfileModal, 'default', ([{ user }], res) => {
          //console.log(res)  // enable to find UserProfileTabBar modules if console is getting "cant read property 'props' of undefined"

          // these must be loaded here because modal classes are lazily loaded
          if(!classes.lazyLoadedClasses) {
            let userProfileTabBar = getAllModules(['tabBar', 'tabBarItem', 'root'], false)[0]
            let userProfileInfo = getModule(['userInfoSectionHeader'], false)
            let userProfileScroller = getAllModules(['scrollerBase', 'thin'], false)[0]
            let userProfileHeader = getAllModules(['base', 'uppercase'], false)[0]

            classes.userProfileTabBar = userProfileTabBar.tabBar
            classes.userProfileTabBarItem = userProfileTabBar.tabBarItem
            classes.infoScroller = `${userProfileInfo.infoScroller} ${userProfileScroller.thin} ${userProfileScroller.fade}`
            classes.userInfoSectionHeader = `${userProfileInfo.userInfoSectionHeader} ${userProfileHeader.base}`
            classes.userInfoText = `${userProfileInfo.userInfoText} ${getModule(['markup'], false).markup}`
            classes.lazyLoadedClasses = true
          }

          // fetch their profile for later viewing
          pplMoeStore.getProfile(user.id)

          if(typeof isInjected !== "undefined" && isInjected('ppl-moe-user-profile-tab-selector')) uninject('ppl-moe-user-profile-tab-selector')
          // inject into this instance of the function that decides which tab to display
          // HOW TO FIND: enable console.log(res), search tree through "topSection-" to find a child that has props: { selectedSection: <whatever> }
          //  and a type that's an unnamed function that has a switch statement with cases of `UserProfileSections.foo`
          //  right-click->copy property path of child (not type, the member of the array!), prepend "res." and replace location below
          inject('ppl-moe-user-profile-tab-selector', res.props.children.props.children.props.children[1].props.children, 'type', ([props], res) => {
            if(props.selectedSection != "PPL_MOE") return res

            const profile = pplMoeStore.getProfileSync(user.id)
            if(!profile) return res  // shouldn't happen (but does), just return the default USER_INFO tab

            return React.createElement(Profile, {
              classes: classes,
              profile: profile
            })
          })


          if(typeof isInjected !== "undefined" && isInjected('ppl-moe-user-profile-tab-bar')) uninject('ppl-moe-user-profile-tab-bar')
          // inject into this insance of the tab bar (only after we've rendered it the 1st time)
          // HOW TO FIND: enable console.log(res), search tree through "topSection-" to find a child that has props: { section: <whatever>, setSection: f(e) }
          //  and a type that's function with `displayName: UserProfileTabBar`
          //  right-click->copy property path of child (not type, the member of the array!), prepend "res." and replace location below IN BOTH IF STATEMENT & INJECT
          if(res.props.children.props.children.props.children[0].props.children[1]) { // if tab bar exists
            inject('ppl-moe-user-profile-tab-bar', res.props.children.props.children.props.children[0].props.children[1], 'type', ([props], res) => {
              const profile = pplMoeStore.getProfileSync(props.user.id)
              if(!profile) res.props.children.props.className += ` ${classes.pplMoeDisableTab}`
              return res
            })
          }

          return res
        })
        UserProfileModal.default.displayName = 'UserProfileModal'
      }
    )
  }

  pluginWillUnload() {
    if(powercord.api.connections.unregisterConnection) {
      powercord.api.connections.unregisterConnection('ppl-moe')
    }
    powercord.api.settings.unregisterSettings('ppl-moe')

    uninject('ppl-moe-messages-header')
    uninject('ppl-moe-tab-bar')
    uninject('ppl-moe-lazy-modal')
    uninject('ppl-moe-user-profile-modal')
    uninject('ppl-moe-user-profile-tab-selector')
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
    if(m) patch(m)
    else {
      const { useModalsStore } = await getModule(['useModalsStore'])
      inject('ppl-moe-lazy-modal', useModalsStore, 'setState', a => {
        const og = a[0]
        a[0] = (...args) => {
          const ret = og(...args)
          try {
            if(ret?.default?.length) {
              const el = ret.default[0]
              if(el && el.render && el.render.toString().indexOf(',friendToken:') !== -1) {
                uninject('ppl-moe-lazy-modal')
                patch(getModule(filter, false))
              }
            }
          } catch(e) {
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