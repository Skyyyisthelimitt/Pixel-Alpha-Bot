const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

/**
 * Builds the Official Links Embed
 */
function createOfficialLinksEmbed(customBanner) {
  const data = config.embeds.officialLinks;
  
  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setColor(data.color)
    .setFooter({ text: data.footer })
    .setTimestamp();

  if (data.description) embed.setDescription(data.description);

  data.fields.forEach(field => {
    embed.addFields({ name: field.name, value: field.value, inline: field.inline });
  });

  const banner = customBanner || data.bannerUrl;
  if (banner && typeof banner === 'string' && banner.startsWith('http')) {
    embed.setImage(banner);
  }

  return embed;
}

/**
 * Builds the Role Selection Embed
 */
function createRolesEmbed(customImage, guild) {
  const data = config.embeds.reactionRoles;

  let bodyLines = `${data.description}\n\n`;

  data.roles.forEach(r => {
    let roleMention = `@${r.roleName}`;
    if (guild) {
      const foundRole = guild.roles.cache.find(gRole => gRole.name.toLowerCase() === r.roleName.toLowerCase());
      if (foundRole) {
        roleMention = `<@&${foundRole.id}>`;
      }
    }

    bodyLines += `${r.emoji} for ${roleMention} - ${r.description}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(bodyLines.trim())
    .setColor(data.color);

  const image = customImage || data.bannerUrl;
  if (image && typeof image === 'string' && image.startsWith('http')) {
    embed.setImage(image);
  }

  const row = new ActionRowBuilder();
  const styles = [
    ButtonStyle.Success,
    ButtonStyle.Primary,
    ButtonStyle.Success,
    ButtonStyle.Primary
  ];

  data.roles.forEach((r, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(r.customId)
        .setLabel(r.label)
        .setEmoji(r.emoji)
        .setStyle(styles[index % styles.length])
    );
  });

  return { embed, components: [row] };
}

/**
 * Builds the Community Rules Embed
 */
function createRulesEmbed(customImage) {
  const data = config.embeds.rules;

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(data.description)
    .setColor(data.color)
    .setFooter({ text: data.footer })
    .setTimestamp();

  data.fields.forEach(field => {
    embed.addFields({ name: field.name, value: field.value, inline: field.inline });
  });

  const image = customImage || data.bannerUrl;
  if (image && typeof image === 'string' && image.startsWith('http')) {
    embed.setImage(image);
  }

  return { embed, components: [] };
}

/**
 * Builds the Welcome Guide Embed
 */
function createWelcomeEmbed(customImage) {
  const data = config.embeds.welcome;

  let fullDescription = `${data.description}\n\n`;

  data.fields.forEach(field => {
    fullDescription += `**${field.name}**\n${field.value}\n\n`;
  });

  if (data.proTip) {
    fullDescription += `${data.proTip}`;
  }

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(fullDescription.trim())
    .setColor(data.color)
    .setFooter({ text: data.footer })
    .setTimestamp();

  const image = customImage || data.bannerUrl;
  if (image && typeof image === 'string' && image.startsWith('http')) {
    embed.setImage(image);
  }

  return { embed, components: [] };
}

/**
 * Builds the Get Started Embed with Link Button
 */
function createGetStartedEmbed(customImage) {
  const data = config.embeds.getStarted;

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(data.description)
    .setColor(data.color)
    .setFooter({ text: data.footer })
    .setTimestamp();

  data.fields.forEach(field => {
    embed.addFields({ name: field.name, value: field.value, inline: field.inline });
  });

  const image = customImage || data.bannerUrl;
  if (image && typeof image === 'string' && image.startsWith('http')) {
    embed.setImage(image);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(data.buttonLabel || 'Connect Binance on Dashboard')
      .setStyle(ButtonStyle.Link)
      .setURL(data.websiteUrl || 'https://pixel-alpha.com/dashboard/exchanges/connect')
      .setEmoji('🚀'),
    new ButtonBuilder()
      .setLabel('Read Binance Documentation')
      .setStyle(ButtonStyle.Link)
      .setURL(data.docsUrl || 'https://pixel-alpha.com/docs/binance')
      .setEmoji('📖')
  );

  return { embed, components: [row] };
}

/**
 * Builds the FAQ Embed with Link Button
 */
function createFaqEmbed(customImage) {
  const data = config.embeds.faq;

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(data.description)
    .setColor(data.color)
    .setFooter({ text: data.footer })
    .setTimestamp();

  data.fields.forEach(field => {
    embed.addFields({ name: field.name, value: field.value, inline: field.inline });
  });

  const image = customImage || data.bannerUrl;
  if (image && typeof image === 'string' && image.startsWith('http')) {
    embed.setImage(image);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(data.buttonLabel || 'Read Full FAQ on Website')
      .setStyle(ButtonStyle.Link)
      .setURL(data.websiteUrl || 'https://pixel-alpha.com/faq')
      .setEmoji('📖')
  );

  return { embed, components: [row] };
}

/**
 * Builds the Binance Connection Guide Embeds (7 sequential embeds with screenshots)
 */
function createBinanceGuideEmbeds() {
  const COLOR = '#F5B81C';
  const FOOTER = 'Pixel Alpha — Automated Trading Intelligence';

  // Step screenshot CDN URLs
  const STEP_IMAGES = {
    step1: 'https://cdn.discordapp.com/attachments/1545151302579785798/1550394389619155085/first.png?ex=6aae2ccb&is=6aacdb4b&hm=7e7b1ce0ad272478383fe6e0325b9d24eb19c13d71a9442c17ddb60c12cb1827&',
    step2: 'https://cdn.discordapp.com/attachments/1545151302579785798/1550394438302564463/newsecond.png?ex=6aae2cd7&is=6aacdb57&hm=56037b2854aef4064bda33260ab05d4619169ee66549b42c4089a934e2b886c8&',
    step3: 'https://cdn.discordapp.com/attachments/1545151302579785798/1550394460104298546/third.png?ex=6aae2cdc&is=6aacdb5c&hm=34c24b6b2e46220dfdf7cab0db5e9e312d4ad07fe78df4c719071a16e7e84c5e&',
    step4: 'https://cdn.discordapp.com/attachments/1545151302579785798/1550394483831611512/fourth.png?ex=6aae2ce1&is=6aacdb61&hm=58822124415637a00bda4963f633a84784494397cca9a82bacc4eb83d86c2c42&',
    step5: 'https://cdn.discordapp.com/attachments/1545151302579785798/1550394502374490193/fifth.png?ex=6aae2ce6&is=6aacdb66&hm=776bc934ec9cd90a4292f812d4be9cac5b9cb7f6741de26d3aa062d37cbf308f&'
  };

  // Embed 1: Overview + Before You Start
  const embed1 = new EmbedBuilder()
    .setTitle('How to Connect Your Binance Account')
    .setDescription(
      'Five steps on Binance\'s own screens: create an API key, give it trading permission only, allow-list our server, and move USDT into your futures wallet. It takes about ten minutes, and your funds never leave your account.\n\n' +
      '**Before you start**\n' +
      '• You need a verified Binance account that is allowed to trade futures in your country.\n' +
      '• You need at least **1,000 USDT** of deposited capital in your USD-M Futures wallet — below that, the bot will not open a position for you.\n' +
      '• The key you create gives us permission to place and close trades. It gives us no way to withdraw, transfer, or convert your funds.\n' +
      '• You can revoke the key on Binance at any moment, and our access ends the instant you do.\n\n' +
      '[Open Binance API Management ↗](https://www.binance.com/en/my/settings/api-management)'
    )
    .setColor(COLOR)
    .setFooter({ text: FOOTER });

  // Embed 2: Step 01
  const embed2 = new EmbedBuilder()
    .setTitle('Step 01 · Open Account → API Management')
    .setDescription(
      'Log in to [binance.com](https://www.binance.com). Open the profile menu in the top-right corner, choose **Account**, then open **API Management**.\n\n' +
      'This is the page where Binance creates keys that let an outside application — Pixel Alpha — trade on your behalf. Nothing you do here moves any funds.'
    )
    .setColor(COLOR)
    .setImage(STEP_IMAGES.step1)
    .setFooter({ text: 'Pixel Alpha — Step 1 of 5' });

  // Embed 3: Step 02
  const embed3 = new EmbedBuilder()
    .setTitle('Step 02 · Create a New API Key')
    .setDescription(
      'Click **Create API**. Give the key a label you will recognise later — *Pixel Alpha* is the obvious choice.\n\n' +
      'Binance will ask you to confirm with your usual security checks (email code, SMS, or authenticator) before it creates the key.'
    )
    .setColor(COLOR)
    .setImage(STEP_IMAGES.step2)
    .setFooter({ text: 'Pixel Alpha — Step 2 of 5' });

  // Embed 4: Step 03
  const embed4 = new EmbedBuilder()
    .setTitle('Step 03 · Choose HMAC as the Signature Type')
    .setDescription(
      'Binance offers several signature types. Select **HMAC** (the System generated option) and continue.\n\n' +
      'This is the signing method our engine uses. A key created as Ed25519 or RSA **cannot** be used with Pixel Alpha and there is no way to convert it afterwards — you would have to create a new key.'
    )
    .setColor(COLOR)
    .setImage(STEP_IMAGES.step3)
    .setFooter({ text: 'Pixel Alpha — Step 3 of 5' });

  // Embed 5: Step 04
  const embed5 = new EmbedBuilder()
    .setTitle('Step 04 · Set Permissions and Allow-list Our IP')
    .setDescription(
      'In the key\'s edit screen:\n' +
      '• Enable **Futures** — this is the only permission the bot needs.\n' +
      '• Leave **Enable Withdrawals** switched **OFF**. We never need it.\n' +
      '• Tick **Restrict access to trusted IPs only** (recommended), and add our server IP:\n\n' +
      '> **Pixel Alpha Server IP:** `2.24.139.176`\n\n' +
      'Save the key. Binance shows the secret **exactly once** — copy both the API key and secret now. If you lose the secret, you must create a new key.'
    )
    .setColor(COLOR)
    .setImage(STEP_IMAGES.step4)
    .setFooter({ text: 'Pixel Alpha — Step 4 of 5' });

  // Embed 6: Step 05
  const embed6 = new EmbedBuilder()
    .setTitle('Step 05 · Fund Your USD-M Futures Wallet')
    .setDescription(
      'The bot trades USD-M futures, so your capital must be in the **Futures wallet** — funds in the Spot wallet will not be seen.\n\n' +
      '1. Go to **Wallet → Spot → Transfer**.\n' +
      '2. Move USDT from **Spot Wallet** to **USDT-M Futures**. The transfer is internal and instant.\n\n' +
      '**Minimum:** Keep at least **1,000 USDT** in your USD-M Futures wallet. A drawdown does not switch your bot off — the check is on deposited capital, not current balance.'
    )
    .setColor(COLOR)
    .setImage(STEP_IMAGES.step5)
    .setFooter({ text: 'Pixel Alpha — Step 5 of 5' });

  // Embed 7: Troubleshooting + CTA
  const embed7 = new EmbedBuilder()
    .setTitle('Troubleshooting & Connection')
    .setColor(COLOR)
    .setFooter({ text: FOOTER })
    .addFields(
      {
        name: 'Account says connected, but no trades arrive',
        value: 'Almost always the IP allow-list. If the key is restricted to trusted IPs, our server address (`2.24.139.176`) must be on that list. Add it on Binance, then press **Recheck** on the account card in your dashboard.'
      },
      {
        name: 'Binance rejected the key immediately',
        value: 'Check the signature type. The key must be **HMAC** (system generated). Ed25519 and RSA keys cannot be used. Create a fresh HMAC key — an existing key\'s type cannot be changed.'
      },
      {
        name: 'I lost the secret key',
        value: 'Binance shows it only once, at creation. Delete the key on Binance and create a new one, then reconnect it in your dashboard.'
      },
      {
        name: 'Balance shows but nothing trades',
        value: 'Confirm the funds are in the **USD-M Futures wallet** rather than Spot, and that the deposited total is at or above **1,000 USDT**.'
      },
      {
        name: 'Ready to connect?',
        value: '[Connect your Binance account →](https://pixel-alpha.com/dashboard/exchanges/connect)\n*You can also connect a Binance testnet key first and watch the bot run on play money.*'
      }
    );

  return [embed1, embed2, embed3, embed4, embed5, embed6, embed7];
}

/**
 * Builds the Account Creation Guide Embeds (5 sequential embeds with screenshots)
 */
function createAccountGuideEmbeds() {
  const COLOR = '#F5B81C';
  const FOOTER = 'Pixel Alpha — Automated Trading Intelligence';

  const IMAGES = {
    step1: 'https://media.discordapp.net/attachments/1545151302579785798/1551240848065167370/image.png?ex=6ab1411e&is=6aafef9e&hm=4b6b9ac09f41d515421b458e9fe4ee188f1afca254c7f3843ab9a7f1ccc73160&=&format=webp&quality=lossless&width=640&height=328',
    step2: 'https://media.discordapp.net/attachments/1545151302579785798/1551240916151435265/image.png?ex=6ab1412f&is=6aafefaf&hm=1e11dc62b78771d2a652e7bd9f6a361f5cc959fe9b056947d7b6e2cf3231d808&=&format=webp&quality=lossless',
    step3: 'https://media.discordapp.net/attachments/1545151302579785798/1551240995281051699/image.png?ex=6ab14141&is=6aafefc1&hm=65d9ca54ddc25f09bbf7b7fe6420cc6b871379ee1cdd95e0f1a4b5a742f80b3d&=&format=webp&quality=lossless',
    step4: 'https://media.discordapp.net/attachments/1545151302579785798/1551241057621245982/image.png?ex=6ab14150&is=6aafefd0&hm=293ed0423eff346be9bc6400ca55ce3b99b16626f1f463b0cfdba83386f77f6e&=&format=webp&quality=lossless&width=640&height=321'
  };

  // Embed 1: Overview & Before You Start
  const embed1 = new EmbedBuilder()
    .setTitle('How to Create Your Pixel Alpha Account')
    .setColor(COLOR)
    .setDescription(
      'Pixel Alpha operates on a non-custodial model. You trade on your own exchange account, keep full custody of your capital, and pay only on net profits. Setting up your account takes less than two minutes.\n\n' +
      '**Before you start**\n' +
      '• **No payment details required**: No credit card, bank details, or upfront subscription needed.\n' +
      '• **Performance-based fee**: Free to connect and run. A 20% fee applies only to realized profits above your High-Water Mark ($0 on flat or losing periods).\n' +
      '• **Non-custodial**: Connected via trade-only API keys. We never have permission to withdraw, transfer, or hold funds.'
    )
    .setFooter({ text: FOOTER });

  // Embed 2: Step 01
  const embed2 = new EmbedBuilder()
    .setTitle('Step 01 · Go to Website & Click "Start free"')
    .setColor(COLOR)
    .setDescription(
      'Visit [pixel-alpha.com](https://pixel-alpha.com/). In the top right corner of the navigation bar, click the yellow **"Start free"** button (or click **"Sign in"**).'
    )
    .setImage(IMAGES.step1)
    .setFooter({ text: 'Pixel Alpha — Step 1 of 4' });

  // Embed 3: Step 02
  const embed3 = new EmbedBuilder()
    .setTitle('Step 02 · Fill in Details & Create Account')
    .setColor(COLOR)
    .setDescription(
      'On the authentication card:\n' +
      '• If the card shows "Sign In", click **Create one free** at the bottom.\n' +
      '• Enter your **Name** and a valid **Email Address**.\n' +
      '• Set a secure **Password** and confirm it.\n' +
      '• Check the box to accept the **Terms & Conditions**, **Privacy Policy**, and **Risk Disclaimer**.\n' +
      '• Click **Create free account**.'
    )
    .setImage(IMAGES.step2)
    .setFooter({ text: 'Pixel Alpha — Step 2 of 4' });

  // Embed 4: Step 03
  const embed4 = new EmbedBuilder()
    .setTitle('Step 03 · Arrive at Your Trading Dashboard')
    .setColor(COLOR)
    .setDescription(
      'Once registered, you are instantly authenticated and redirected to your personal dashboard at [pixel-alpha.com/dashboard](https://pixel-alpha.com/dashboard).\n\n' +
      'Click the yellow **"+ Connect an exchange"** button in the center of the screen (or the button in the top alert banner).'
    )
    .setImage(IMAGES.step3)
    .setFooter({ text: 'Pixel Alpha — Step 3 of 4' });

  // Embed 5: Step 04
  const embed5 = new EmbedBuilder()
    .setTitle('Step 04 · Select Exchange & Connect API')
    .setColor(COLOR)
    .setDescription(
      'On the **"Connect an exchange"** wizard:\n' +
      '• Select **Binance** (or **MEXC**).\n' +
      '• Click **Continue** to proceed to the API keys step.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━\n\n' +
      '👉 **Next Step:** Follow our companion guide in this channel: ' +
      '**"How to connect your Binance account"** for the 5-step API key setup and IP allow-list instructions!\n\n' +
      'Need assistance? Open a ticket in <#1545070643744215212> or contact **support@pixel-alpha.com**.'
    )
    .setImage(IMAGES.step4)
    .setFooter({ text: 'Pixel Alpha — Step 4 of 4' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Create Free Account')
      .setStyle(ButtonStyle.Link)
      .setURL('https://pixel-alpha.com/auth')
      .setEmoji('🚀'),
    new ButtonBuilder()
      .setLabel('Go to Dashboard')
      .setStyle(ButtonStyle.Link)
      .setURL('https://pixel-alpha.com/dashboard')
      .setEmoji('📊')
  );

  return {
    embeds: [embed1, embed2, embed3, embed4, embed5],
    components: [row]
  };
}

module.exports = {
  createOfficialLinksEmbed,
  createRolesEmbed,
  createRulesEmbed,
  createWelcomeEmbed,
  createGetStartedEmbed,
  createFaqEmbed,
  createBinanceGuideEmbeds,
  createAccountGuideEmbeds
};

