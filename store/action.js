const { get } = require('powercord/http')
const { FluxDispatcher } = require('powercord/webpack')
const { shouldFetchProfile } = require('./store.js')

async function doLoadProfile(id) {
  try {
    profile = await get(`https://ppl.moe/api/user/discord/${id}`)
      .then(r => r.body)
  } catch (e) {
    profile = 0 // value of 0 for profile means they don't have one
  }

  FluxDispatcher.dirtyDispatch({
    type: 'PPL_MOE_PROFILE_LOADED',
    id: id,
    loadedProfile: profile
  })

  return profile
}

/* The following code is modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */
let timer = null
let buffer = []

module.exports = {
  loadProfile: (id) => {
    if (!shouldFetchProfile(id) || buffer.includes(id)) return

    if (!timer) {
      timer = setTimeout(() => {
        buffer.forEach((id) => {  // This ends up pushing a dispatch for every id, but this is the only way i could get it to run in the right order :/
          doLoadProfile(id)       // to be clear: IDK if i should be dispatching in batches or not, but the pronoundb plugin did it because the pronoundb api has a batch lookup
        })                        // this code functions properly, but it sends a bunch of stuff to Flux/React, which may cause it to not perform the best
        buffer = []
        timer = null
      }, 50)
    }

    buffer.push(id)
  },
  doLoadProfile
}

/* End of code from pronoundb-powercord */
