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
    console.log("Opponent sheet context", context)
    return context
  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    if (!this.isEditable || !this.isEditMode) return
    const data = TextEditor.getDragEventData(event)

    // Handle different data types
    switch (data.type) {
      case "Item":
        const item = await fromUuid(data.uuid)
        if (item.type === "attack") return this.#onDropAttackItem(item)
        if (item.type === "spell") return this._onDropItem(item)
    }
  }

  /**
   * Handles the drop event of an attack item.
   *
   * @param {Object} item The attack item being dropped.
   * @returns {Promise<void>} A promise that resolves when the attack item has been added to the document.
   * @private
   */
  async #onDropAttackItem(item) {
    await this.document.addAttack(item)
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
    console.log("Create attack", event, target)
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
