const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api
import { SYSTEM } from "../config/system.mjs"

/**
 * An application for configuring the permissions which are available to each User role.
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias PermissionConfig
 */
export default class TenebrisManager extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "tenebris-application-manager",
    tag: "form",
    window: {
      contentClasses: ["tenebris-manager"],
      title: "TENEBRIS.Manager.title",
      resizable: true,
    },
    position: {
      width: "auto",
      height: "auto",
      top: 200,
      left: 500,
    },
    form: {
      closeOnSubmit: true,
    },
    actions: {
      resourceAll: TenebrisManager.#onResourceAll,
      resourceOne: TenebrisManager.#onResourceOne,
      saveAll: TenebrisManager.#onSaveAll,
      saveOne: TenebrisManager.#onSaveOne,
      openSheet: TenebrisManager.#onOpenSheet,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/manager.hbs",
    },
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(_options = {}) {
    return {
      players: game.users.filter((u) => u.hasPlayerOwner && u.active),
    }
  }

  static async #onResourceAll(event, target) {
    const value = event.target.dataset.resource
    TenebrisManager.askRollForAll("resource", value)
  }

  static async #onSaveAll(event, target) {
    const value = event.target.dataset.save
    TenebrisManager.askRollForAll("save", value)
  }

  static #onResourceOne(event, target) {
    const value = event.target.dataset.resource
    const recipient = event.target.parentElement.dataset.userId
    const name = event.target.parentElement.dataset.characterName
    TenebrisManager.askRollForOne("resource", value, recipient, name)
  }

  static async #onSaveOne(event, target) {
    const value = event.target.dataset.save
    const recipient = event.target.parentElement.dataset.userId
    const name = event.target.parentElement.dataset.characterName
    TenebrisManager.askRollForOne("save", value, recipient, name)
  }

  static #onOpenSheet(event, target) {
    const characterId = event.target.dataset.characterId
    game.actors.get(characterId).sheet.render(true)
  }

  static async askRollForAll(type, value, title = null, avantage = null) {
    let label = game.i18n.localize(`TENEBRIS.Manager.${value}`)
    let text = game.i18n.format("TENEBRIS.Chat.askRollForAll", { value: label })

    if (avantage) {
      switch (avantage) {
        case "++":
          text += ` ${game.i18n.localize("TENEBRIS.Roll.doubleAvantage")}`
          break
        case "+":
          text += ` ${game.i18n.localize("TENEBRIS.Roll.avantage")}`
          break
        case "-":
          text += ` ${game.i18n.localize("TENEBRIS.Roll.desavantage")}`
          break
        case "--":
          text += ` ${game.i18n.localize("TENEBRIS.Roll.doubleDesavantage")}`
          break
        default:
          break
      }
    }

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/tenebris/templates/chat-ask-roll.hbs`, {
        title: title !== null ? title : "",
        text: text,
        rollType: type,
        value: value,
      }),
      flags: { tenebris: { typeMessage: "askRoll" } },
    })
  }

  static async askRollForOne(type, value, recipient, name) {
    let label = game.i18n.localize(`TENEBRIS.Manager.${value}`)
    const text = game.i18n.format("TENEBRIS.Chat.askRollForOne", { value: label, name: name })

    game.socket.emit(`system.${SYSTEM.id}`, {
      action: "askRoll",
      data: {
        userId: recipient,
      },
    })

    ChatMessage.create({
      user: game.user.id,
      content: await renderTemplate(`systems/tenebris/templates/chat-ask-roll.hbs`, {
        text: text,
        rollType: type,
        value: value,
      }),
      whisper: [recipient],
      flags: { tenebris: { typeMessage: "askRoll" } },
    })
  }
}
