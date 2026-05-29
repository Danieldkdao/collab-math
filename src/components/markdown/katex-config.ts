export const katexMacros = {
  "\\RR": "\\mathbb{R}",
  "\\CC": "\\mathbb{C}",
  "\\QQ": "\\mathbb{Q}",
  "\\ZZ": "\\mathbb{Z}",
  "\\NN": "\\mathbb{N}",

  "\\eps": "\\varepsilon",
  "\\phi": "\\varphi",

  "\\abs": "\\lvert #1 \\rvert",
  "\\norm": "\\lVert #1 \\rVert",
  "\\set": "\\lbrace #1 \\rbrace",
  "\\paren": "\\lparen #1 \\rparen",
  "\\bracket": "\\lbrack #1 \\rbrack",
  "\\angles": "\\langle #1 \\rangle",

  "\\vect": "\\mathbf{#1}",
  "\\mat": "\\mathbf{#1}",

  "\\dv": "\\frac{d #1}{d #2}",
  "\\pdv": "\\frac{\\partial #1}{\\partial #2}",

  "\\Hom": "\\operatorname{Hom}",
  "\\End": "\\operatorname{End}",
  "\\Aut": "\\operatorname{Aut}",
  "\\Spec": "\\operatorname{Spec}",
  "\\rank": "\\operatorname{rank}",
  "\\tr": "\\operatorname{tr}",
  "\\im": "\\operatorname{im}",
  "\\ker": "\\operatorname{ker}",
} as const;

export const rehypeKatexOptions = {
  macros: katexMacros,
  strict: "ignore",
} as const;
