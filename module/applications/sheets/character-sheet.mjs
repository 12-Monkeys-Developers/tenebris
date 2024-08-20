const { HandlebarsApplicationMixin } = foundry.applications.api

export default class TenebrisCharacterSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /**
   * Different sheet modes.
   * @enum {number}
   */
  static SHEET_MODES = { EDIT: 0, PLAY: 1 }

  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  #dragDrop

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["tenebris", "actor", "character"],
    position: {
      width: 1400,
      height: 800,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      contentClasses: ["character-content"],
      resizable: true,
    },
    dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    actions: {
      editImage: TenebrisCharacterSheet.#onEditImage,
      toggleSheet: TenebrisCharacterSheet.#onToggleSheet,
      deleteVoieMajeure: TenebrisCharacterSheet.#onDeleteVoieMajeure,
      deleteVoieMineure: TenebrisCharacterSheet.#onDeleteVoieMineure,
      edit: TenebrisCharacterSheet.#onItemEdit,
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
  static PARTS = {
    main: {
      template: "systems/tenebris/templates/character-main.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    items: {
      template: "systems/tenebris/templates/character-items.hbs",
    },
    biography: {
      template: "systems/tenebris/templates/character-biography.hbs",
    },
  }

  /** @override */
  tabGroups = {
    sheet: "items",
  }

  /**
   * Prepare an array of form header tabs.
   * @returns {Record<string, Partial<ApplicationTab>>}
   */
  #getTabs() {
    const tabs = {
      items: { id: "items", group: "sheet", icon: "fa-solid fa-shapes", label: "TENEBRIS.Character.Label.details" },
      biography: { id: "biography", group: "sheet", icon: "fa-solid fa-book", label: "TENEBRIS.Character.Label.biography" },
    }
    for (const v of Object.values(tabs)) {
      v.active = this.tabGroups[v.group] === v.id
      v.cssClass = v.active ? "active" : ""
    }
    return tabs
  }

  /** @override */
  async _prepareContext() {
    const context = {
      tabs: this.#getTabs(),
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      actor: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      isEditMode: this.isEditMode,
      isPlayMode: this.isPlayMode,
      isEditable: this.isEditable,
    }
    console.log("character context", context)
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    switch (partId) {
      case "main":
        context.enrichedBiens = await TextEditor.enrichHTML(this.document.system.biens, { async: true })
        break
      case "items":
        context.tab = context.tabs.items
        const { talents, talentsAppris } = await this._prepareTalents()
        context.talents = talents.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))
        context.talentsAppris = talentsAppris.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))
        break
      case "biography":
        context.tab = context.tabs.biography
        context.enrichedDescription = await TextEditor.enrichHTML(this.document.system.description, { async: true })
        context.enrichedLangues = await TextEditor.enrichHTML(this.document.system.langues, { async: true })
        context.enrichedNotes = await TextEditor.enrichHTML(this.document.system.notes, { async: true })
        break
    }
    return context
  }

  async _prepareTalents() {
    const talents = []
    const talentsAppris = []
    if (this.actor.system.hasVoieMajeure) {
      const voie = this.actor.items.get(this.actor.system.voies.majeure.id)
      for (const talent of voie.system.talents) {
        const talentItem = await fromUuid(talent)
        if (talentItem) {
          talents.push(talentItem)
          if (talentItem.system.appris) talentsAppris.push(talentItem)
        }
      }
    }
    if (this.actor.system.hasVoieMineure) {
      const voie = this.actor.items.get(this.actor.system.voies.mineure.id)
      for (const talent of voie.system.talents) {
        const talentItem = await fromUuid(talent)
        if (talentItem) {
          talents.push(talentItem)
          if (talentItem.system.appris) talentsAppris.push(talentItem)
        }
      }
    }
    return { talents, talentsAppris }
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))
  }

  // #region Drag-and-Drop Workflow
  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      }
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      }
      return new DragDrop(d)
    })
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable && this.document.isOwner
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const el = event.currentTarget
    if ("link" in event.target.dataset) return

    // Extract the data you need
    let dragData = null

    if (!dragData) return

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

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
        if (item.type !== "path") return
        if (item.type === "path") return this.#onDropPathItem(item)
    }
  }

  async #onDropPathItem(item) {
    await this.actor.addPath(item)
  }

  // #endregion

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
   * Suppression de la voie majeure
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onDeleteVoieMajeure(event, target) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.localize("TENEBRIS.Dialog.suppressionTalents"),
      rejectClose: false,
      modal: true,
    })
    if (!proceed) return
    const item = this.actor.items.get(this.actor.system.voies.majeure.id)
    if (!item) return
    await this.actor.system.resetVoieMajeure(item.talents)
    item.delete()
    ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMajeureSupprimee"))
  }

  /**
   * Suppression de la voie mineure
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static async #onDeleteVoieMineure(event, target) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.localize("TENEBRIS.Dialog.suppressionTalents"),
      rejectClose: false,
      modal: true,
    })
    if (!proceed) return
    const item = this.actor.items.get(this.actor.system.voies.mineure.id)
    if (!item) return
    await this.actor.system.resetVoieMineure(item.talents)
    item.delete()
    ui.notifications.info(game.i18n.localize("TENEBRIS.Warnings.voieMineureSupprimee"))
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
    const fp = new FilePicker({
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
    if (!item) item = this.actor.items.get(id)
    if (!item) return
    item.sheet.render(true)
  }

  // #endregion
}
