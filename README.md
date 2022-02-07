# Powercord ppl.moe
![clones](https://img.shields.io/endpoint?url=https%3A%2F%2Fstatthegit.penguinspy.repl.co%2Fsheilds%2Fpowercord-ppl-moe) [![Powercord](https://img.shields.io/badge/client-Powercord-7289D9?logo=discord&logoColor=fff)](https://powercord.dev/)  
This is a powercord plugin that displays a user's ppl.moe profile as a new tab in the user's modal.  
It also shows their pronouns next to their name in messages (similar to & compatible with the PronounDB plugin).  
 
# Features
- A new tab in the user modal that displays a user's ppl.moe profile (if they have one)
- Optional tab icon (instead of text) for theme consistency
- ~~A new connection that links to the profile on the [ppl.moe website](https://ppl.moe/)~~ (Powercord feature for this is broken currently)
- Displays a user's pronouns in the message header, just like the [PronounDB plugin](https://github.com/cyyynthia/pronoundb-powercord)
- Automatically hides PronounDB's pronouns if there are ppl.moe ones to show (optional)
- Shows a cute little badge next to a user's name in chat messages if they have a profile

# Known Issues
- On client open/reload, the very first user modal opened will not display the tab. However, this fixes itself as soon as you close & reopen any user modal.

# Installation
Open command prompt and run:  
```cd powercord/src/Powercord/plugins && git clone https://github.com/Penguin-Spy/powercord-ppl-moe```  
Or see [this message](https://discord.com/channels/538759280057122817/755005584322854972/847521255116898394 "#plugin-links") in the Powercord server if you have [Powercord Downloader](https://github.com/LandenStephenss/PowercordPluginDownloader).  
Only Powercord is supported at this time. I may write a version for [Aliucord](https://github.com/Aliucord/Aliucord "A Discord mod for Android") at some point.

# License
MIT License, Copyright Penguin_Spy 2021  
this repository uses modified snippets of code from https://github.com/cyyynthia/pronoundb-powercord, https://github.com/Juby210/user-details, and https://github.com/Ser-Ames/discord-bio

This plugin is not mantained, endorsed by or in any way affiliated with ppl.moe or amy#0001!  
