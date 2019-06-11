var Discord = require('discord.io');
var logger  = require('winston');
var auth    = require('./auth.json');

var Twitter = require('twitter');
var YouTube = require('youtube-node');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true});
logger.level = 'debug';

//Initialising different API connectons
var bot = new Discord.Client({
    token: auth.discord.token,
    autorun : true });

var twitterClient = new Twitter({
    consumer_key: auth.twitter.consumer_key,
    consumer_secret: auth.twitter.consumer_secret,
    access_token_key: auth.twitter.access_token_key,
    access_token_secret: auth.twitter.access_token_secret
});

var youtubeClient = new YouTube();
youtubeClient.setKey(auth.youtube.key);

//Log for logging in into discord.
bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Login as:' + bot.username + '-(' + bot.id + ')');
});

//Bot responds to messages sent to her, uses a switch to determine what to respond
bot.on('message', function(user, userID, channelID, message, evt) {
    if(message.substring(0,1) == "!") {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        
    
        args = args.splice(1);
        switch(cmd){
            
            case 'die':
                bot.sendMessage({
                    to:channelID,
                    message:"(◜०﹏०◝) Y u do dis"
                });
            break;
            
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: "Here are the list of currently usable commands \n hello \n help \n roll \n twitter \n youtube"
                });
                break;
            
            case 'hello':
                bot.sendMessage({
                    to: channelID,
                    message: "Hello! It's nice to see you! (^-^)/"
                });
            break;
            
            case 'twitter':
                handle = args[0];
                twitterClient.get('users/show', {screen_name : handle}, function(error, tweet, response) {
                    if(error) {
                        if(error[0].code === 50){
                            bot.sendMessage({
                                to: channelID,
                                message: "I can't find the user, sorry... (◜०﹏०◝)"                               
                            });
                        } else {
                        logger.info(error);
                        throw error;
                        };
                    } else {
                    user_url = "(^▽^)o Here you go: https://twitter.com/" + tweet.screen_name;
                    bot.sendMessage({
                        to: channelID,
                        message: user_url
                    });
                    }
                });
            break;
            
            case 'roll':
                numbers = 10;
                if(args.length > 0){
                    if(args[0] < Number.MAX_VALUE){
                        numbers = args[0];
                    } else {
                        numbers = -1;
                    }
                }
                
                if(numbers > 0){
                    randomNumber = Math.floor(Math.random() * Math.floor(numbers));
                    resultString = "You rolled a " + randomNumber.toString(10) + "!";
                    bot.sendMessage({
                        to: channelID,
                        message: resultString
                    });
                } else {
                    bot.sendMessage({
                        to: channelID,
                        message: "What is with that invalid number, baka! ( ꒪Д꒪)ノ"
                    });
                }
            break;
                
            case 'youtube':
                search = args.join(" ");
                youtubeClient.search(search, 1, function(error, result) {
                    if(error) {
                        logger.info(error);
                    }
                    else {
                        logger.info(result);
                        if(result.items[0].id.kind === "youtube#video"){
                            result_url = "(^▽^)o Here's the top result: \n https://youtube.com/watch?v=" + result.items[0].id.videoId;
                            bot.sendMessage({
                                to: channelID,
                                message: result_url
                            });
                        } else if(result.items[0].id.kind === "youtube#channel") {
                            result_url = "It seems like the top result is a channel! Here you go: \n https://youtube.com/channel/" + result.items[0].id.channelId;
                            bot.sendMessage({
                                to: channelID,
                                message: result_url
                            });
                        } else if(result.items[0].id.kind === "youtube#playlist") {
                            result_url = "It seems like the top result is a playlist! Here you go: \n https://youtube.com/playlist?list=" + result.items[0].id.playlistId;
                            bot.sendMessage({
                                to: channelID,
                                message: result_url
                            });
                        }
                    }
                });
            break;
            
            default:
                bot.sendMessage({
                    to: channelID,
                    message: "Sorry, I am still a work in progress and do not support that command yet (´·ω·`)"
                });
        }
    }
});
