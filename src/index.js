const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
require('dotenv').config();

const { createOfficialLinksEmbed, createRolesEmbed, createRulesEmbed, createWelcomeEmbed, createGetStartedEmbed, createFaqEmbed, createBinanceGuideEmbeds, createAccountGuideEmbeds } = require('./handlers/embedHandler');
const { handleRoleInteraction } = require('./handlers/roleHandler');
const { registerCommands } = require('./deploy-commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('clientReady', async () => {
  console.log(`🤖 Pixel Bot is online and logged in as ${client.user.tag}!`);
  console.log(`🌐 Connected to ${client.guilds.cache.size} server(s).`);

  // Auto register slash commands on startup
  await registerCommands();
});

client.on('error', error => {
  if (error.code === 10062) return;
  console.error('Discord Client Error:', error);
});

process.on('unhandledRejection', error => {
  if (error?.code === 10062) return;
  console.error('Unhandled Rejection:', error);
});

// Auto-assign Unverified role on new member join
client.on('guildMemberAdd', async (member) => {
  try {
    const unverifiedRole = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'unverified');
    if (unverifiedRole) {
      await member.roles.add(unverifiedRole);
      console.log(`✅ Auto-assigned Unverified role to ${member.user.tag}`);
    }
  } catch (err) {
    console.error('❌ Failed to assign Unverified role on join:', err);
  }
});

// Cooldown set to prevent duplicate welcome pings (event can fire multiple times per verification)
const recentlyWelcomed = new Set();

// Detect when member gets 'Verified' role → post in welcome-feed
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    const hadVerified = oldMember.roles.cache.some(r => r.name.toLowerCase() === 'verified');
    const hasVerified = newMember.roles.cache.some(r => r.name.toLowerCase() === 'verified');

    // Only trigger when 'Verified' role is newly added
    if (!hadVerified && hasVerified) {
      // Skip if we already welcomed this member in the last 5 seconds
      if (recentlyWelcomed.has(newMember.id)) return;
      recentlyWelcomed.add(newMember.id);
      setTimeout(() => recentlyWelcomed.delete(newMember.id), 5000);

      console.log(`🎉 Member verified: ${newMember.user.tag}. Posting in welcome-feed...`);

      // --- Post public ping in #welcome-feed using channel ID directly ---
      const welcomeChannel = newMember.guild.channels.cache.get('1550339710847553546');

      if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
          .setTitle('Welcome to Pixel Alpha')
          .setDescription(
            `<@${newMember.id}> has been verified and is now a member of Pixel Alpha.\n\n` +
            `**Get started:**\n` +
            `· [Create your Pixel Alpha account](https://pixel-alpha.com/auth) to activate automated trading.\n` +
            `· To unlock full automated signals, sign up on our [website](https://pixel-alpha.com/auth) and drop your email or profile screenshot in <#1551222613714403378>.\n` +
            `· For the full setup guide, head to <#1550341300010618940>.\n` +
            `· Verify official links and socials in <#1545063934137081856>.`
          )
          .setColor('#F5B81C')
          .setFooter({ text: 'Pixel Alpha — Automated Trading Intelligence' })
          .setTimestamp();

        await welcomeChannel.send({
          content: `<@${newMember.id}>`,
          embeds: [welcomeEmbed]
        }).catch(err => console.error('❌ Could not post in welcome-feed:', err));
      } else {
        console.warn('⚠️ welcome-feed channel not found. Check bot has Send Messages permission there.');
      }

      console.log(`✅ Welcome-feed message sent to ${newMember.user.tag}.`);
    }
  } catch (err) {
    console.error('❌ Error handling member verification update:', err);
  }
});


client.on('interactionCreate', async (interaction) => {
  try {
    // Handle Button / Dropdown role toggling
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      return await handleRoleInteraction(interaction);
    }

    // Handle Slash Commands
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, guild, channel } = interaction;

    // Defer reply immediately for post commands to avoid 3-second Discord timeouts
    if (commandName.startsWith('post-')) {
      try {
        if (!interaction.deferred && !interaction.replied) {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
      } catch (deferErr) {
        if (deferErr.code !== 40060 && deferErr.code !== 10062) {
          console.error('⚠️ Warning: deferReply failed:', deferErr.message);
        }
      }
    }

    // 1. /post-links
    if (commandName === 'post-links') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const embed = createOfficialLinksEmbed(bannerUrl);

      try {
        await targetChannel.send({ embeds: [embed] });
        return interaction.editReply({
          content: `✅ Official Links embed posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send embed to ${targetChannel}. Check bot permissions in that channel.`
        });
      }
    }

    // 2. /post-roles
    if (commandName === 'post-roles') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const { embed, components } = createRolesEmbed(bannerUrl, guild);

      try {
        await targetChannel.send({ embeds: [embed], components });
        return interaction.editReply({
          content: `✅ Role menu posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send role embed to ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 3. /post-rules
    if (commandName === 'post-rules') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const { embed, components } = createRulesEmbed(bannerUrl);

      try {
        await targetChannel.send({ embeds: [embed], components });
        return interaction.editReply({
          content: `✅ Rules embed posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send rules embed to ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 4. /post-welcome
    if (commandName === 'post-welcome') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const { embed, components } = createWelcomeEmbed(bannerUrl);

      try {
        await targetChannel.send({ embeds: [embed], components });
        return interaction.editReply({
          content: `✅ Welcome guide embed posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send welcome embed to ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 5. /post-get-started
    if (commandName === 'post-get-started') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const { embed, components } = createGetStartedEmbed(bannerUrl);

      try {
        await targetChannel.send({ embeds: [embed], components });
        return interaction.editReply({
          content: `✅ Get Started guide embed posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send Get Started embed to ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 6. /post-faq
    if (commandName === 'post-faq') {
      const targetChannel = options.getChannel('channel') || channel;
      const bannerAttachment = options.getAttachment('banner');
      const bannerUrl = bannerAttachment ? bannerAttachment.url : null;

      const { embed, components } = createFaqEmbed(bannerUrl);

      try {
        await targetChannel.send({ embeds: [embed], components });
        return interaction.editReply({
          content: `✅ FAQ embed posted in ${targetChannel}!`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to send FAQ embed to ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 7. /post-binance-guide
    if (commandName === 'post-binance-guide') {
      const targetChannel = options.getChannel('channel') || channel;
      const embeds = createBinanceGuideEmbeds();

      try {
        if (targetChannel.type === ChannelType.GuildForum) {
          const thread = await targetChannel.threads.create({
            name: 'How to Connect Your Binance Account',
            message: { embeds: [embeds[0]] }
          });
          for (let i = 1; i < embeds.length; i++) {
            await thread.send({ embeds: [embeds[i]] });
          }
          return interaction.editReply({
            content: `✅ Binance connection guide created as a new post in ${targetChannel}! (${embeds.length} embeds)`
          });
        }

        for (const embed of embeds) {
          await targetChannel.send({ embeds: [embed] });
        }
        return interaction.editReply({
          content: `✅ Binance connection guide posted in ${targetChannel}! (${embeds.length} embeds)`
        });
      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: `❌ Failed to post guide in ${targetChannel}. Check bot permissions.`
        });
      }
    }

    // 8. /post-account-guide
    if (commandName === 'post-account-guide') {
      const targetChannel = options.getChannel('channel') || channel;
      const { embeds, components } = createAccountGuideEmbeds();

      console.log(`📨 Posting account guide (${embeds.length} embeds) to channel: ${targetChannel?.name || targetChannel?.id} (type: ${targetChannel?.type})`);

      try {
        if (targetChannel.type === ChannelType.GuildForum) {
          const thread = await targetChannel.threads.create({
            name: 'How to Create Your Pixel Alpha Account',
            message: { embeds: [embeds[0]] }
          });
          for (let i = 1; i < embeds.length; i++) {
            const isLast = i === embeds.length - 1;
            await thread.send({ embeds: [embeds[i]], components: isLast ? components : [] });
          }
          const replyText = `✅ Account creation guide created as a new post in ${targetChannel}! (${embeds.length} embeds)`;
          return interaction.deferred ? interaction.editReply({ content: replyText }) : interaction.reply({ content: replyText, flags: MessageFlags.Ephemeral });
        }

        for (let i = 0; i < embeds.length; i++) {
          const isLast = i === embeds.length - 1;
          await targetChannel.send({ embeds: [embeds[i]], components: isLast ? components : [] });
        }
        const replyText = `✅ Account creation guide posted in ${targetChannel}! (${embeds.length} embeds)`;
        return interaction.deferred ? interaction.editReply({ content: replyText }) : interaction.reply({ content: replyText, flags: MessageFlags.Ephemeral });
      } catch (err) {
        console.error('❌ Error sending account guide embeds:', err);
        const replyText = `❌ Failed to post account guide in ${targetChannel}. Check bot permissions: ${err.message}`;
        return interaction.deferred ? interaction.editReply({ content: replyText }) : interaction.reply({ content: replyText, flags: MessageFlags.Ephemeral });
      }
    }

    // 8. /broker
    if (commandName === 'broker') {
      const brokerName = options.getString('name');

      const guides = {
        binance: {
          title: '🟡 Binance API Connection Guide (USD-M Futures)',
          color: '#F5B81C',
          description: 
            '**Requirements:**\n' +
            '• Verified Binance account with USD-M Futures.\n' +
            '• At least **1,000 USDT** deposited in your **USD-M Futures wallet**.\n\n' +
            '**Steps to Connect:**\n' +
            '1. Go to Binance > **API Management**.\n' +
            '2. Click **Create API** > Select **HMAC (System generated)**.\n' +
            '3. Label the key: `Pixel Alpha`.\n' +
            '4. Permissions: ✅ **Enable Futures** | ❌ **Enable Withdrawals** (OFF).\n' +
            '5. Allow-list Server IP: `2.24.139.176` (Crucial!).\n' +
            '6. Paste Key & Secret at: https://pixel-alpha.com/dashboard/exchanges/connect\n\n' +
            '📖 **Full Docs**: https://pixel-alpha.com/docs/binance'
        },
        capital: {
          title: '🔴 Capital.com REST API Setup Guide',
          color: '#F5B81C',
          description: '1. Log into your Capital.com account.\n2. Go to **Settings** > **API Integrations**.\n3. Click **Generate New Key**.\n4. Save your API Key & Account Identifier.\n5. Enter credentials into Sinegualfamily REST settings.\n\n⚠️ **WARNING**: Keep your password and API credentials private at all times!'
        },
        ig: {
          title: '🔵 IG.com REST API Setup Guide',
          color: '#F5B81C',
          description: '1. Log into IG.com Developer Portal.\n2. Create a new API Key for **Trading**.\n3. Set restriction to **Live Account** or **Demo**.\n4. Input key into Sinegualfamily dashboard.\n\n⚠️ **WARNING**: Sinegualfamily team will NEVER ask for your IG login or API keys.'
        },
        bybit: {
          title: '🟢 Bybit REST API Setup Guide',
          color: '#F5B81C',
          description: '1. Log into Bybit Account & Security.\n2. Click **API Management** > **Create New Key**.\n3. Select **System-generated API Key**.\n4. Enable Read-Write for Order placement. Disable Withdrawals.\n5. Save Secret Key securely.'
        }
      };

      const guide = guides[brokerName];
      if (!guide) return;

      const embed = new EmbedBuilder()
        .setTitle(guide.title)
        .setDescription(guide.description)
        .setColor(guide.color)
        .setFooter({ text: 'Pixel Security & Broker Integration Guide' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // 6. /warn
    if (commandName === 'warn') {
      const targetUser = options.getUser('target');
      const reason = options.getString('reason');

      const embed = new EmbedBuilder()
        .setTitle('⚠️ Official Staff Warning')
        .setDescription(`**User**: ${targetUser}\n**Reason**: ${reason}\n**Issued By**: ${interaction.user}`)
        .setColor('#F5B81C')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // 7. /welcome
    if (commandName === 'welcome') {
      const targetUser = options.getUser('target');

      const embed = new EmbedBuilder()
        .setTitle(`👋 Welcome to Pixel Alpha, ${targetUser.username}!`)
        .setDescription(`Welcome ${targetUser}! Please start by checking out <#1545063934137081856> and reading our rules in <#1545060051650084864>.\n\nVisit <#1545060511283023933> to pick your notification roles!`)
        .setColor('#F5B81C')
        .setTimestamp();

      return interaction.reply({ content: `${targetUser}`, embeds: [embed] });
    }
  } catch (error) {
    if (error?.code === 10062) return;
    console.error('❌ Interaction Error:', error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: '❌ An error occurred.' });
      } else {
        await interaction.reply({ content: '❌ An error occurred.', flags: MessageFlags.Ephemeral });
      }
    } catch (_) {}
  }
});

client.login(process.env.DISCORD_TOKEN);
