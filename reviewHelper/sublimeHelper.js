const _ = require('lodash')
const fs = require('fs')

const default_scheme = {
    "color_scheme": "Packages/User/Material-Theme-Darker (Flake8Lint).tmTheme",
    "theme": "Material-Theme-Darker.sublime-theme"
};

const new_scheme = {
    "color_scheme": "Packages/Material Theme/schemes/Material-Theme.tmTheme",
    "theme": "Material-Theme.sublime-theme"
};

settingsPath = "/Users/jmccown/Library/Application Support/Sublime Text 3/Packages/User/Preferences.sublime-settings"

const applySettings = (prefPath, settings) => {
    fs.writeFile(prefPath, JSON.stringify(settings, null, 4))
}

const updateSublSettings = (settingsJson) => {
    if (settingsJson === "test") {
        settingsJson = new_scheme
    }
    origSettings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"))
    tmpSettings = _.assign({}, origSettings)
    // save for easy revert in case something screws up
    newSettings = _.assign(tmpSettings, settingsJson)
    applySettings(settingsPath, newSettings)
    const revertChanges = () => {
        applySettings(settingsPath, origSettings)
    }
}

module.exports = updateSublSettings
