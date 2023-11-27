import { slash as CoolDown } from '../utils/Cooldown.mjs'
import { slash as ErrorHandler } from '../utils/errorHandler.mjs';
import { EmbedBuilder } from '../utils/index.mjs';
import Bot from '../client.mjs';

// ================================================================================
export default {
  name: "interactionCreate",
  /**
 * Event handler for the "interactionCreate" event.
 * @param {Bot} client - The Discord client instance.
 * @param {import('discord.js').Interaction} interaction - The interaction object.
 * @returns None
 */
  run: async (client, interaction) => {
    const err = (err, i) => ErrorHandler(!i ? interaction : i, err);
    // ==============================< Command Handling >=============================\\
    const slashCommand = client.slashCommands.get(interaction.commandName);
    if (interaction.type == 4) {
      if (slashCommand.autocomplete) {
        const choices = [];
        await slashCommand.autocomplete(interaction, choices)
      }
    }
    if (!interaction.type == 2) return;
    // ==============================< If command doesn't found >=============================\\
    if (!slashCommand) return client.slashCommands.delete(interaction.commandName);
    // ==============================< Other Command Handling list >=============================\\
    const guildData = await interaction.guild.fetchData();
    try {
      // ==============================< Toggle off >=============================\\
      if (slashCommand.toggleOff) {
        return await interaction.reply({
          ephemeral: true,
          embeds: [new EmbedBuilder(client)
            .setTitle(`!{x} **That Command Has Been Disabled By The Developers! Please Try Later.**`).setColor(client.embed.wrongcolor)
          ]
        }).catch((e) => {
          console.log(e)
        });
      }
      // ==============================< On Mainenance Mode >============================= \\
      if (slashCommand.maintenance) {
        return await interaction.reply({
          ephemeral: true,
          content: `!{x} **${slashCommand.name} command is on __Maintenance Mode__** try again later!`
        })
      }
      // ==============================< Owner Only >============================= \\            
      if (slashCommand.ownerOnly) {
        const owners = client.config.Owners;
        if (!owners.includes(interaction.user.id)) return await interaction.reply({
          ephemeral: true,
          embeds: [new EmbedBuilder(client)
            .setDescription(`!{x} **You cannot use \`${slashCommand.name}\` command as this is a developer command.**`).setColor(client.embed.wrongcolor)
          ]
        }).catch((e) => {
          console.log(String(e).grey)
        });
      }
      // ==============================< NSFW checking >============================= \\
      if (slashCommand.nsfwOnly && !interaction.channel.nsfw) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder(client)
              .setDescription(`!{x} This command can only be used in NSFW channels!`)
              .setColor(client.embed.wrongcolor)
          ]
        })
      }

      // ==============================< CoolDown checking >============================= \\
      if (slashCommand.cooldown && CoolDown(interaction, slashCommand)) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder(client)
              .setDescription(`!{x} Please wait \`${CoolDown(interaction, slashCommand).toFixed(1)}\` Before using the \`${slashCommand.data.name}\` command again!`)
              .setColor(client.embed.wrongcolor)
          ]
        })
      }
      // ==============================< Start The Command >============================= \\	       
      await slashCommand.run({ client, interaction, err, guildData });
      client.channels.cache.get(client.config.Channels.CommandLogs)?.send({
        embeds: [new EmbedBuilder(client)
          .setColor("color")
          .setAuthor({ name: "Slash Command", iconURL: `https://cdn.discordapp.com/emojis/942758826904551464.webp?size=28&quality=lossless` })
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .addFields([
            { name: "**Author**", value: `\`\`\`yml\n${interaction.user.tag} [${interaction.user.id}]\`\`\`` },
            { name: "**Command Name**", value: `\`\`\`yml\n${slashCommand.data.name}\`\`\`` },
            // { name: `**Guild**`, value: `\`\`\`yml\n${interaction.guild.name} [${interaction.guild.id}]\`\`\`` }
          ])
        ]
      });
      // ==============================< On Error >============================= \\
    } catch (error) {
      err(error)
    }
  }
  // }
}