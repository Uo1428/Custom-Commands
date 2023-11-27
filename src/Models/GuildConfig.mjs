import config from "../../Assets/Config/config.mjs"
export default {
    Guild: { Type: "String" },

    Prefix: {
        Type: "String",
        Default: config.Prefix
    },

    //* ======== Custom Commands
    CustomCommands: {
        Type: "Object",
        Default: {
            Enable: false,
            Prefix: "!",
            List: []
        }
    },
}
