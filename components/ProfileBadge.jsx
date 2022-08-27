const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack')
const pplMoeStore = require('../store/store.js')

const RoleIcon = getModuleByDisplayName("RoleIcon", false)
const UserProfileModalActionCreators = getModule(['openUserProfileModal'], false)

function PronounsIcon({ userId, profile }) {
  React.useEffect(() => void pplMoeStore.getProfile(userId), [userId])

  // profile not loaded or no pronouns set
  if(!profile || profile.info?.pronouns == "") return null

  return RoleIcon({
    className: "ppl-moe-profile-badge",
    name: Messages.PPL_MOE_OPEN_PROFILE.format({ name: profile.name }),
    onClick: () => {
      try {
        UserProfileModalActionCreators.openUserProfileModal({
          userId, section: "PPL_MOE"
        })
      } catch(e) {
        console.error(e)
      }
    },
    src: "https://i.imgur.com/KqbpO1x.png"
  })
}

module.exports = Flux.connectStores(
  [pplMoeStore, powercord.api.settings.store],
  ({ userId }) => ({
    profile: pplMoeStore.getProfileSync(userId)
  })
)(React.memo(PronounsIcon))
