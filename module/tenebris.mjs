/**
 * Cthulhu Tenebris Game System
 * Author: Kristov
 * Software License:
 * Repository:
 */

import { SYSTEM } from "./config/system.mjs"
import TenebrisCharacterData from "./models/character.mjs"
import TenebrisPathData from "./models/path.mjs"
import TenebrisTalentData from "./models/talent.mjs"
import TenebrisActor from "./documents/actor.mjs"
import TenebrisItem from "./documents/item.mjs"
import TenebrisCharacterSheet from "./applications/sheets/character-sheet.mjs"
import TenebrisTalentSheet from "./applications/sheets/talent-sheet.mjs"
import TenebrisPathSheet from "./applications/sheets/path-sheet.mjs"

globalThis.SYSTEM = SYSTEM // Expose the SYSTEM object to the global scope

Hooks.once("init", function () {
  console.log("Initializing Cthulhu Tenebris System")

  CONFIG.Actor.documentClass = TenebrisActor
  CONFIG.Actor.dataModels = {
    character: TenebrisCharacterData,
  }

  CONFIG.Item.documentClass = TenebrisItem
  CONFIG.Item.dataModels = {
    path: TenebrisPathData,
    talent: TenebrisTalentData,
  }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet)
  Actors.registerSheet("tenebris", TenebrisCharacterSheet, {
    types: ["character"],
    makeDefault: true,
  })

  Items.unregisterSheet("core", ItemSheet)
  Items.registerSheet("tenebris", TenebrisTalentSheet, {
    types: ["talent"],
    makeDefault: true,
  })
  Items.registerSheet("tenebris", TenebrisPathSheet, {
    types: ["path"],
    makeDefault: true,
  })
})
