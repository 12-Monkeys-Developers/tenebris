/**
 * Cthulhu Tenebris Game System
 * Author: Kristov
 * Software License:
 * Repository:
 */

import { SYSTEM } from "./config/system.mjs"
import TenebrisCharacterData from "./models/character.mjs"
import TenebrisActor from "./documents/actor.mjs"
import TenebrisCharacterSheet from "./applications/sheets/character-sheet.mjs"

globalThis.SYSTEM = SYSTEM // Expose the SYSTEM object to the global scope

Hooks.once("init", function () {
  console.log("Initializing Cthulhu Tenebris System")

  CONFIG.Actor.documentClass = TenebrisActor
  CONFIG.Actor.dataModels = {
    character: TenebrisCharacterData,
  }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet)
  Actors.registerSheet("tenebris", TenebrisCharacterSheet, {
    types: ["character"],
    makeDefault: true,
  })
})
