const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api
import { SYSTEM } from "../config/system.mjs"

/**
 * An application for configuring the permissions which are available to each User role.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias PermissionConfig
 */
export default class TenebrisFortune extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    id: "tenebris-application-fortune",
    tag: "form",
    window: {
      contentClasses: ["tenebris-fortune"],
      title: "TENEBRIS.Fortune.title",
      controls: [],
    },
    position: {
      width: 200,
      height: 200,
      top: 80,
      left: 150,
    },
    form: {
      closeOnSubmit: true,
    },
    actions: {
      fortune: TenebrisFortune.#requestFortune,
      increaseFortune: TenebrisFortune.#increaseFortune,
      decreaseFortune: TenebrisFortune.#decreaseFortune,
    },
  }

  /** @override */
  _getHeaderControls() {
    const controls = super._getHeaderControls()
    if (game.user.isGM) {
      controls.push(
        {
          action: "increaseFortune",
          icon: "fa fa-plus",
          label: "Augmenter",
        },
        {
          action: "decreaseFortune",
          icon: "fa fa-minus",
          label: "Diminuer",
        },
      )
    }
    return controls
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/fortune.hbs",
    },
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(_options = {}) {
    return {
      fortune: game.settings.get("tenebris", "fortune"),
      userId: game.user.id,
      isGM: game.user.isGM,
    }
  }

  /**
   * Handles the request for a fortune.
   *
   * @param {Event} event The event that triggered the request.
   * @param {Object} target The target object for the request.
   * @private
   */
  static #requestFortune(event, target) {
    console.debug("request Fortune, event, target")
    game.socket.emit(`system.${SYSTEM.id}`, {
      action: "fortune",
      data: {
        userId: game.user.id,
      },
    })
  }

  static async #increaseFortune(event, target) {
    console.log("increase Fortune", event, target)
    const currentValue = game.settings.get("tenebris", "fortune")
    const newValue = currentValue + 1
    await game.settings.set("tenebris", "fortune", newValue)
  }

  static async #decreaseFortune(event, target) {
    console.log("decrease Fortune", event, target)
    const currentValue = game.settings.get("tenebris", "fortune")
    if (currentValue > 0) {
      const newValue = currentValue - 1
      await game.settings.set("tenebris", "fortune", newValue)
    }
  }

  /**
   * Handles the fortune spcket event for a given user.
   *
   * @param {Object} [options] The options object.
   * @param {string} [options.userId] The ID of the user.
   * @returns {Promise<ChatMessage>} - The created chat message.
   */
  static async handleSocketEvent({ userId } = {}) {
    console.debug(`handleSocketEvent Fortune from ${userId} !`)
    const origin = game.users.get(userId)
    const chatData = {
      name: origin.name,
      actingCharImg: origin.character?.img,
      origin: origin,
      user: game.user,
      isGM: game.user.isGM,
    }
    const content = await renderTemplate("systems/tenebris/templates/chat-fortune.hbs", chatData)
    const messageData = {
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      user: origin,
      speaker: { user: origin },
      content: content,
      flags: { tenebris: { typeMessage: "fortune", accepted: false } },
    }
    ChatMessage.applyRollMode(messageData, CONST.DICE_ROLL_MODES.PRIVATE)
    return ChatMessage.implementation.create(messageData)
  }

  /**
   * Handles the acceptance of a request event in the chat message by the GM
   *
   * @param {Event} event The event object that triggered the request.
   * @param {HTMLElement} html The HTML element associated with the event.
   * @param {Object} data Additional data related to the event.
   * @returns {Promise<void>} A promise that resolves when the request has been processed.
   */
  static async acceptRequest(event, html, data) {
    console.debug("acceptRequest Fortune", event, html, data)
    const currentValue = game.settings.get("tenebris", "fortune")
    if (currentValue > 0) {
      const newValue = currentValue - 1
      await game.settings.set("tenebris", "fortune", newValue)
    }
    let message = game.messages.get(data.message._id)
    message.update({ "flags.tenebris.accepted": true })
  }
}
