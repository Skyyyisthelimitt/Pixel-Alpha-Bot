const { MessageFlags } = require('discord.js');
const config = require('../../config.json');

/**
 * Handles Button interactions for self-assigning roles & rules acceptance
 * @param {import('discord.js').Interaction} interaction 
 */
async function handleRoleInteraction(interaction) {
  if (!interaction.isButton()) return;

  const guild = interaction.guild;
  const member = interaction.member;

  if (!guild || !member) {
    return interaction.reply({ content: '❌ This action can only be performed inside the server.', flags: MessageFlags.Ephemeral });
  }

  // 1. Handle Rules Agreement Button Click
  const agreeButtonId = config.embeds.rules?.agreeButton?.customId;
  if (agreeButtonId && interaction.customId === agreeButtonId) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const roleName = config.embeds.rules.agreeButton.verifiedRoleName || 'Verified Member';
    const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());

    if (!role) {
      return interaction.editReply({
        content: `⚠️ Verification role **"${roleName}"** was not found in server settings. Please create a role named **"${roleName}"**!`
      });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.editReply({
        content: `ℹ️ You have already accepted the rules and have the **${role.name}** role!`
      });
    }

    try {
      await member.roles.add(role);
      return interaction.editReply({
        content: `✅ Thank you for accepting the Pixel community rules! You have been granted the **${role.name}** role.`
      });
    } catch (err) {
      console.error('Error assigning verified role:', err);
      return interaction.editReply({
        content: `❌ Failed to assign **${role.name}** role. Check bot role hierarchy.`
      });
    }
  }

  // 2. Find target role from config list
  const roleConfig = config.embeds.reactionRoles.roles.find(r => r.customId === interaction.customId);
  if (!roleConfig) return; // Not a recognized role button

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  // Find role in server by name (case-insensitive)
  const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleConfig.roleName.toLowerCase());

  if (!role) {
    return interaction.editReply({
      content: `⚠️ Role **"${roleConfig.roleName}"** was not found in server settings. Please create a role named **"${roleConfig.roleName}"** under **Server Settings > Roles**!`
    });
  }

  // Check bot role hierarchy position
  const botMember = guild.members.me;
  if (botMember.roles.highest.position <= role.position) {
    return interaction.editReply({
      content: `⚠️ Cannot toggle **${role.name}** because the **Pixel Bot** role is lower than or equal to that role in **Server Settings > Roles**.`
    });
  }

  try {
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      return interaction.editReply({
        content: `❌ Removed role: **${role.name}**`
      });
    } else {
      await member.roles.add(role);
      return interaction.editReply({
        content: `✅ You now have the **${role.name}** role!`
      });
    }
  } catch (err) {
    console.error('Error modifying role:', err);
    return interaction.editReply({
      content: `❌ Failed to toggle role **${role.name}**. Please check bot permissions.`
    });
  }
}

module.exports = {
  handleRoleInteraction
};
