/**
 * Prompt the user to perform a Standard Roll
 * @extends {Dialog}

export default class TenebrisDialog extends Dialog {
  /** @override 
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
*/

export default class TenebrisDialog extends foundry.applications.api.DialogV2 {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["tenebris", "roll"],
    window: { title: "Make a choice" },
    content: `
    <label><input type="radio" name="choice" value="one" checked> Option 1</label>
    <label><input type="radio" name="choice" value="two"> Option 2</label>
    <label><input type="radio" name="choice" value="three"> Options 3</label>
  `,
    buttons: [
      {
        action: "choice",
        label: "Make Choice",
        default: true,
        callback: (event, button, dialog) => button.form.elements.choice.value,
      },
      {
        action: "all",
        label: "Take All",
      },
    ],
  }

  _createTitle() {
    return "Make a choice"
  }

  _createContent() {
    return `
    <label><input type="radio" name="choice" value="one" checked> Option 1</label>
    <label><input type="radio" name="choice" value="two"> Option 2</label>
    <label><input type="radio" name="choice" value="three"> Options 3</label>
  `
  }
}
