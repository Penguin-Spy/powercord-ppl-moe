# YES ITS BROKEN RN
i don't know what i'm doing and discord 🦆ed up my code when they updated the User Modals. i'm trying to fix it, see the thonk branch for my attempt

# Powercord ppl.moe
![Clone count badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fstatthegit.penguinspy.repl.co%2Fsheilds%2Fpowercord-ppl-moe)

This is a powercord plugin that displays a user's ppl.moe profile as a new tab in the user's modal.  
It also shows their pronouns next to their name in messages (similar to & compatible with the PronounDB plugin).  

# Features
- A new tab in the user modal that displays their ppl.moe profile
- Does not show the tab for users that do not have a ppl.moe profile
- Tab icons (instead of text) for the Comfy theme!
- A new connection that links to their profile on the [ppl.moe website](https://ppl.moe/)
- Displays a user's pronouns in the message header, just like the [PronounDB plugin](https://github.com/cyyynthia/pronoundb-powercord)
- Automatically hides PronounDB's pronouns if there are ppl.moe ones to show
- Settings for the above two features

# Planned features (and notes i guess)
- [x] Use the cache for all profile info (in connections), to reduce redundant API calls (semi-successful, may revisit)
- [ ] Display the user's tagline
- [ ] Display the user's badges (Admin, Indev tester, Bug reporter)
- [ ] i forgot to format the birthday date string lol
- [ ] fix website overrunning space for it (does this happen with others/don't do when there's no next block of info)
- [ ] Full markdown formatting (tables, using underscores, strikethrough, seperators, code & codeblocks, lists, and more!)
- [ ] Change layout of modal a bit (move connections to their own tab, put notes outside of a tab, have our tab be 1st, obviously settings for this)?
- [ ] Display the user's latest post? idk but if people want it i'll add it
- [ ] Hide about/tagline if it's unset/the default string

# License
MIT License, Copyright Penguin_Spy 2021  
this reposotory uses modified snippets of code from https://github.com/cyyynthia/pronoundb-powercord and https://github.com/Ser-Ames/discord-bio

This plugin is not mantained, endorsed by or in any way affiliated with ppl.moe or amy#0001!  
