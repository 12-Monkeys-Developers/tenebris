import TenebrisRoll from "./roll.mjs"

export default class TenebrisChatMessage extends ChatMessage {
  async _renderRollContent(messageData) {
    if (this.rolls[0] instanceof TenebrisRoll) {
      console.log("TenebrisChatMessage", this.rolls[0])
    }
    return super._renderRollContent(messageData)
  }
}
