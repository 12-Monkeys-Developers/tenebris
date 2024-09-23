/**
 * Cthulhu Tenebris Game System
 * Author: Kristov
 * Software License:
 * Repository:
 */

import { SYSTEM } from "./config/system.mjs"
globalThis.SYSTEM = SYSTEM // Expose the SYSTEM object to the global scope

// Import modules
import * as models from "./models/_module.mjs"
import * as documents from "./documents/_module.mjs"
import * as applications from "./applications/_module.mjs"

import { handleSocketEvent } from "./socket.mjs"
import { configureDiceSoNice } from "./dice.mjs"
import { Macros } from "./macros.mjs"

Hooks.once("init", function () {
  console.info("CTHULHU TENEBRIS | Initializing Cthulhu Tenebris System")
  console.info(SYSTEM.ASCII)

  globalThis.tenebris = game.system
  game.system.CONST = SYSTEM

  // Expose the system API
  game.system.api = {
    applications,
    models,
    documents,
  }

  CONFIG.Actor.documentClass = documents.TenebrisActor
  CONFIG.Actor.dataModels = {
    character: models.TenebrisCharacter,
    opponent: models.TenebrisOpponent,
  }

  CONFIG.Item.documentClass = documents.TenebrisItem
  CONFIG.Item.dataModels = {
    path: models.TenebrisPath,
    talent: models.TenebrisTalent,
    weapon: models.TenebrisWeapon,
    armor: models.TenebrisArmor,
    spell: models.TenebrisSpell,
    attack: models.TenebrisAttack,
  }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet)
  Actors.registerSheet("tenebris", applications.TenebrisCharacterSheet, { types: ["character"], makeDefault: true })
  Actors.registerSheet("tenebris", applications.TenebrisOpponentSheet, { types: ["opponent"], makeDefault: true })

  Items.unregisterSheet("core", ItemSheet)
  Items.registerSheet("tenebris", applications.TenebrisTalentSheet, { types: ["talent"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisPathSheet, { types: ["path"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisWeaponSheet, { types: ["weapon"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisSpellSheet, { types: ["spell"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisArmorSheet, { types: ["armor"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisAttackSheet, { types: ["attack"], makeDefault: true })

  // Other Document Configuration
  CONFIG.ChatMessage.documentClass = documents.TenebrisChatMessage

  // Dice system configuration
  CONFIG.Dice.rolls.push(documents.TenebrisRoll)

  // Register system settings
  game.settings.register("tenebris", "displayOpponentMalus", {
    name: "TENEBRIS.Setting.displayOpponentMalus",
    hint: "TENEBRIS.Setting.displayOpponentMalusHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  })

  game.settings.register("tenebris", "fortune", {
    name: "TENEBRIS.Setting.fortune",
    hint: "TENEBRIS.Setting.fortuneHint",
    scope: "world",
    config: true,
    type: Number,
    default: 0,
  })

  // Activate socket handler
  game.socket.on(`system.${SYSTEM.id}`, handleSocketEvent)

  // Pre-localize configuration objects
  // TODO : encore d'actualité ?
  // preLocalizeConfig()
})

/**
 * Perform one-time configuration of system configuration objects.
 */
function preLocalizeConfig() {
  const localizeConfigObject = (obj, keys) => {
    for (let o of Object.values(obj)) {
      for (let k of keys) {
        o[k] = game.i18n.localize(o[k])
      }
    }
  }

  // CONFIG.Dice.rollModes = Object.fromEntries(Object.entries(CONFIG.Dice.rollModes).map(([key, value]) => [key, game.i18n.localize(value)]))

  // localizeConfigObject(SYSTEM.ACTION.TAG_CATEGORIES, ["label"])
  // localizeConfigObject(CONFIG.Dice.rollModes, ["label"])
}

Hooks.once("ready", function () {
  console.info("CTHULHU TENEBRIS | Ready")
  game.system.applicationFortune = new applications.TenebrisFortune()
  game.system.applicationFortune.render(true)
  game.system.applicationManager = new applications.TenebrisManager()
  if (game.user.isGM) {
    game.system.applicationManager.render(true)
  }
})

Hooks.on("renderChatMessage", (message, html, data) => {
  const typeMessage = data.message.flags.tenebris?.typeMessage
  if (typeMessage === "fortune") {
    if (game.user.isGM && !data.message.flags.tenebris?.accepted) {
      html.find(".button").click((event) => applications.TenebrisFortune.acceptRequest(event, html, data))
    } else {
      html.find(".button").each((i, btn) => {
        btn.style.display = "none"
      })
      if (game.user.isGM) {
        html.find(".fortune-accepted").each((i, btn) => (btn.style.display = "flex"))
      }
    }
  } else if (typeMessage === "askRoll") {
    if (game.user.isGM) {
      html.find(".ask-roll-dice").each((i, btn) => {
        btn.style.display = "none"
      })
    } else {
      html.find(".ask-roll-dice").click((event) => {
        const btn = $(event.currentTarget)
        const type = btn.data("type")
        const value = btn.data("value")
        const character = game.user.character
        if (type === SYSTEM.ROLL_TYPE.RESOURCE) character.rollResource(value)
        else if (type === SYSTEM.ROLL_TYPE.SAVE) character.rollSave(value)
      })
    }
  }
})

Hooks.on("updateSetting", async (setting, update, options, id) => {
  if (setting.key === "tenebris.fortune") {
    game.system.applicationFortune.render(true)
  }
})

// Dice-so-nice Ready
Hooks.once("diceSoNiceReady", (dice3d) => {
  configureDiceSoNice(dice3d)
})

/**
 * Create a macro when dropping an entity on the hotbar
 * Item      - open roll dialog
 * Actor     - open actor sheet
 * Journal   - open journal sheet
 */
Hooks.on("hotbarDrop", (bar, data, slot) => {
  if (["Actor", "Item", "JournalEntry", "roll"].includes(data.type)) {
    Macros.createTenebrisMacro(data, slot)
    return false
  }
})
