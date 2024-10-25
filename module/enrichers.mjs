/**
 * Enricher qui permet de transformer un texte en un lien de lancer de dés
 * Pour une syntaxe de type @jet[x]{y}(z) avec x la caractéristique, y le titre et z l'avantage
 * x de type rob, dex, int, per, vol pour les caractéristiques
 * et de type oeil, verbe, san, bourse, magie pour les ressources
 * y est le titre du jet et permet de décrire l'action
 * z est l'avantage du jet, avec pour valeurs possibles : --, -, +, ++
 */
export function setupTextEnrichers() {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // eslint-disable-next-line no-useless-escape
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

/**
 * Retourne le libellé associé à la valeur qui sera affiché dans le journal
 * @param {string} value
 */
function getLibelle(value) {
  if (mapLibelles[value]) {
    return mapLibelles[value]
  }
  return null
}
