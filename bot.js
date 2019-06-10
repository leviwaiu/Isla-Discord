var Discord = require('discord.io');
var logger  = require('winston');
var auth    = require('./auth.json');

var Twitter = require('twitter');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true});
logger.level = 'debug';

var bot = new Discord.Client({
    token: auth.discord.token,
    autorun : true });

var twitterClient = new Twitter({
    consumer_key: auth.twitter.consumer_key,
    consumer_secret: auth.twitter.consumer_secret,
    access_token_key: auth.twitter.access_token_key,
    access_token_secret: auth.twitter.access_token_secret
});

bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Login as:' + bot.username + '-(' + bot.id + ')');
});

bot.on('message', function(user, userID, channelID, message, evt) {
    if(message.substring(0,1) == "!") {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        
    
        args = args.splice(1);
        switch(cmd){
            
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: "Here are the list of currently usable commands \n hello \n help"
                });
                break;
            
            case 'hello':
                bot.sendMessage({
                    to: channelID,
                    message: "Hello! It's nice to see you!"
                });
            break;
            
            case 'twitter':
                handle = args;
                twitterClient.get('users/show', {screen_name : handle[0]}, function(error, tweet, response) {
                    if(error) {
                        if(error[0].code === 50){
                            bot.sendMessage({
                                to: channelID,
                                message: error[0].message                                
                            });
                        } else {
                        logger.info(error);
                        throw error;
                        };
                    } else {
                    user_url = "https://twitter.com/" + tweet.screen_name;
                    bot.sendMessage({
                        to: channelID,
                        message: user_url
                    });
                    }
                });
            break;
            
            default:
                bot.sendMessage({
                    to: channelID,
                    message: "Sorry, I am still a work in progress and do not support that command yet"
                });
        }
    }
});
