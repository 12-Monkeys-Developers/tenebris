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

Hooks.once("init", function () {
  console.log("Initializing Cthulhu Tenebris System")

  CONFIG.Actor.documentClass = documents.TenebrisActor
  CONFIG.Actor.dataModels = {
    character: models.TenebrisCharacter,
  }

  CONFIG.Item.documentClass = documents.TenebrisItem
  CONFIG.Item.dataModels = {
    path: models.TenebrisPath,
    talent: models.TenebrisTalent,
    weapon: models.TenebrisWeapon,
    armor: models.TenebrisArmor,
    spell: models.TenebrisSpell,
  }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet)
  Actors.registerSheet("tenebris", applications.TenebrisCharacterSheet, { types: ["character"], makeDefault: true })

  Items.unregisterSheet("core", ItemSheet)
  Items.registerSheet("tenebris", applications.TenebrisTalentSheet, { types: ["talent"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisPathSheet, { types: ["path"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisWeaponSheet, { types: ["weapon"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisSpellSheet, { types: ["spell"], makeDefault: true })
  Items.registerSheet("tenebris", applications.TenebrisArmorSheet, { types: ["armor"], makeDefault: true })

  // Register system settings
})
