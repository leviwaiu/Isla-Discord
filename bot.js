var Discord = require('discord.js');
var logger  = require('winston');
var auth    = require('./auth.json');

var Twitter = require('twitter');
var YouTube = require('youtube-node');
var Pixiv   = require('pixiv-app-api');

var moment  = require('moment-timezone');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {colorize:true});
logger.level = 'debug';

//Initialising all the API Connections
var discordBot = new Discord.Client();

var twitterClient = new Twitter({
    consumer_key: auth.twitter.consumer_key,
    consumer_secret: auth.twitter.consumer_secret,
    access_token_key: auth.twitter.access_token_key,
    access_token_secret: auth.twitter.access_token_secret
});
var youtubeClient = new YouTube();
youtubeClient.setKey(auth.youtube.key);

var pixivClient = new Pixiv(auth.pixiv.name, auth.pixiv.pass);

var cannedErrorMessage = "Boop... I have broken. Please Contact ISellRamen#0234 for bugfixing.. (ﾉД`)";


discordBot.on('ready', () => {
    logger.info('Bot is ready.');
    logger.info('Logged in as:' + discordBot.user.username + '-(' + discordBot.user.id + ')'); 
});

discordBot.on('message', message => {
    if(message.content.substring(0,1) === "!") {
        
        var args = message.content.substring(1).split(' ');
        var command = args[0];
        
        args.shift();

        switch(command){
            case 'debug':
                logger.info(message.content.substring(1));
                message.channel.send(args.filter(word => !word.startsWith("--")));
            break;
            
            case 'die':
                message.channel.send("(◜०﹏०◝) Y u do dis");
            break;
            
            case 'hello':
                message.channel.send("Hello! It's nice to meet you, " + message.author + " ! (^-^)/");
            break;
            
            case 'help':
                message.channel.send("Hello, this is Isla! Here are a list of commands I am currently able to use:  \n hello \n help \n pixiv\n roll \n twitter \n youtube\n Not all of the commands are listed here; some are in development, some are hidden easter eggs");
            break;
            
            case 'pixiv':
                name_search = args.filter(word => !word.startsWith("--")).join(' ');
                //Pixiv API is promise based
                message.channel.send("Looking up... pixiv's API is quite slow so please be patient");
                var json;
                ;(async () => {
                    json = await
                    pixivClient.searchUser(name_search);
                    if(json.userPreviews.length > 0){
                        subargs = args.filter(word => word.startsWith("--"));
                        logger.info(subargs);
                        switch(subargs[0]){
                        
                            case '--latest':
                                latestWork = json.userPreviews[0].illusts;
                                if(latestWork.length > 0){
                                    latestWork_url = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + json.userPreviews[0].illusts[0].id;
                                    message.channel.send(latestWork_url);
                                } else {
                                    message.channel.send("I can't seem to find a latest work to post.. sorry...");
                                }
                            break;
                            
                            default:
                                user_id = json.userPreviews[0].user.id;
                                url = "(^▽^)o Here is your profile: \n https://www.pixiv.net/member.php?id=" + user_id;
                                message.channel.send(url);
                            break;
                        }
                    } else {
                        message.channel.send("I can't find the user, sorry... (◜०﹏०◝)");
                    }
                })()
                break;
            
            case 'reminder':
                if(args.length > 0){
                }
            break;    
            
            case 'roll':
                var numbers = 10;
                if(args.length > 0){
                    if(args[0] < Number.MAX_VALUE){
                        numbers = args[0];
                    } else {
                        numbers = -1;
                    }
                }
                
                if(numbers > 0){
                    randomNumber = Math.floor(Math.random() * Math.floor(numbers));
                    message.channel.send("You rolled a " + randomNumber.toString(10) + "!");
                } else {
                    message.channel.send("What is with that invalid number, baka! ( ꒪Д꒪)ノ");
                }
            break;
            
            case 'time':
                var current_time = new Date();
                var loc = "Hong Kong";
                var displayString = moment.tz(current_time, "Asia/Hong_Kong").format("HH:mm:ss");
                if(args.length > 0){
                    switch(args.join(' ').toLowerCase()){
                        case 'hk':
                        case 'hong kong':
                        break;
                        case 'macau':
                        case 'macao':
                            displayString = moment.tz(current_time, "Asia/Macau").format("HH:mm:ss");
                            loc = "Macau";
                        break;
                        case 'london':
                        case 'edinburgh':
                        case 'uk':
                            displayString = moment.tz(current_time, "Europe/London").format("HH:mm:ss");
                            loc = "United Kingdom";
                        break;
                        case 'new york':
                        case 'boston':
                        case 'washington dc':
                        case 'dc':
                            displayString = moment.tz(current_time, "America/New_York").format("HH:mm:ss");
                            loc = "US East Coast";
                        break;
                        
                        case 'los angeles':
                        case 'san francisco':
                        case 'berkeley':
                            displayString = moment.tz(current_time, "America/Los_Angeles").format("HH:mm:ss");
                            loc = "US West Coast";
                        break;
                        
                        case 'tokyo':
                        case 'osaka':
                        case 'japan':
                            displayString = moment.tz(current_time, "Asia/Tokyo").format("HH:mm:ss");
                            loc = "Japan";
                        break;
                    }
                }
                message.channel.send("The current time in " + loc + " is " + displayString);
            break;
            
            case 'twitter':
                handle = args[0];
                twitterClient.get('users/show', {screen_name : handle}, function(error, tweet, response) {
                    if(error) {
                        if(error[0].code === 50){
                            message.channel.send("I can't find the user, sorry... (◜०﹏०◝)");
                        } else {
                            logger.info(error);
                            message.channel.send(cannedErrorMessage);
                        }
                    } else {
                        message.channel.send("(^▽^)o Here you go: https://twitter.com/" + tweet.screen_name);
                    }
                });
            break;
            
            case 'youtube':
                search = args.join(" ");
                youtubeClient.search(search, 1, function(error, result) {
                    if(error){
                        logger.info(error);
                        message.channel.send(cannedErrorMessage);
                    } else {
                        logger.info(result);
                        
                        if(result.items[0].id.kind === "youtube#video"){
                            message.channel.send("(^▽^)o Here's the top result: \n https://youtube.com/watch?v=" + result.items[0].id.videoId);
                            
                        } else if(result.items[0].id.kind === "youtube#channel") {
                            message.channel.send("It seems like the top result is a channel! Here you go: \n https://youtube.com/channel/" + result.items[0].id.channelId);
                            
                        } else if(result.items[0].id.kind === "youtube#playlist") {
                            message.channel.send("It seems like the top result is a playlist! Here you go: \n https://youtube.com/playlist?list=" + result.items[0].id.playlistId);
                            
                        } else {
                            message.channel.send("The thing I got is neither a video, channel nor playlist. I don't know what it is...");
                        }
                    }
                });
            break;
        }
    }
});

//Allow the bot to log in
discordBot.login(auth.discord.token);
