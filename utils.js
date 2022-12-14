module.exports = {
    activedCommand: require('./utils/activedCommand'),
    addCoins: require('./utils/addCoins'),
    addXp: require('./utils/addXp'),
    crimeFailed: require('./utils/crimeFailed'),
    emoji: require('./utils/emoji'),
    findMember: require('./utils/findMember'),
    guildFetch: require('./utils/guildFetch'),
    pageSystem: require('./utils/pageSystem'),
    random: require('./utils/random'),
    removeAccents: require('./utils/removeAccents'),
    removeCoins: require('./utils/removeCoins'),
    send: require('./utils/send'),
    separateString: require('./utils/separateString'),
    setCoinsFormat: require('./utils/setCoinsFormat'),
    setCooldown: require('./utils/setCooldown'),
    setTimeFormat: require('./utils/setTimeFormat'),
    shuffle: require('./utils/shuffle'),
    userFetch: require('./utils/userFetch'),
    weightedRandom: require('./utils/weightedRandom'),

    /**
     * transform a number into a string representation.
     * @param {number} number - the number to transform.
     * @returns {string} the formatted string.
     */
    formatNumber: (number) => number.toLocaleString(),

    /**schemeas of mongodb*/
    schemas: require('./utils/schemas'),

    /**universal bot color*/
    color: process.env['COLOR'],
    
    /**Discord permission on spanish*/
    Permissions: {
        CreateInstantInvite: "Crear Invitaciones Instantaneas",
        KickMembers: "Expulsar Miembros",
        BanMembers: "Banear Miembros",
        Administrator: "Administrador",
        ManageChannels: "Administrar Canales",
        ManageGuild: "Administrar El Servidor",
        AddReactions: "Añadir Reacciones",
        ViewAuditLog: "Ver el Registro de Auditoría",
        PrioritySpeaker: "Prioridad al Hablar",
        Stream: "Crear Streams",
        ViewChannel: "Ver Canales",
        SendMessages: "Enviar Mensajes",
        SendTTSMessages: "Enviar Mensajes TTS",
        ManageMessages: "Administrar Mensajes",
        EmbedLinks: "Insetar Enlaces",
        AttachFiles: "Enviar Archivos",
        ReadMessageHistory: "Leer el Historial de Mensajes",
        MentionEveryone: "Mencionar a Todos",
        UseExternalEmojis: "Usar Emojis Externos",
        ViewGuildInsights: "Ver las Perspectivas del Servidor",
        Connect: "Conectar al Canal de Voz",
        Speak: "Hablar en el Canal de Voz",
        MuteMembers: "Silenciar Miembros",
        DeafenMembers: "Ensordecer Miembros",
        MoveMembers: "Mover Miembros de Canales de Voz",
        UseVAD: "Usar el VAD",
        ChangeNickname: "Cambiar Apodos",
        ManageNicknames: "Administrar Apodos",
        ManageRoles: "Administrar Roles",
        ManageWebhooks: "Administrar Webhooks",
        ManageEmojisAndStickers: "Administrar Emojis y Stickers",
        UseApplicationCommands: "Usar Comandos de Aplicaciones",
        RequestToSpeak: "Solicitud Para Hablar",
        ManageEvents: "Administrar Eventos",
        ManageThreads: "Administrar Hilos",
        CreatePublicThreads: "Crear Hilos Publicos",
        CreatePrivateThreads: "Crear Hilos Privados",
        UseExternalStickers: "Usar Emojis Externos",
        SendMessagesInThreads: "Enviar Mensajes en Hilos",
        UseEmbeddedActivities: "Usar Actividades integradas",
        ModerateMembers: "Moderar Miembros"
    }
};