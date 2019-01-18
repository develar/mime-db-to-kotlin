const db = require("mime-db")

function main() {
  const types = {}
  populateMaps(types)

  const extensions = Object.keys(types)
  let code = "@Suppress(\"SpellCheckingInspection\")\n"
  code += "internal val fileExtToMimeType by lazy<Map<String, String>> {\n"
  code += `  val map = THashMap<String, String>(${extensions.length})\n`
  for (const ext of extensions) {
    code += `  map.put("${ext}", "${types[ext]}")\n`
  }
  code += "  map\n"
  code += "}"
  require("fs").writeFileSync("result.kt", code)
}

function populateMaps(types) {
  // source preference (least -> most)
  const preference = ["nginx", "apache", undefined, "iana"]

  for (const type of Object.keys(db)) {
    const mime = db[type]
    const exts = mime.extensions

    if (!exts || !exts.length) {
      continue
    }

    // mime -> extensions
    // extensions[type] = exts

    // extension -> mime
    for (let i = 0; i < exts.length; i++) {
      const extension = exts[i]

      if (types[extension] != null) {
        const from = preference.indexOf(db[types[extension]].source)
        const to = preference.indexOf(mime.source)
        if (types[extension] !== "application/octet-stream" &&
          (from > to || (from === to && types[extension].substr(0, 12) === "application/"))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  }
}

main()