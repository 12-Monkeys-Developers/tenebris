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
    switch (dropData.type) {
      case "Actor":
        const actor = await fromUuid(dropData.uuid)
        const actorCommand = `game.actors.get("${actor.id}").sheet.render(true)`
        this.createMacro(slot, actor.name, actorCommand, actor.img)
        break

      case "JournalEntry":
        const journal = await fromUuid(dropData.uuid)
        const journalCommand = `game.journal.get("${journal.id}").sheet.render(true)`
        this.createMacro(slot, journal.name, journalCommand, journal.img ? journal.img : "icons/svg/book.svg")
        break

      case "roll":
        const rollCommand = `game.actors.get('${dropData.actorId}').system.roll('${dropData.rollType}', '${dropData.rollTarget}');`
        const rollName = `${game.i18n.localize("TENEBRIS.Label.jet")} ${game.i18n.localize(`TENEBRIS.Manager.${dropData.rollTarget}`)}`
        this.createMacro(slot, rollName, rollCommand, "icons/svg/d20-grey.svg")
        break

      case "rollDamage":
        const weapon = game.actors.get(dropData.actorId).items.get(dropData.rollTarget)
        const rollDamageCommand = `game.actors.get('${dropData.actorId}').system.roll('${dropData.rollType}', '${dropData.rollTarget}');`
        const rollDamageName = `${game.i18n.localize("TENEBRIS.Label.jet")} ${weapon.name}`
        this.createMacro(slot, rollDamageName, rollDamageCommand, weapon.img)
        break

      case "rollAttack":
        const rollAttackCommand = `game.actors.get('${dropData.actorId}').system.roll('${dropData.rollValue}', '${dropData.rollTarget}');`
        const rollAttackName = `${game.i18n.localize("TENEBRIS.Label.jet")} ${dropData.rollTarget}`
        this.createMacro(slot, rollAttackName, rollAttackCommand, "icons/svg/d20-grey.svg")
        break

      default:
        // Handle other cases or do nothing
        break
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
