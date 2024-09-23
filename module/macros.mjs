export class Macros {
  /**
   * Creates a macro based on the type of data dropped onto the hotbar.
   *
   * @param {Object} dropData The data object representing the item dropped.
   * @param {string} dropData.type The type of the dropped item (e.g., "Actor", "JournalEntry", "roll").
   * @param {string} dropData.uuid The UUID of the dropped item.
   * @param {string} [dropData.actorId] The ID of the actor (required if type is "roll").
   * @param {string} [dropData.rollType] The type of roll (required if type is "roll").
   * @param {string} [dropData.rollTarget] The target of the roll (required if type is "roll").
   * @param {string} [dropData.value] The value of the roll (required if type is "roll").
   * @param {number} slot The hotbar slot where the macro will be created.
   *
   * @returns {Promise<void>} A promise that resolves when the macro is created.
   */
  static createTenebrisMacro = async function (dropData, slot) {
    // Creates a macro to open the actor sheet of the actor dropped on the hotbar
    if (dropData.type === "Actor") {
      const actor = await fromUuid(dropData.uuid)
      const command = `game.actors.get("${actor.id}").sheet.render(true)`
      this.createMacro(slot, actor.name, command, actor.img)
    }

    // Creates a macro to open the journal sheet of the journal dropped on the hotbar
    else if (dropData.type === "JournalEntry") {
      const journal = await fromUuid(dropData.uuid)
      const command = `game.journal.get("${journal.id}").sheet.render(true)`
      this.createMacro(slot, journal.name, command, journal.img ? journal.img : "icons/svg/book.svg")
    }

    // Creates a macro for roll
    else if (dropData.type === "roll") {
      const command = `game.actors.get('${dropData.actorId}').system.roll('${dropData.rollType}', '${dropData.rollTarget}', '${dropData.value}');`
      const name = game.i18n.localize("TENEBRIS.Label.jet") + " " + game.i18n.localize(`TENEBRIS.Manager.${dropData.rollTarget}`)
      this.createMacro(slot, name, command, "icons/svg/d20-grey.svg")
    }
  }

  /**
   * Create a macro
   * All macros are flaged with a tenebris.macro flag at true
   * @param {*} slot
   * @param {*} name
   * @param {*} command
   * @param {*} img
   */
  static createMacro = async function (slot, name, command, img) {
    let macro = game.macros.contents.find((m) => m.name === name && m.command === command)
    if (!macro) {
      macro = await Macro.create(
        {
          name: name,
          type: "script",
          img: img,
          command: command,
          flags: { "tenebris.macro": true },
        },
        { displaySheet: false },
      )
      game.user.assignHotbarMacro(macro, slot)
    }
  }
}
