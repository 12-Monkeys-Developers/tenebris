const { HandlebarsApplicationMixin } = foundry.applications.api

export default class TenebrisActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /**
   * Different sheet modes.
   * @enum {number}
   */
  static SHEET_MODES = { EDIT: 0, PLAY: 1 }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["tenebris", "actor"],
    position: {
      width: 1400,
      height: "auto",
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    actions: {
      editImage: TenebrisActorSheet.#onEditImage,
      toggleSheet: TenebrisActorSheet.#onToggleSheet,
      edit: TenebrisActorSheet.#onItemEdit,
      delete: TenebrisActorSheet.#onItemDelete,
      createSpell: TenebrisActorSheet.#onCreateSpell,
    },
  }

  /**
   * The current sheet mode.
   * @type {number}
   */
  _sheetMode = this.constructor.SHEET_MODES.PLAY

  /**
   * Is the sheet currently in 'Play' mode?
   * @type {boolean}
   */
  get isPlayMode() {
    return this._sheetMode === this.constructor.SHEET_MODES.PLAY
  }

  /**
   * Is the sheet currently in 'Edit' mode?
   * @type {boolean}
   */
  get isEditMode() {
    return this._sheetMode === this.constructor.SHEET_MODES.EDIT
  }

  /** @override */
  async _prepareContext() {
    const context = {
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      actor: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
      isEditMode: this.isEditMode,
      isPlayMode: this.isPlayMode,
      isEditable: this.isEditable,
    }
    return context
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)
    // Add listeners to rollable elements
    const rollables = this.element.querySelectorAll(".rollable")
    rollables.forEach((d) => d.addEventListener("click", this._onRoll.bind(this)))
  }

  /** @override */
  async _onDragStart(event) {
    if ("link" in event.target.dataset) return

    const el = event.currentTarget.closest(".draggable")
    const dragType = el.dataset.dragType

    let dragData = {}

    let target
    switch (dragType) {
      case "save":
        target = event.currentTarget.querySelector("input")
        dragData = {
          actorId: this.document.id,
          type: "roll",
          rollType: target.dataset.rollType,
          rollTarget: target.dataset.rollTarget,
          value: target.value,
        }
        break
      case "resource":
        target = event.currentTarget.querySelector("select")
        dragData = {
          actorId: this.document.id,
          type: "roll",
          rollType: target.dataset.rollType,
          rollTarget: target.dataset.rollTarget,
          value: target.value,
        }
        break
      case "damage":
        dragData = {
          actorId: this.document.id,
          type: "rollDamage",
          rollType: el.dataset.dragType,
          rollTarget: el.dataset.itemId,
        }
        break
      case "attack":
        dragData = {
          actorId: this.document.id,
          type: "rollAttack",
          rollValue: el.dataset.rollValue,
          rollTarget: el.dataset.rollTarget,
        }
        break
      default:
        // Handle other cases or do nothing
        break
    }

    // Set data transfer
    if (!dragData) return
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
  }

  // #region Actions
  /**
   * Handle toggling between Edit and Play mode.
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static #onToggleSheet(event, target) {
    const modes = this.constructor.SHEET_MODES
    this._sheetMode = this.isEditMode ? modes.PLAY : modes.EDIT
    this.render()
  }

  /**
   * Handle changing a Document's image.
   *
   * @this TenebrisCharacterSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @private
   */
  static async #onEditImage(event, target) {
    const attr = target.dataset.edit
    const current = foundry.utils.getProperty(this.document, attr)
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {}
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path })
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    })
    return fp.browse()
  }

  /**
   * Edit an existing item within the Actor
   * Start with the uuid, if it's not found, fallback to the id (as Embedded item in the actor)
   * @this TenebrisCharacterSheet
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onItemEdit(event, target) {
    const id = target.getAttribute("data-item-id")
    const uuid = target.getAttribute("data-item-uuid")
    let item
    item = await fromUuid(uuid)
    if (!item) item = this.document.items.get(id)
    if (!item) return
    item.sheet.render(true)
  }

  /**
   * Delete an existing talent within the Actor
   * Use the uuid to display the talent sheet
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onItemDelete(event, target) {
    const itemUuid = target.getAttribute("data-item-uuid")
    const talent = await fromUuid(itemUuid)
    await talent.deleteDialog()
  }

  /**
   * Handles the creation of a new attack item.
   *
   * @param {Event} event The event that triggered the creation of the attack.
   * @param {Object} target The target object where the attack will be created.
   * @private
   * @static
   */
  static #onCreateSpell(event, target) {
    const item = this.document.createEmbeddedDocuments("Item", [{ name: "Nouveau sortilège", type: "spell" }])
  }

  // #endregion
}
