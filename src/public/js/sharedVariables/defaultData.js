
const objectType_options = [
    { Key: "", Value: "-- None --" },
    { Key: "Comet", Value: "Comet" },
    { Key: "TNO", Value: "TNO (Trans-Neptunian Object)" },
    { Key: "KBO", Value: "KBO (Kuiper Belt Object)" },
    { Key: "Centaur", Value: "Centaur" },
    { Key: "Asteroid", Value: "Asteroid" },
    { Key: "ISO", Value: "ISO" },
    { Key: "Standard Star", Value: "Standard Star" }
];
const telescope_options = [
    { Key: "", Value: "-- None --" },
    { Key: "SDSS", Value: "SDSS" },
    { Key: "JC", Value: "Johnson/Cousins" },
    { Key: "BESSEL", Value: "Bessel" },
    { Key: "PS1", Value: "PanSTARRS" },
    { Key: "ATLAS", Value: "ATLAS" },
    { Key: "GAIA", Value: "GAIA" },
    { Key: "MEGACAM", Value: "CFHT Megacam" }
];
const filter_options = [
    { Key: "", Value: "-- None --" },
    { Key: "U_JC", Value: "U, Johnson-Cousins" },
    { Key: "B_JC", Value: "B, Johnson-Cousins" },
    { Key: "V_JC", Value: "V, Johnson-Cousins" },
    { Key: "R_JC", Value: "R, Johnson-Cousins" },
    { Key: "I_JC", Value: "I, Johnson-Cousins" },
    { Key: "U_SDSS", Value: "u, SDSS" },
    { Key: "G_SDSS", Value: "g, SDSS" },
    { Key: "R_SDSS", Value: "r, SDSS" },
    { Key: "I_SDSS", Value: "i, SDSS" },
    { Key: "Z_SDSS", Value: "z, SDSS" },
    { Key: "G_PS1", Value: "g, PS1" },
    { Key: "R_PS1", Value: "r, PS1" },
    { Key: "I_PS1", Value: "i, PS1" },
    { Key: "Z_PS1", Value: "z, PS1" },
    { Key: "W_PS1", Value: "w, PS1" },
    { Key: "Y_GMOS", Value: "Y, Gemini GMOS" },
    { Key: "U_AB", Value: "u, AB" },
    { Key: "G_AB", Value: "g, AB" },
    { Key: "R_AB", Value: "r, AB" },
    { Key: "I_AB", Value: "i, AB" },
    { Key: "Z_AB", Value: "z, AB" },
    { Key: "GRI_MEGACAM", Value: "gri, CFHT MegaCam wideband" },
    { Key: "B_BESSEL", Value: "B, Bessel" },
    { Key: "V_BESSEL", Value: "V, Bessel" },
    { Key: "R_BESSEL", Value: "R, Bessel" },
    { Key: "I_BESSEL", Value: "I, Bessel" },
    { Key: "C_ATLAS", Value: "C, ATLAS" },
    { Key: "O_ATLAS1", Value: "O, ATLAS1" },
    { Key: "O_ATLAS2", Value: "O, ATLAS2" },
    { Key: "G_GAIA", Value: "G, GAIA" },
    { Key: "OPEN", Value: "OPEN, no filter" },
    { Key: "WIDE", Value: "Wide band filter, generic" },
];

export { telescope_options, filter_options, objectType_options }