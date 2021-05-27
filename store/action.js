const { get } = require('powercord/http')
const { FluxDispatcher } = require('powercord/webpack')
const { shouldFetchPronouns } = require('./store.js')

async function doLoadPronoun(id) {
  try {
    profile = await get(`https://ppl.moe/api/user/discord/${id}`)
      .then(r => r.body)
  } catch (e) {
    profile = { info: { pronouns: undefined } } // A value of undefined means the user has no profile
  }                                             // An empty string "" is returned by the API if they have a profile & just don't have the field set

  FluxDispatcher.dirtyDispatch({
    type: 'PPL_MOE_PROFILE_LOADED',
    id: id,
    loadedPronouns: profile.info.pronouns
  })
}



/* The following code is modified from code found in https://github.com/cyyynthia/pronoundb-powercord, license/copyright can be found in that repository. */
let timer = null
let buffer = []

module.exports = {
  loadPronouns: (id) => {
    if (!shouldFetchPronouns(id) || buffer.includes(id)) return

    if (!timer) {
      timer = setTimeout(() => {
        buffer.forEach((id) => {  // This ends up pushing a dispatch for every id, but this is the only way i could get it to run in the right order :/
          doLoadPronoun(id)       // to be clear: IDK if i should be dispatching in batches or not, but the pronoundb plugin did it because the pronoundb api has a batch lookup
        })                        // this code functions properly, but it sends a bunch of stuff to Flux/React, which may cause it to not perform the best
        buffer = []
        timer = null
      }, 50)
    }

    buffer.push(id)
  }
}

/* End of code from pronoundb-powercord */
