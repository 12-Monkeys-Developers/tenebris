import TenebrisFortune from "./applications/fortune.mjs"

/**
 * Handles socket events based on the provided action.
 *
 * @param {Object} [params={}] The parameters for the socket event.
 * @param {string|null} [params.action=null] The action to be performed.
 * @param {Object} [params.data={}] The data associated with the action.
 * @returns {*} The result of the action handler, if applicable.
 */
export function handleSocketEvent({ action = null, data = {} } = {}) {
  console.log("handleSocketEvent", action, data)
  switch (action) {
    case "fortune":
      return TenebrisFortune.handleSocketEvent(data)
    case "askRoll":
      return _askRoll(data)
  }
}

/**
 * Handles the socket event to ask for a roll.
 *
 * @param {Object} [options={}] The options object.
 * @param {string} [options.userId] The ID of the user who initiated the roll.
 */
export function _askRoll({ userId } = {}) {
  console.log(`handleSocketEvent _askRoll from ${userId} !`)
  const currentUser = game.user._id
  if (userId === currentUser) {
    foundry.audio.AudioHelper.play({ src: "/systems/tenebris/sounds/drums.wav", volume: 0.8, autoplay: true, loop: false }, false)
  }
}
