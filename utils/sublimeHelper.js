import fs from 'fs';
import os from 'os';

const default_scheme = {
  color_scheme: 'Packages/User/Material-Theme-Darker (Flake8Lint).tmTheme',
  theme: 'Material-Theme-Darker.sublime-theme'
};

const new_scheme = {
  color_scheme: 'Packages/Material Theme/schemes/Material-Theme.tmTheme',
  theme: 'Material-Theme.sublime-theme'
};

switch(os.platform()) {
  case 'darwin':
    settingsPath = `${process.env.HOME}/Library/Application Support/Sublime Text 3/Packages/User/Preferences.sublime-settings`
    break;
  case 'linux':
    settingsPath = `${process.env.HOME}/.config/sublime-text-3/Packages/User/Preferences.sublime-settings`
    break;
}

const applySettings = (prefPath, settings) => {
  fs.writeFile(prefPath, JSON.stringify(settings, null, 4))
}

const updateSublSettings = (settingsJson) => {
  if (settingsJson === 'test') {
    settingsJson = new_scheme
  }
  origSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  tmpSettings = { ...origSettings }
  // save for easy revert in case something screws up
  newSettings = {
    ...tmpSettings,
    ...settingsJson
  }
  applySettings(settingsPath, newSettings)
  const revertChanges = () => {
    applySettings(settingsPath, origSettings)
  }
  return revertChanges
}

export default updateSublSettings;
