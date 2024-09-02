/**
 * Prompt the user to perform a Standard Roll
 * @extends {Dialog}
 */
export default class TenebrisDialog extends Dialog {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 280,
      classes: ["tenebris", "roll"],
      template: `systems/tenebris/templates/roll-dialog.hbs`,
      submitOnChange: true,
      closeOnSubmit: false,
    })
  }
}
