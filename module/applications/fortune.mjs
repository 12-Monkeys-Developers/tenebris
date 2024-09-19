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
      title: "Roue de Fortune",
    },
    position: {
      width: 50,
      height: "auto",
      top: 200,
      left: 200,
    },
    form: {
      closeOnSubmit: true,
    },
    actions: {
      fortune: TenebrisFortune.#requestFortune,
    },
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
    }
  }

  /**
   * Handles the request for a fortune.
   *
   * @param {Event} event - The event that triggered the request.
   * @param {Object} target - The target object for the request.
   * @private
   */
  static #requestFortune(event, target) {
    console.log("request Fortune !")
    game.socket.emit(`system.${SYSTEM.id}`, {
      action: "fortune",
      data: {
        userId: game.user.id,
      },
    })
  }


  /**
   * Handles the fortune spcket event for a given user.
   *
   * @param {Object} [options] - The options object.
   * @param {string} [options.userId] - The ID of the user.
   * @returns {Promise<ChatMessage>} - The created chat message.
   */
  static async handleSocketEvent({ userId } = {}) {
    console.log(`handle Fortune from ${userId} !`)
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
      flags: { tenebris: { typeMessage: "fortune" } },
    }
    ChatMessage.applyRollMode(messageData, CONST.DICE_ROLL_MODES.PRIVATE)
    return ChatMessage.implementation.create(messageData)
  }


  /**
   * Handles the acceptance of a request event in the chat message by the GM
   *
   * @param {Event} event - The event object that triggered the request.
   * @param {HTMLElement} html - The HTML element associated with the event.
   * @param {Object} data - Additional data related to the event.
   * @returns {Promise<void>} A promise that resolves when the request has been processed.
   */
  static async acceptRequest(event, html, data) {
    console.log("accept Fortune !")
    const currentValue = game.settings.get("tenebris", "fortune")
    if (currentValue > 0) {
      const newValue = currentValue - 1
      await game.settings.set("tenebris", "fortune", newValue)
    }
  }
}
