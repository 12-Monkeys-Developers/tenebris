import { ROLL_TYPE } from "../../config/system.mjs"

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
      height: 850,
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
      delete: TenebrisCharacterSheet.#onItemDelete,
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
      rollType: {
        saveRob: {
          action: "roll",
          rollType: "save",
          rollTarget: "rob",
          tooltip: this._generateTooltip("save", "rob"),
        },
        saveDex: {
          action: "roll",
          rollType: "save",
          rollTarget: "dex",
          tooltip: this._generateTooltip("save", "dex"),
        },
        saveInt: {
          action: "roll",
          rollType: "save",
          rollTarget: "int",
          tooltip: this._generateTooltip("save", "int"),
        },
        savePer: {
          action: "roll",
          rollType: "save",
          rollTarget: "per",
          tooltip: this._generateTooltip("save", "per"),
        },
        saveVol: {
          action: "roll",
          rollType: "save",
          rollTarget: "vol",
          tooltip: this._generateTooltip("save", "vol"),
        },
        resourceSan: {
          action: "roll",
          rollType: "resource",
          rollTarget: "san",
          tooltip: this._generateTooltip("resource", "san"),
        },
        resourceOeil: {
          action: "roll",
          rollType: "resource",
          rollTarget: "oeil",
          tooltip: this._generateTooltip("resource", "oeil"),
        },
        resourceVerbe: {
          action: "roll",
          rollType: "resource",
          rollTarget: "verbe",
          tooltip: this._generateTooltip("resource", "verbe"),
        },
        resourceBourse: {
          action: "roll",
          rollType: "resource",
          rollTarget: "bourse",
          tooltip: this._generateTooltip("resource", "bourse"),
        },
        resourceMagie: {
          action: "roll",
          rollType: "resource",
          rollTarget: "magie",
          tooltip: this._generateTooltip("resource", "magie"),
        },
      },
    }
    console.log("character context", context)
    return context
  }

  _generateTooltip(type, target) {
    if (type === ROLL_TYPE.SAVE) {
      return `Experience: ${this.document.system.caracteristiques[target].progression.experience}`
    } else if (type === ROLL_TYPE.RESOURCE) {
      return `Experience: ${this.document.system.ressources[target].experience}`
    }
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
        const talents = await this._prepareTalents()
        context.talents = talents
        context.talentsAppris = talents.filter((talent) => talent.appris)
        context.weapons = this.actor.itemTypes.weapon
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
    const talents = this.actor.itemTypes.talent
      .map((talent) => {
        return {
          id: talent.id,
          uuid: talent.uuid,
          name: talent.name,
          description: talent.system.description,
          progression: talent.system.progression,
          niveau: talent.system.niveau,
          appris: talent.system.appris,
        }
      })
      .sort((a, b) => b.appris - a.appris || a.name.localeCompare(b.name, game.i18n.lang))
    return talents
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))
    const rollables = this.element.querySelectorAll(".rollable")
    rollables.forEach((d) => d.addEventListener("click", this.#onRoll.bind(this)))
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
        if (!["path", "weapon", "armor"].includes(item.type)) return
        if (item.type === "path") return this.#onDropPathItem(item)
        if (item.type === "weapon") return this.#onDropItem(item)
        if (item.type === "armor") return this.#onDropItem(item)
    }
  }

  async #onDropPathItem(item) {
    await this.actor.addPath(item)
  }

  async #onDropItem(item) {
    let itemData = item.toObject()
    await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
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
    const path = this.actor.items.get(this.actor.system.voies.majeure.id)
    if (!path) return
    await this.actor.deletePath(path, true)
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
    const path = this.actor.items.get(this.actor.system.voies.mineure.id)
    if (!path) return
    await this.actor.deletePath(path, false)
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
   * Roll a save
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  async #onRoll(event, target) {
    if (this.isEditMode) return
    // Jet de sauvegarde
    let elt = event.currentTarget.querySelector("input")
    // Jet de ressource
    if (!elt) elt = event.currentTarget.querySelector("select")
    // Jet de dégâts
    if (!elt) elt = event.currentTarget
    const rollType = elt.dataset.rollType
    let rollTarget
    let rollValue
    switch (rollType) {
      case ROLL_TYPE.SAVE:
        rollTarget = elt.dataset.rollTarget
        rollValue = this.actor.system.caracteristiques[rollTarget].valeur
        break
      case ROLL_TYPE.RESOURCE:
        rollTarget = elt.dataset.rollTarget
        rollValue = this.actor.system.ressources[rollTarget].valeur
        break
      case ROLL_TYPE.DAMAGE:
        rollTarget = elt.dataset.itemId
        rollValue = elt.dataset.rollValue
        break
      default:
        // Handle other cases or do nothing
        break
    }
    await this.actor.system.roll(rollType, rollTarget, rollValue)
  }
  // #endregion
}
