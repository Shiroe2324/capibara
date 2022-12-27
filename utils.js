module.exports = {
    // funciones de ayuda
    addCoins: require('./utils/addCoins'),
    addXp: require('./utils/addXp'),
    findMember: require('./utils/findMember'),
    guildFetch: require('./utils/guildFetch'),
    pageSystem: require('./utils/pageSystem'),
    random: require('./utils/random'),
    removeAccents: require('./utils/removeAccents'),
    removeCoins: require('./utils/removeCoins'),
    setCoinsFormat: require('./utils/setCoinsFormat'),
    setCooldown: require('./utils/setCooldown'),
    setTimeFormat: require('./utils/setTimeFormat'),
    userFetch: require('./utils/userFetch'),
    weightedRandom: require('./utils/weightedRandom'),

    /**schemas de las bases de datos de mongoDB del bot*/
    schemas: require('./utils/schemas'),

    /**color universal del bot*/
    color: process.env.COLOR,

    /**nombre de la moneda universal del bot*/
    coin: process.env.COIN_NAME,
    
    /**permisos en español de los servidores de discord*/
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
        ManageMessages: "Administrar Canales",
        EmbedLinks: "insetar Enlaces",
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
        UseVAD: "usar el VAD",
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