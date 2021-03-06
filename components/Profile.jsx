const { React, i18n: { Messages } } = require('powercord/webpack')

function HeaderBlock(props) {
  const { tagline, badges, classes } = props
  let badgesString = ""
  if (badges.includes("admin")) badgesString += " ⭐"
  if (badges.includes("bug_hunter")) badgesString += " 🐛"
  if (badges.includes("indev")) badgesString += " ⚒️"

  return (
    <div className={classes.pplMoeSectionHeader}>
      <span>{tagline}</span>
      <div className={classes.pplMoeBadges}>{badgesString}</div>
    </div>
  )
}

function InfoBlock(props) {
  const { info, keyName: key, classes } = props
  if (info[key] != "") { // If this field isn't empty
    let text

    switch (key) {
      case 'website': // If it's the website, make it a link to the text
        text = (
          <a className={classes.pplMoeLink} href={info[key]} target="_blank">
            {info[key]}
          </a>
        )
        break
      case 'birthday':
        let birthday = info[key].split("-")
        text = Messages[`PPL_MOE_MONTH_${birthday[0]}`] + " " + birthday[1]
        break
      default:
        text = info[key]
    }

    return (
      <div>
        <h1 className={classes.userInfoSectionHeader}>
          {Messages[`PPL_MOE_${key.toUpperCase()}`]}
        </h1>
        <span>
          {text}
        </span>
      </div>
    )
  }
  return null // if this field is empty, specifically return null (otherwise react crashes)
}

function AboutBlock(props) {
  const { bioMarkdown, name, classes } = props
  if (bioMarkdown != "") { // If a bio has been written
    const bioHTML = bioMarkdown
      .replace(/"/gim, "&quot;")  // Sanitize HTML stuff (so you can't put XSS in your bio :P
      .replace(/'/gim, "&apos;")
      .replace(/</gim, "&lt;")
      .replace(/>/gim, "&gt;")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")  // Format markdown (incomplete, does not include: tables, using underscores, strikethrough, seperators, code & codeblocks, lists, & more!)
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
      .replace(/\*(.*?)\*/gim, "<i>$1</i>")
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' class='ppl-moe-link'>$1</a>")
      .replace(/  $/gim, "<br>")  // double space at end of lines is line break
      .replace(/\\\n/gim, "<br>") // "\⤶" is line break
      .replace(/\r\n\r\n/gim, "<br><br>") // double carridge return-line feed is paragraph break
      .replace(/(^|[^\n])\n{2}(?!\n)/g, "$1<br><br>") // double newline, no spaces is paragraph break, RegEx magic: https://stackoverflow.com/questions/18011260/regex-to-match-single-new-line-regex-to-match-double-new-line#answer-18012521

    return (
      <div className={classes.pplMoeSectionBio}>
        <h1 className={classes.userInfoSectionHeader}>
          {Messages.PPL_MOE_ABOUT.intMessage.format({ name: name })}
        </h1>
        <span className={classes.userInfoText}
          dangerouslySetInnerHTML={{ __html: bioHTML }}>
        </span>
      </div>
    )
  }
  return null
}

module.exports = class Profile extends React.Component {
  render() {
    const { classes, profile } = this.props
    return (
      <div className={classes.infoScroller} dir="ltr" style={{ 'overflow': "hidden scroll", 'padding-right': "12px" }}>
        <HeaderBlock tagline={profile.tagline} badges={profile.badges} classes={classes} />
        <div className={classes.pplMoeSectionInfo}>
          <InfoBlock info={profile.info} keyName='gender' classes={classes} />
          <InfoBlock info={profile.info} keyName='pronouns' classes={classes} />
          <InfoBlock info={profile.info} keyName='location' classes={classes} />
          <InfoBlock info={profile.info} keyName='language' classes={classes} />
          <InfoBlock info={profile.info} keyName='website' classes={classes} />
          <InfoBlock info={profile.info} keyName='birthday' classes={classes} />
        </div>
        <AboutBlock bioMarkdown={profile.bio} name={profile.name} classes={classes} />
      </div>
    )
  }
}