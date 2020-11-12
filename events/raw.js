
module.exports = class {

    async run (packet) {

        // We don't want this to run on unrelated packets
        if (!['MESSAGE_REACTION_ADD', /*'MESSAGE_REACTION_REMOVE'*/].includes(packet.t)) return;
        // Grab the channel to check the message from
        let channel = bot.channels.cache.get(packet.d.channel_id);
        // There's no need to emit if the message is cached, because the event will fire anyway for that
        if (channel.messages.cache.has(packet.d.message_id)) return;
        // Since we have confirmed the message is not cached, let's fetch it
        channel.messages.fetch(packet.d.message_id).then(message => {
            // Emojis can have identifiers of name:id format, so we have to account for that case as well
            let emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            // This gives us the reaction we need to emit the event properly, in top of the message object
            let reaction = message.reactions.cache.get(emoji);
            // Adds the currently reacting user to the reaction's users collection.
            if (reaction) reaction.users.cache.set(packet.d.user_id, bot.users.cache.get(packet.d.user_id));
            // Check which type of event it is before emitting
            if (packet.t === 'MESSAGE_REACTION_ADD') {
                bot.emit('messageReactionAdd', reaction, bot.users.cache.get(packet.d.user_id));
                
            }
            if (packet.t === 'MESSAGE_REACTION_REMOVE') {
                bot.emit('messageReactionRemove', reaction, bot.users.cache.get(packet.d.user_id));
            }
        });

    }

}

