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
    id: "tenebris-fortune",
    tag: "form",
    window: {
      contentClasses: ["tenebris-fortune"],
      title: "Roue de fortune",
    },
    position: {
      width: 50,
      height: "auto",
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

  static async handle({ title, userId } = {}) {
    console.log(`handle Fortune from ${userId} !`)
    const origin = game.users.get(userId)
    const messageData = {
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      user: origin,
      speaker: { user: origin },
      actingCharImg: origin.character?.img,
      introText: "Fortune !!!",
      content: `${title}
      <div>
        ${origin.name} veut utiliser un point de Fortune
      </div>`,
      flags: { tenebris: { typeMessage: "fortune" } },
    }
    ChatMessage.applyRollMode(messageData, CONST.DICE_ROLL_MODES.PRIVATE)
    return ChatMessage.implementation.create(messageData)
  }

  static #requestFortune(event, target) {
    console.log("request Fortune !")
    game.socket.emit(`system.${SYSTEM.id}`, {
      action: "fortune",
      data: {
        title: "Fortune",
        userId: game.user.id,
      },
    })
  }
}
