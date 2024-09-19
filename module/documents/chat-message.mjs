import TenebrisRoll from "./roll.mjs"

export default class TenebrisChatMessage extends ChatMessage {
  async _renderRollContent(messageData) {
    const data = messageData.message
    if (this.rolls[0] instanceof TenebrisRoll) {
      const isPrivate = !this.isContentVisible
      // _renderRollHTML va appeler render sur tous les rolls
      const rollHTML = await this._renderRollHTML(isPrivate)
      if (isPrivate) {
        data.flavor = game.i18n.format("CHAT.PrivateRollContent", { user: this.user.name })
        messageData.isWhisper = false
        messageData.alias = this.user.name
      }
      data.content = `<section class="dice-rolls">${rollHTML}</section>`
      return
    }

    return super._renderRollContent(messageData)
  }
}
