/**
 * Cthulhu Tenebris Game System
 * Author: Kristov
 * Software License:
 * Repository:
 */

import { SYSTEM } from "./module/config/system.mjs"
globalThis.SYSTEM = SYSTEM // Expose the SYSTEM object to the global scope

// Import modules
import * as models from "./module/models/_module.mjs"
import * as documents from "./module/documents/_module.mjs"
import * as applications from "./module/applications/_module.mjs"

import { handleSocketEvent } from "./module/socket.mjs"
import { configureDiceSoNice } from "./module/dice.mjs"
import { Macros } from "./module/macros.mjs"
import { setupTextEnrichers } from "./module/enrichers.mjs"

Hooks.once("init", function () {
  console.info("CTHULHU TENEBRIS | Initializing System")
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
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet)
  foundry.documents.collections.Actors.registerSheet("tenebris", applications.TenebrisCharacterSheet, { types: ["character"], makeDefault: true })
  foundry.documents.collections.Actors.registerSheet("tenebris", applications.TenebrisOpponentSheet, { types: ["opponent"], makeDefault: true })

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet)
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisTalentSheet, { types: ["talent"], makeDefault: true })
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisPathSheet, { types: ["path"], makeDefault: true })
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisWeaponSheet, { types: ["weapon"], makeDefault: true })
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisSpellSheet, { types: ["spell"], makeDefault: true })
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisArmorSheet, { types: ["armor"], makeDefault: true })
  foundry.documents.collections.Items.registerSheet("tenebris", applications.TenebrisAttackSheet, { types: ["attack"], makeDefault: true })

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
    requiresReload: true,
  })

  game.settings.register("tenebris", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  })

  // Activate socket handler
  game.socket.on(`system.${SYSTEM.id}`, handleSocketEvent)

  setupTextEnrichers()

  // Gestion des jets de dés depuis les journaux
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a.ask-roll-journal")
    if (!anchor) return
    event.preventDefault()
    event.stopPropagation()
    const type = anchor.dataset.rollType
    const target = anchor.dataset.rollTarget
    const title = anchor.dataset.rollTitle
    const avantage = anchor.dataset.rollAvantage
    applications.TenebrisManager.askRollForAll(type, target, title, avantage)
  })

  // Add a custom sidebar tab
  CONFIG.ui.sidebar.TABS.tenebris = {
    active: false,
    icon: `tenebris`,
    tooltip: `Cthulhu Tenebris`,
  }
  CONFIG.ui.tenebris = applications.TenebrisSidebarMenu

  console.info("CTHULHU TENEBRIS | System Initialized")
})

Hooks.once("ready", function () {
  console.info("CTHULHU TENEBRIS | Ready")
  game.system.applicationFortune = new applications.TenebrisFortune()
  game.system.applicationFortune.render(true)
  game.system.applicationManager = new applications.TenebrisManager()
  if (game.user.isGM) {
    game.system.applicationManager.render(true)
  }

  if (!SYSTEM.DEV_MODE) {
    registerWorldCount("tenebris")
  }
  _showUserGuide()

  /**
   * Affiche le guide utilisateur du système
   */
  async function _showUserGuide() {
    if (game.user.isGM) {
      const newVer = game.system.version
      const userGuideJournalName = "Guide du système"
      const userGuideCompendiumLabel = "userguide"

      let currentVer = "0"
      let oldUserGuide = game.journal.getName(userGuideJournalName)
      if (oldUserGuide !== undefined && oldUserGuide !== null && oldUserGuide.getFlag("tenebris", "UserGuideVersion") !== undefined) {
        currentVer = oldUserGuide.getFlag("tenebris", "UserGuideVersion")
      }
      if (newVer === currentVer) {
        // Up to date
        return
      }

      let newReleasePack = game.packs.find((p) => p.metadata.name === userGuideCompendiumLabel)
      if (newReleasePack === null || newReleasePack === undefined) {
        console.info("CTHULHU TENEBRIS | No compendium found for the system guide")
        return
      }
      await newReleasePack.getIndex()

      let newUserGuide = newReleasePack.index.find((j) => j.name === userGuideJournalName)
      if (newUserGuide === undefined || newUserGuide === null) {
        console.info("CTHULHU TENEBRIS | No system guide found in the compendium")
        return
      }

      // Don't delete until we have new release Pack
      if (oldUserGuide !== null && oldUserGuide !== undefined) {
        await oldUserGuide.delete()
      }

      await game.journal.importFromCompendium(newReleasePack, newUserGuide._id)
      let newReleaseJournal = game.journal.getName(newUserGuide.name)

      await newReleaseJournal.setFlag("tenebris", "UserGuideVersion", newVer)

      // Show journal
      await newReleaseJournal.sheet.render(true, { sheetMode: "text" })
    }
  }
})

Hooks.on("renderChatMessageHTML", (message, html, data) => {
  const typeMessage = data.message.flags.tenebris?.typeMessage
  // Message de fortune
  if (typeMessage === "fortune") {
    if (game.user.isGM && !data.message.flags.tenebris?.accepted) {
      html.querySelector(".button").addEventListener("click", (event) => applications.TenebrisFortune.acceptRequest(event, html, data))
    } else {
      html.querySelectorAll(".button").forEach((btn) => {
        btn.style.display = "none"
      })
      if (game.user.isGM) {
        html.querySelectorAll(".fortune-accepted").forEach((btn) => (btn.style.display = "flex"))
      }
    }
  }
  // Message de demande de jet de dés
  else if (typeMessage === "askRoll") {
    // Affichage des boutons de jet de dés uniquement pour les joueurs
    if (game.user.isGM) {
      html.querySelectorAll(".ask-roll-dice").forEach((btn) => (btn.style.display = "none"))
    } else {
      html.querySelectorAll(".ask-roll-dice").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const type = btn.dataset.type
          const value = btn.dataset.value
          const avantage = btn.dataset.avantage ?? "="
          const character = game.user.character
          if (type === SYSTEM.ROLL_TYPE.RESOURCE) character.rollResource(value)
          else if (type === SYSTEM.ROLL_TYPE.SAVE) character.rollSave(value, avantage)
        })
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
  if (["Actor", "Item", "JournalEntry", "roll", "rollDamage", "rollAttack"].includes(data.type)) {
    Macros.createTenebrisMacro(data, slot)
    return false
  }
})

/**
 * Register world usage statistics
 * @param {string} registerKey
 */
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey")
    if (worldKey === undefined || worldKey === "") {
      worldKey = foundry.utils.randomID(32)
      game.settings.set(registerKey, "worldKey", worldKey)
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    }

    let apiURL = "https://worlds.qawstats.info/worlds-counter"
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    })
  }
}
