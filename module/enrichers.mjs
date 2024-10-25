export function setupTextEnrichers() {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      pattern: /\@jet\[(.+?)\]{(.*?)}\((.*?)\)/gm,
      enricher: async (match, options) => {
        const a = document.createElement("a")
        a.classList.add("ask-roll-journal")
        const target = match[1]
        const title = match[2]
        const avantage = match[3]

        let type = "resource"
        if (["rob", "dex", "int", "per", "vol"].includes(target)) {
          type = "save"
        }

        let rollAvantage = "normal"
        if (avantage) {
          switch (avantage) {
            case "++":
              rollAvantage = "++"
              break
            case "+":
              rollAvantage = "+"
              break
            case "-":
              rollAvantage = "-"
              break
            case "--":
              rollAvantage = "--"
              break
            default:
              break
          }
        }

        a.dataset.rollType = type
        a.dataset.rollTarget = target
        a.dataset.rollTitle = title
        a.dataset.rollAvantage = rollAvantage
        a.innerHTML = `
            <i class="fas fa-dice-d20"></i> ${getLibelle(target)}${rollAvantage !== "normal" ? rollAvantage : ""}
          `
        return a
      },
    },
  ])
}
const mapLibelles = {
  rob: "ROB",
  dex: "DEX",
  int: "INT",
  per: "PER",
  vol: "VOL",
  oeil: "OEIL",
  verbe: "VERBE",
  san: "SANTE MENTALE",
  bourse: "BOURSE",
  magie: "MAGIE",
}

function getLibelle(value) {
  if (mapLibelles[value]) {
    return mapLibelles[value]
  }
  return null
}
