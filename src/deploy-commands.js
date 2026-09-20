const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const commands = [
  // 1. Post Official Links Embed
  new SlashCommandBuilder()
    .setName('post-links')
    .setDescription('Posts the official Sinegualfamily/Pixel links embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a banner image file from your device')
        .setRequired(false)
    ),

  // 2. Post Self-Assign Reaction Roles Embed
  new SlashCommandBuilder()
    .setName('post-roles')
    .setDescription('Posts the self-assignable reaction/button roles menu')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a main banner image for the bottom')
        .setRequired(false)
    ),

  // 3. Post Rules Embed
  new SlashCommandBuilder()
    .setName('post-rules')
    .setDescription('Posts the official Pixel community rules embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a main banner image for the bottom')
        .setRequired(false)
    ),

  // 4. Post Welcome Guide Embed
  new SlashCommandBuilder()
    .setName('post-welcome')
    .setDescription('Posts the official Pixel welcome guide embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a main banner image for the bottom')
        .setRequired(false)
    ),

  // 5. Post Get Started & Account Setup Embed
  new SlashCommandBuilder()
    .setName('post-get-started')
    .setDescription('Posts the official Get Started & Website Account Setup guide')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a main banner image for the bottom')
        .setRequired(false)
    ),

  // 6. Post FAQ Embed
  new SlashCommandBuilder()
    .setName('post-faq')
    .setDescription('Posts the official Pixel Alpha FAQ & Help embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('banner')
        .setDescription('Upload a main banner image for the bottom')
        .setRequired(false)
    ),

  // 7. Post Binance Connection Guide
  new SlashCommandBuilder()
    .setName('post-binance-guide')
    .setDescription('Posts the full Binance API connection guide into a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    ),

  // 8. Post Account Creation Guide
  new SlashCommandBuilder()
    .setName('post-account-guide')
    .setDescription('Posts the Pixel Alpha account creation guide')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post in (defaults to current channel)')
        .setRequired(false)
    ),

  // 8. Broker Setup Guide Quick Command
  new SlashCommandBuilder()
    .setName('broker')
    .setDescription('Posts setup guide for a supported broker')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Broker name')
        .setRequired(true)
        .addChoices(
          { name: 'Binance', value: 'binance' },
          { name: 'Capital.com', value: 'capital' },
          { name: 'IG.com', value: 'ig' },
          { name: 'Bybit', value: 'bybit' }
        )
    ),

  // 6. Staff Warning Command
  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a staff warning to a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Member to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(true)
    ),

  // 7. Welcome Member Command
  new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Send an official welcome message to a new member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('New member')
        .setRequired(true)
    )
].map(command => command.toJSON());

async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    console.error('❌ DISCORD_TOKEN and CLIENT_ID must be provided in .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('🔄 Registering Slash Commands with Discord...');

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ Successfully registered ${commands.length} slash commands for Guild: ${guildId}`);
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Successfully registered ${commands.length} global slash commands.`);
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

if (require.main === module) {
  registerCommands();
}

module.exports = { registerCommands, commands };
