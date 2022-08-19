const { React, Flux } = require('powercord/webpack')
const pplMoeStore = require('../store/store.js')

function Pronouns({ userId, profile }) {
  React.useEffect(() => void pplMoeStore.getProfile(userId), [userId])

  // profile not loaded or no pronouns set
  if (!profile || profile.info?.pronouns == "") return null
  return React.createElement(React.Fragment, {}, ' • ', profile.info.pronouns)
}

module.exports = Flux.connectStores(
  [pplMoeStore, powercord.api.settings.store],
  ({ userId }) => ({
    profile: pplMoeStore.getProfileSync(userId)
  })
)(React.memo(Pronouns))
