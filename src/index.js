
const core = require('@actions/core')

const fs = require("fs")

const getFileContents = path => fs.readFileSync(path).toString()

const escape = string => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

// --

const file = core.getInput("file", { required: true })
const output = core.getInput("output", { required: false }) || file
const tokenPattern = core.getInput("tokenPattern", { required: true })
const secretsJson = core.getInput("secretsJson", { required: true })

console.log("Substituting tokens matching", tokenPattern, "from file", file, "into output", output)

const fileContents = getFileContents(file)

const secrets = JSON.parse(secretsJson)

const regexPattern = new RegExp(escape(tokenPattern).replace(/TOKEN/, "(.*?)"), "gm")

const matches = [...fileContents.matchAll(regexPattern)]
    .map(m => ({
        target: m[0],
        token: m[1]
    }))
    .reduce((acc, next) =>
        acc.find(a => a.target === next.target) ? acc : [...acc, next],
        [])

console.log("Found", matches.length, "tokens", matches.map(m => m.token).join(", "))

const missing = matches.filter(m => secrets[m.token] === undefined).map(m => m.target)

if (missing.length)
    console.warn("Missing secrets", missing.length, missing.join(", "))

const replaced = matches
    .filter(m => secrets[m.token] !== undefined)
    .reduce((acc, next) =>
        acc.replace(new RegExp(escape(next.target), "gm"), secrets[next.token]),
        fileContents)

fs.writeFileSync(output, replaced)

console.log("Finished substituting")
