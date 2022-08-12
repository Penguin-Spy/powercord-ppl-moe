const { React, Flux } = require('powercord/webpack')
const pplMoeStore = require('../store/store.js')

function Pronouns({ userId, profile }) {
  React.useEffect(() => void pplMoeStore.ensureProfile(userId), [userId])

  // profile not loaded/no profile, no info (likely banned from ppl.moe), or no pronouns set
  if (!profile || !profile.info || profile.info.pronouns == "") return null
  return React.createElement(React.Fragment, {}, ' • ', profile.info.pronouns)
}

module.exports = Flux.connectStores(
  [pplMoeStore, powercord.api.settings.store],
  ({ userId }) => ({
    profile: pplMoeStore.getProfile(userId)
  })
)(React.memo(Pronouns))
