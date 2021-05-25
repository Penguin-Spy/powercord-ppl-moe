const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack')
const { TabBar } = require('powercord/components');
const { get } = require('powercord/http');

class PplMoe extends Plugin {
  
  async fetchAbout(id) {
    return await get(`https://ppl.moe/api/user/discord/${id}`)
      .then(r => r.body);
  }
  
  generateInfoDiv(info, key, classes) {
    if(info[key] != "") { // If this field isn't empty
      let keyElement;
      
      if(key == 'website') {  // If it's the website, make it a link to the text
        keyElement = React.createElement('div', { className: classes.userInfoSectionText }, 
          React.createElement('a', { className: "ppl-moe-link", href: info[key], target: "_blank" }, `${info[key]}`)
        )
      } else {
        keyElement = React.createElement('div', { className: classes.userInfoSectionText }, `${info[key]}`)
      }
      
      return React.createElement('div', { },
        React.createElement('div', { className: classes.userInfoSectionHeader }, `${key}`),
        keyElement
      )
    }
    return null;
  }
  
  generateBioDiv(bioMarkdown, classes) {
    if(bioMarkdown != "") { // If a bio has been written
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
      .replace(/  $/gim, '<br>')
      
      return React.createElement('div', { },
        React.createElement('div', { className: classes.userInfoSectionHeader }, `about`),
        React.createElement('div', { className: classes.userInfoSectionText, dangerouslySetInnerHTML: { __html: bioHTML} })  // whoooo dangerous inner html! (this is sanitized fully above, no user-written valid html can exist in this string)
      )
    }
  }
  
  async startPlugin () {
    this.loadStylesheet('style.css')
    /*powercord.api.settings.registerSettings('ppl-moe', {
      category: this.entityID,
      label: 'ppl.moe',
      render: Settings
    })*/

    const _this = this;
    //const MessageHeader = await this._getMessageHeader()
    const UserProfile = await this._getUserProfile()
    const classes = { // Thanks to 
      tabBarItem: await getAllModules(['tabBarItem'])[1].tabBarItem,
      infoScroller: getModule(['infoScroller'], false).infoScroller + " " + await getAllModules(['scrollerBase'])[0].scrollerBase,
      userInfoSectionHeader: getModule(['userInfoSectionHeader'], false).userInfoSectionHeader,
      userInfoSectionText: getAllModules(['marginBottom8'])[0].marginBottom8 + " " + getAllModules(['size14'])[0].size14 + " " + getModule(['colorStandard'], false).colorStandard,
    }

    // TODO (unmodified from https://github.com/cyyynthia/pronoundb-powercord, but also unused, just here as a starting point when i get around to writing this)
    /*inject('ppl-moe-messages-header', MessageHeader, 'default', function ([ props ], res) {
      res.props.children[1].props.children.push(
        React.createElement(
          'span',
          { style: { color: 'var(--text-muted)', fontSize: '.9rem', marginRight: props.compact ? '.6rem' : '' } },
          React.createElement(Pronouns, {
            userId: props.message.author.id,
            region: props.message.id === 'pronoundb-fake' ? 'settings' : 'chat',
            prefix: ' • '
          })
        )
      )

      return res
    })*/
    
    inject('ppl-moe-user-load', UserProfile.prototype, 'componentDidMount', async function (_, res) {  // Apparently this being async can sometimes not work, but it has always worked in my testing & the discord.bio plugin does it too.
      const { user } = this.props;
      if (!user || user.bot) return;

      try {
        const about = await _this.fetchAbout(user.id);
        this.setState({ ppl_moe: about });
      } catch (e) {
        switch (e.statusCode) {
          case 404: {
            this.setState({
              ppl_moe: {
                error: {
                  message: "No profile found.",
                  code: e.statusCode
                }
              }
            });
            break;
          }
          case 429: {
            this.setState({
              ppl_moe: {
                error: {
                  message: "get rate limited lmao",
                  code: e.statusCode
                }
              }
            });
            break;
          }
          default: {
            console.log(e)
            this.setState({
              ppl_moe: {
                error: {
                  message: "Unknown error, check dev tools console for more info",
                  code: e.statusCode
                }
              }
            });
            break;
          }
        }
      }
    });
    
    inject('ppl-moe-user-tab-bar', UserProfile.prototype, 'renderTabBar', function (_, res) {
      const { user } = this.props;

      // Do not add a tab if there is no tab bar, no user, or the user's a bot
      if (!res || !user || user.bot ) return res;

      const bioTab = React.createElement(TabBar.Item, {
        key: 'PPL_MOE',
        className: classes.tabBarItem,
        id: 'PPL_MOE'
      }, 'ppl.moe');

      // Add the ppl.moe tab bar item to the list
      res.props.children.props.children.push(bioTab)

      return res;
    });

    inject('ppl-moe-user-body', UserProfile.prototype, 'render', function (_, res) {
      // If we're in a different section, don't do anything
      if (this.props.section !== 'PPL_MOE') return res;

      // Find the body, clear it, & add our info
      const body = res.props.children.props.children[1];
      body.props.children = [];

      if (this.state.ppl_moe.error) {
        body.props.children.push(
          React.createElement('div', { className: classes.infoScroller, style: {'overflow': "hidden scroll", 'padding-right': "12px"} },
            React.createElement('div', { className: "ppl-moe-section" }, 
              React.createElement('div', { className: classes.userInfoSectionHeader }, `Error ${this.state.ppl_moe.error.code}:`),
              React.createElement('div', { className: classes.userInfoSectionText }, `${this.state.ppl_moe.error.message}`)
            )
          )
        )
      } else {

        // ik it's ugly, but it works so :)
        body.props.children.push(
          React.createElement('div', { className: classes.infoScroller, style: {'overflow': "hidden scroll", 'padding-right': "12px"} },
            React.createElement('div', { className: "ppl-moe-section" }, [
              _this.generateInfoDiv(this.state.ppl_moe.info, 'gender', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'pronouns', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'location', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'language', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'website', classes),
              _this.generateInfoDiv(this.state.ppl_moe.info, 'birthday', classes)
            ]),
            React.createElement('div', { className: "ppl-moe-section" }, [
              _this.generateBioDiv(this.state.ppl_moe.bio, classes),
            ])
          )
        )
      }
      
      return res;
    });
    
  }

  pluginWillUnload () {
    //uninject('ppl-moe-messages-header')
    uninject('ppl-moe-user-load')
    uninject('ppl-moe-user-tab-bar')
    uninject('ppl-moe-user-body')
  }

  /* The following code is modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */
  
  /*async _getMessageHeader () {
    const d = (m) => {
      const def = m.__powercordOriginal_default ?? m.default
      return typeof def === 'function' ? def : null
    }
    return getModule((m) => d(m)?.toString().includes('headerText'))
  }*/

  async _getUserProfile () {
    const VeryVeryDecoratedUserProfile = await getModuleByDisplayName('UserProfile')
    const VeryDecoratedUserProfileBody = VeryVeryDecoratedUserProfile.prototype.render().type
    const DecoratedUserProfileBody = this._extractFromFlux(VeryDecoratedUserProfileBody).render().type
    const UserProfile = DecoratedUserProfileBody.prototype.render.call({ props: { forwardedRef: null } }).type

    return UserProfile
  }
  
  _extractFromFlux (FluxContainer) {
    return FluxContainer.prototype.render.call({ memoizedGetStateFromStores: () => null }).type
  }
  
  /* End of code from pronoundb-powercord */
  
}

module.exports = PplMoe
