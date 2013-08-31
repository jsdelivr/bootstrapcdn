// There is probably a better way, aside from passing config
// but I'll figure it out later.
function themeSelected(config, selected) {
    if (typeof selected === 'undefined' || selected === 'undefined') {
        return config.theme;
    }
    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
                parseInt(selected, 10) : config.theme;
}

function themeCSS(config, selected) {
    return config.bootswatch.bootstrap
            .replace('SWATCH_VERSION', config.bootswatch.version)
            .replace('SWATCH_NAME', config.bootswatch.themes[themeSelected(config, selected)]);
}

module.exports = {
    theme: {
        selected: themeSelected,
        css: themeCSS
    }
};

// vim: ft=javascript sw=4 sts=4 et:
