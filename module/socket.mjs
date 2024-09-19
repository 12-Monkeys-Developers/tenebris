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
      return TenebrisFortune.handle(data)
  }
}