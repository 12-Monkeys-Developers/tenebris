import TenebrisActorSheet from "./base-actor-sheet.mjs"

export default class TenebrisOpponentSheet extends TenebrisActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["opponent"],
    position: {
      width: 800,
      height: 700,
    },
    window: {
      contentClasses: ["opponent-content"],
    },
    actions: {
      createAttack: TenebrisOpponentSheet.#onCreateAttack,
    },
  }

  /** @override */
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/opponent.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.attacks = context.actor.itemTypes.attack
    context.spells = context.actor.itemTypes.spell
    context.hasSpells = context.spells.length > 0
    return context
  }

  /**
   * Handle a dropped Item on the Actor Sheet.
   * @param {DragEvent} event     The initiating drop event
   * @param {Item} item           The dropped Item document
   * @returns {Promise<void>}
   * @protected
   */
  async _onDropItem(event, item) {
    if (!["attack", "spell"].includes(item.type)) return
    if (!this.actor.isOwner) return
    if (item.type === "attack") return await this.document.addAttack(item)
    return super._onDropItem(event, item)
  }

  /**
   * Handles the creation of a new attack item.
   *
   * @param {Event} event The event that triggered the creation of the attack.
   * @param {Object} target The target object where the attack will be created.
   * @private
   * @static
   */
  static #onCreateAttack(event, target) {
    const item = this.document.createEmbeddedDocuments("Item", [{ name: "Nouvelle attaque", type: "attack" }])
  }

  /**
   * Roll a damage roll.
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  async _onRoll(event, target) {
    if (this.isEditMode) return
    const elt = event.currentTarget
    const rollValue = elt.dataset.rollValue
    const rollTarget = elt.dataset.itemName

    await this.document.system.roll(rollValue, rollTarget)
  }
}
