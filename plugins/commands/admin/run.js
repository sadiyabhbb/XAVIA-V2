const config = {
    name: "run",
    aliases: ["eval", "execute", "exec"],
    permissions: [2],
    description: "Run bot scripts",
    usage: "<script>",
    credits: "XaviaTeam",
    isAbsolute: true
}

function onCall({ message, args }) {
    eval(args.join(" "));
}

export default {
    config,
    onCall
}
