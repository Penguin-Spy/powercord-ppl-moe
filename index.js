const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getAllModules, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const { TabBar } = require('powercord/components')
const { get } = require('powercord/http')
const i18n = require('./i18n');
const { getStore } = require('./store/store.js')
const { loadPronouns } = require('./store/action.js')

const Settings = require('./components/Settings.jsx')
const Pronouns = require('./components/Pronouns.jsx')

class PplMoe extends Plugin {

  async fetchProfile(id) {
    return await get(`https://ppl.moe/api/user/discord/${id}`)
      .then(r => r.body)
  }

  generateInfoDiv(info, key, classes) {
    if (info[key] != "") { // If this field isn't empty
      let keyElement

      if (key == 'website') {  // If it's the website, make it a link to the text
        keyElement = React.createElement('div', { className: classes.userInfoSectionText },
          React.createElement('a', { className: classes.pplMoeLink, href: info[key], target: "_blank" }, `${info[key]}`)
        )
      } else {
        keyElement = React.createElement('div', { className: classes.userInfoSectionText }, `${info[key]}`)
      }

      return React.createElement('div', {},
        React.createElement('div', { className: classes.userInfoSectionHeader }, Messages[`PPL_MOE_${key.toUpperCase()}`]),
        keyElement
      )
    }
    return null
  }

  generateBioDiv(bioMarkdown, name, classes) {
    if (bioMarkdown != "") { // If a bio has been written
      const bioHTML = bioMarkdown
        .replace(/"/gim, "&quot;")  // Sanitize HTML stuff (so you can't put XSS in your bio :P
        .replace(/'/gim, "&apos;")
        .replace(/</gim, "&lt;")
        .replace(/>/gim, "&gt;")
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')  // Format markdown (incomplete, does not include: tables, using underscores, strikethrough, seperators, code & codeblocks, & more!)
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
        .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' class='ppl-moe-link'>$1</a>")
        .replace(/  $/gim, '<br>')  // double space at end of lines is line break
        .replace(/(^|[^\n])\n{2}(?!\n)/g, "$1<br><br>") // double newline, no spaces is line break, RegEx magic: https://stackoverflow.com/questions/18011260/regex-to-match-single-new-line-regex-to-match-double-new-line#answer-18012521

      return React.createElement('div', {},
        React.createElement('div', { className: classes.userInfoSectionHeader }, `${Messages.PPL_MOE_ABOUT} ${name}`),
        React.createElement('div', { className: classes.userInfoSectionText, dangerouslySetInnerHTML: { __html: bioHTML } })  // whoooo dangerous inner html! (this is sanitized fully above, no user-written valid html can exist in this string)
      )
    }
  }

  async startPlugin() {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.css')
    //if(powercord.styleManager.themes.has("Comfy-git-clone")) {
    //this.loadStylesheet('comfy.css')
    //}
    powercord.api.settings.registerSettings('ppl-moe', {
      category: this.entityID,
      label: 'ppl.moe',
      render: Settings
    })

    // yoinked from the discord.bio plugin
    powercord.api.connections.registerConnection({
      type: 'ppl-moe',
      name: 'ppl.moe',
      color: '#3E1A24',
      icon: {
        color: 'https://cdn.discordapp.com/icons/267500017260953601/034b9f1489370e90e499f426d7ea7bd6.webp'
      },
      enabled: true,
      fetchAccount: async (id) => {
        try {
          if (!id) {
            ({
              id
            } = (await getModule(['getCurrentUser'])).getCurrentUser());
          }

          const profile = await this.fetchProfile(id);

          return ({
            type: 'ppl-moe',
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

    const _this = this
    const MessageHeader = await this._getMessageHeader()
    const UserProfile = await this._getUserProfile()
    const store = getStore()
    const classes = {
      tabBarItem: await getAllModules(['tabBarItem'])[1].tabBarItem,
      infoScroller: getModule(['infoScroller'], false).infoScroller + " " + await getAllModules(['scrollerBase'])[0].thin + " " + getAllModules(['fade'])[0].fade,
      userInfoSectionHeader: getModule(['userInfoSectionHeader'], false).userInfoSectionHeader,
      userInfoSectionText: getAllModules(['marginBottom8'])[0].marginBottom8 + " " + getAllModules(['size14'])[0].size14 + " " + getModule(['colorStandard'], false).colorStandard,
      pplMoeSection: "ppl-moe-section",
      pplMoeLink: "ppl-moe-link",
      pplMoePronouns: "ppl-moe-pronouns",
      pplMoeTabIcon: "ppl-moe-tab-icon",
      pplMoePronounsHidePronounDB: "ppl-moe-pronouns-hide-pronoundb"
    }

    inject('ppl-moe-messages-header', MessageHeader, 'default', function ([props], res) {
      if (!props.message.author.id || props.message.author.bot) return res

      const hidePronounDB = powercord.api.settings.store.getSetting("powercord-ppl-moe", "hidePronounDB", true)

      const element = React.createElement(
        'span',
        {
          className: classes.pplMoePronouns + " " + (hidePronounDB ? classes.pplMoePronounsHidePronounDB : "")
        },
        React.createElement(Pronouns, {
          userId: props.message.author.id,
          region: 'chat',
          prefix: ' • ',
        })
      )

      res.props.children[1].props.children.push(element)

      return res
    })

    inject('ppl-moe-user-load', UserProfile.prototype, 'componentDidMount', async function (_, res) {  // Apparently this being async can sometimes not work, but it has always worked in my testing & the discord.bio plugin does it too.
      const { user } = this.props
      if (!user || user.bot) {
        this.setState({ ppl_moe: { error: 'NO_USER_OR_BOT' } })
        return res
      }

      loadPronouns(user.id) // Make sure this user's pronouns are loaded, that way can check if they have a profile during the tab-bar inject

      try {
        const about = await _this.fetchProfile(user.id)
        this.setState({ ppl_moe: about })
      } catch (e) {
        this.setState({
          ppl_moe: {
            error: e.statusCode ? e.statusCode : 'UNKNOWN'  // Directly corresponds to a translation key
          }
        })
      }
    })

    inject('ppl-moe-user-tab-bar', UserProfile.prototype, 'renderTabBar', function (_, res) {
      const { user } = this.props

      // Do not add a tab if there is no tab bar, no user, or the user's a bot
      if (!res || !user || user.bot) return res
      if (store.getPronouns(user.id) == undefined) return res

      const tabIcon = powercord.styleManager.isInstalled("Comfy-git-clone") && powercord.styleManager.isEnabled("Comfy-git-clone")
      //powercord.api.settings.store.getSetting("powercord-ppl-moe", "tabIcon")

      const bioTab = React.createElement(TabBar.Item, {
        key: "PPL_MOE",
        className: classes.tabBarItem + " " + (tabIcon ? classes.pplMoeTabIcon : ""),
        id: "PPL_MOE"
      }, Messages.PPL_MOE_TAB)

      // Add the ppl.moe tab bar item to the list
      res.props.children.props.children.push(bioTab)

      return res
    })

    inject('ppl-moe-user-body', UserProfile.prototype, 'render', function (_, res) {
      // If we're in a different section, don't do anything
      if (this.props.section !== "PPL_MOE") return res

      // Find the body, clear it, & add our info
      const body = res.props.children.props.children[1]
      body.props.children = []

      if (this.state.ppl_moe.error) {
        body.props.children.push(
          React.createElement('div', { className: classes.infoScroller, dir: "ltr", style: { 'overflow': "hidden scroll", 'padding-right': "12px" } },
            React.createElement('div', { className: classes.pplMoeSection },
              React.createElement('div', { className: classes.userInfoSectionHeader }, `${Messages.PPL_MOE_ERROR}: ${this.state.ppl_moe.error}`), // This section is confusing but basically it translates "Error: 404"
              React.createElement('div', { className: classes.userInfoSectionText }, Messages[`PPL_MOE_ERROR_${this.state.ppl_moe.error}`])       // And then this part translates "No profile found"
            )
          )
        )
      } else {

        // ik it's ugly, but it works so :)
        body.props.children.push(
          React.createElement('div', { className: classes.infoScroller, dir: "ltr", style: { 'overflow': "hidden scroll", 'padding-right': "12px" } },
            React.createElement('div', { className: classes.pplMoeSection }, [
              _this.generateInfoDiv(this.state.ppl_moe.info, 'gender', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'pronouns', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'location', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'language', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'website', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'birthday', classes)
            ]),
            React.createElement('div', { className: classes.pplMoeSection }, [
              _this.generateBioDiv(this.state.ppl_moe.bio, this.state.ppl_moe.name, classes),
            ])
          )
        )
      }

      return res
    })

  }

  pluginWillUnload() {
    uninject('ppl-moe-messages-header')
    //uninject('ppl-moe-messages-header2')
    //uninject('ppl-moe-messages-header3')
    uninject('ppl-moe-user-load')
    uninject('ppl-moe-user-tab-bar')
    uninject('ppl-moe-user-body')
  }

  /* The following code is modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */

  async _getMessageHeader() {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default
      return typeof def === 'function' ? def : null
    }
    return getModule((m) => d(m)?.toString().includes('showTimestampOnHover'))
  }

  async _getUserProfile() {
    const VeryVeryDecoratedUserProfile = await getModuleByDisplayName('UserProfile')
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
