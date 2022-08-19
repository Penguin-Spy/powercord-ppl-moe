const { Flux, FluxDispatcher } = require('powercord/webpack')
const { get } = require('powercord/http')

// list of loaded profiles
profiles = {}
// profiles[id] == undefined means we don't know if that id has a profile
//              == false     means we know that id doesn't have a profile
//              == Object    the object is the user's profile (could be mostly empty &| banned)
// this allows us to use !profile to check if they have a valid profile,
// as well as differentiate between unfetched & nonexistent profiles

// list of profiles currently being fetched
requestingProfiles = {}
// requestingProfiles[id] = Promise || undefined || false


class PplMoeStore extends Flux.Store {

  // attempt to get the user's profile, and fetch it if we don't have it yet
  // this will always return either a profile or a promise that will resolve to a profile (profile may be false indicating one does not exist)
  getProfile(id) {
    // if we already have the profile, just return it
    if (id in profiles) return profiles[id]
    // if we don't have it but we are already fetching it, return the existing promise
    else if (id in requestingProfiles) return requestingProfiles[id]

    // sets up an asynchronous request for the users profile, and the callbacks to be ran when it returns
    // the callbacks run the Flux dispatch (todo: why?) and return the processed profile
    requestingProfiles[id] = get(`https://ppl.moe/api/user/discord/${id}`).then(r => r.body).then(profile => {
      if (profile.banned) profile = false

      FluxDispatcher.dispatch({
        type: 'PPL_MOE_PROFILE_LOADED',
        id: id,
        loadedProfile: profile
      })
      return profile

    }).catch((reason) => {
      if (reason.statusCode != 404) {
        console.warn(`ppl.moe profile fetch for ${id} failed:`, reason)
      }

      FluxDispatcher.dispatch({
        type: 'PPL_MOE_PROFILE_LOADED',
        id: id,
        loadedProfile: false
      })
      return false

    }).finally(() => {
      requestingProfiles[id] = false
    })

    // return the Promise of that fetch
    return requestingProfiles[id]
  }

  // simply try to get the user's profile, returning nothing if we haven't fetched it yet
  // this isn't technically a "synchronous" version, it just doesn't touch async stuff
  getProfileSync(id) {
    return profiles[id]
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