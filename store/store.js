const { Flux, FluxDispatcher } = require('powercord/webpack')
const { get } = require('powercord/http')

// list of loaded profiles
let profiles = {}
// profiles[id] == undefined means we don't know if that id has a profile
//              == false     means we know that id doesn't have a profile
//              == Object    the object is the user's profile (could be mostly empty &| banned)
// this allows us to use !profile to check if they have a valid profile,
// as well as differentiate between unfetched & nonexistent profiles

// list of profiles currently being fetched
let requestingProfiles = {}
// profiles[id] == true  request is currently processing
//                 false profile has already been requested (no code actually checks for this, just to differentiate in case we need to)

class PplMoeStore extends Flux.Store {
  getProfile(id) {
    return profiles[id]
  }

  // ensures we know about a user's profile after it's called (if awaited)
  // also emits a flux dispatch when complete informing React that we now have the user's profile
  async ensureProfile(id) {
    if (id in profiles || id in requestingProfiles) return  // if we already have the profile || we already are requesting it

    let profile
    try {
      requestingProfiles[id] = true // prevent re-requesting
      profile = await get(`https://ppl.moe/api/user/discord/${id}`).then(r => {
        requestingProfiles[id] = false
        return r.body
      })
    } catch (e) {
      profile = false // we know this id has no profile
    }

    if (profile.banned) profile = false

    FluxDispatcher.dirtyDispatch({
      type: 'PPL_MOE_PROFILE_LOADED',
      id: id,
      loadedProfile: profile
    })
  }
}

module.exports = new PplMoeStore(FluxDispatcher, {
  ['PPL_MOE_PROFILE_LOADED']: ({ id, loadedProfile }) => {
    profiles[id] = loadedProfile

    // this is grotesque, but also it works so :shrug:
    // when a valid profile is loaded and a user modal with the ppl.moe tab disabled is on screen, the tab is revealed.
    // this could fail if a modal is shown (with no profile) and then a valid profile is loaded (from chat messages probably),
    //   but that could only really happen when opening the modal immediatly after switching channels and getting quite (un)lucky
    if (loadedProfile) {
      const tabBarContainer = document.getElementsByClassName("ppl-moe-disable-tab")[0]
      if (tabBarContainer) tabBarContainer.classList.remove("ppl-moe-disable-tab")
    }
  }
})