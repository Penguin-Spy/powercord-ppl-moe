> Note: This plugin was originally written for [Powercord](https://powercord.dev/). I now develop it for use with [Topaz](https://topaz.goosemod.com/), and it probably works on [Replugged](https://replugged.dev/) too.

# Powercord ppl.moe
![clones](https://img.shields.io/endpoint?url=https://githubstats.penguinspy.repl.co/shields/powercord-ppl-moe) [![Powercord](https://img.shields.io/badge/client-Powercord-7289da?logo=discord&logoColor=fff)](https://powercord.dev/) [![Topaz](https://img.shields.io/badge/client-Topaz-fdda0d?logo=discord&logoColor=fff)](https://topaz.goosemod.com/)  [![Replugged](https://img.shields.io/badge/client-Replugged-7289da?logo=discord&logoColor=fff)](https://replugged.dev/)  
This is a powercord plugin that displays a user's [ppl.moe](https://ppl.moe/) profile as a new tab in the user's modal.  
It also shows their pronouns next to their name in messages (similar to & compatible with the [PronounDB](https://pronoundb.org/) plugin).  
 
# Features
- A new tab in the user modal that displays a user's ppl.moe profile (if they have one)
- Optional tab icon (instead of text) for theme consistency
- ~~A new connection that links to the profile on the ppl.moe website~~ (Powercord feature for this is broken currently)
- Displays a user's pronouns in the message header, just like the [PronounDB plugin](https://github.com/cyyynthia/pronoundb-powercord)
- Automatically hides PronounDB's pronouns if there are ppl.moe ones to show (optional)
- Shows a cute little badge next to a user's name in chat messages if they have a profile

# Known Issues
- On client open/reload, the very first user modal opened will not display the tab. However, this fixes itself as soon as you close & reopen any user modal.

# Installation
## Topaz
Open the Topaz settings and copy+paste this URL into the "Add Plugin" box: https://github.com/Penguin-Spy/powercord-ppl-moe

## Replugged/Powercord
> If you are migrating from Powercord and already have the plugin installed, you don't need to reinstall.  

Open command prompt and run:  
```cd replugged/src/Powercord/plugins && git clone https://github.com/Penguin-Spy/powercord-ppl-moe```  

## Other client mods
I may write a version for [Aliucord](https://github.com/Aliucord/Aliucord "A Discord mod for Android") at some point.  
This plugin will never support BetterDiscord/BandagedDiscord or whatever people are calling it this week. (it's the Minecraft Forge of Discord mods)

# License
Licensed under GNU General Public License v3.0 or later. Copyright (c) 2021-2022 Penguin_Spy   
this repository uses modified snippets of code from https://github.com/cyyynthia/pronoundb-powercord, https://github.com/Juby210/user-details, and https://github.com/Ser-Ames/discord-bio

This plugin is not mantained, endorsed by or in any way affiliated with ppl.moe or amy!  
