import tmi from 'tmi.js';
import {
  BOT_USERNAME,
  OAUTH_TOKEN,
  CHANNEL_NAME,
  BLOCKED_WORDS,
  DADJOKE_URL,
} from './constants';
import fetch from 'node-fetch';

const options = {
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN,
  },
  channels: [CHANNEL_NAME],
};

const client = new tmi.Client(options);
client.connect().catch(console.error);

// events
client.on('disconnected', (reason) => {
  onDisconnectedHandler(reason);
});

client.on('connected', (address, port) => {
  onConnectedHandler(address, port);
});

client.on('hosted', (channel, username, viewers, autohost) => {
  onHostedHandler(channel, username, viewers, autohost);
});

client.on('subscription', (channel, username, method, message, userstate) => {
  onSubscriptionHandler(channel, username, method, message, userstate);
});

client.on('raided', (channel, username, viewers) => {
  onRaidedHandler(channel, username, viewers);
});

client.on('cheer', (channel, userstate, message) => {
  onCheerHandler(channel, userstate, message);
});

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
  onGiftPaidUpgradeHandler(channel, username, sender, userstate);
});

client.on('hosting', (channel, target, viewers) => {
  onHostingHandler(channel, target, viewers);
});

client.on('reconnect', () => {
  reconnectHandler();
});

client.on('resub', (channel, username, months, message, userstate, methods) => {
  resubHandler(channel, username, months, message, userstate, methods);
});

client.on(
  'subgift',
  (channel, username, streakMonths, recipient, methods, userstate) => {
    subGiftHandler(
      channel,
      username,
      streakMonths,
      recipient,
      methods,
      userstate
    );
  }
);

// event handlers

client.on('message', (channel, userstate, message, self) => {
  if (self) {
    return;
  }

  if (userstate.username === BOT_USERNAME) {
    console.log(`Not checking bot's messages.`);
    return;
  }

  if (message.toLowerCase() === '!hello') {
    hello(channel, userstate);
    return;
  }

  if (message.toLowerCase() === '!discord') {
    discord(channel, userstate);
    return;
  }

  if (message.toLowerCase() === '!disc') {
    discord(channel, userstate);
    return;
  }

  // IF YOU COMMENTED OUT THE OTHER DADJOKE FUNCTIONS / VARIABLES, COMMENT THIS OUT TOO
  if (message.toLowerCase() === '!dadjoke') {
    noSpamDadJoke(channel, userstate);
    return;
  }

  if (message.toLowerCase() === '!news') {
    news(channel, userstate);
    return;
  }

  // specific to WildSideC, feel free to comment or remove
  if (message.toLowerCase() === '!onemore') {
    oneMore(channel, userstate);
    return;
  }

  onMessageHandler(channel, userstate, message, self);
});

function onMessageHandler(channel, userstate, message, self) {
  checkTwitchChat(userstate, message, channel);
}

function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
}

function onConnectedHandler(address, port) {
  console.log(`Connected: ${address}:${port}`);
}

function onHostedHandler(channel, username, viewers, autohost) {
  client.say(channel, `Thank you @${username} for the host of ${viewers}!`);
}

function onRaidedHandler(channel, username, viewers) {
  client.say(channel, `Thank you @${username} for the raid of ${viewers}!`);
}

function onSubscriptionHandler(channel, username, method, message, userstate) {
  client.say(channel, `Thank you @${username} for subscribing!`);
}

function onCheerHandler(channel, userstate, message) {
  client.say(
    channel,
    `Thank you @${userstate.username} for the ${userstate.bits} bits!`
  );
}

function onGiftPaidUpgradeHandler(channel, username, sender, userstate) {
  client.say(channel, `Thank you @${username} for continuing your gifted sub!`);
}

function onHostingHandler(channel, target, viewers) {
  client.say(channel, `We are now hosting ${target} with ${viewers} viewers!`);
}

function reconnectHandler() {
  console.log('Reconnecting...');
}

function resubHandler(channel, username, months, message, userstate, methods) {
  const cumulativeMonths = userstate['msg-param-cumulative-months'];
  client.say(
    channel,
    `Thank you @${username} for the ${cumulativeMonths} sub!`
  );
}

function subGiftHandler(
  channel,
  username,
  streakMonths,
  recipient,
  methods,
  userstate
) {
  client.say(
    channel,
    `Thank you @${username} for gifting a sub to ${recipient}}.`
  );

  // this comes back as a boolean from twitch, disabling for now
  // "msg-param-sender-count": false
  // const senderCount =  ~~userstate["msg-param-sender-count"];
  // client.say(channel,
  //   `${username} has gifted ${senderCount} subs!`
  // )
}

// commands

function hello(channel, userstate) {
  client.say(channel, `@${userstate.username}, Heyo! HeyGuys`); // Can change to whatever greeting you like
}

function oneMore(channel, userstate) {
  client.say(channel, `Kappa Kappa Kappa`); // can comment this out, is specific to WildSideC
}

function news(channel, userstate) {
  client.say(
    channel,
    `@${userstate.username}, A channel re-vamp is coming soon. More details will be available soon.` // can change this to be whatever news you may have to share
  );
}

function discord(channel, userstate) {
  client.say(
    channel,
    `@${userstate.username}, The discord invite link is: YOUR DISCORD LINK HERE` // Put your discord here
  );
}

function checkTwitchChat(userstate, message, channel) {
  console.log(message);
  message = message.toLowerCase();
  let shouldSendMessage = false;
  shouldSendMessage = BLOCKED_WORDS.some((blockedWord) =>
    message.includes(blockedWord.toLowerCase())
  );
  if (shouldSendMessage) {
    // tell user
    client.say(
      channel,
      `@${userstate.username}, Sorry! Your message was deleted.`
    );
    // delete message
    client.deletemessage(channel, userstate.id);
  }
}

// IF YOU COMMENTED OUT THE DADJOKE CONST IN THE CONSTANTS FILE, COMMENT THE BELOW CODE OUT AS WELL.

async function dadJoke(channel, userstate) {
  const objReq = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  let response = await fetch(DADJOKE_URL, objReq);
  let result = await response.json();

  client.say(channel, `@${userstate.username}, ${result.joke}`);
}

let timerId;
function noSpamDadJoke(channel, userstate) {
  if (!(timerId === null)) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    dadJoke(channel, userstate);
  }, 400);
}
