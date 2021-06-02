const { React, i18n: { Messages } } = require('powercord/webpack')

class InfoBlock extends React.PureComponent {
  render() {
    const { info, keyName: key, classes } = this.props;
    if (info[key] != "") { // If this field isn't empty
      let text

      if (key == 'website') {  // If it's the website, make it a link to the text
        text = (
          <a className={classes.pplMoeLink} href={info[key]} target="_blank">
            {info[key]}
          </a>
        )
      } else {
        text = info[key]
      }

      return (
        <div>
          <div className={classes.userInfoSectionHeader}>
            {Messages[`PPL_MOE_${key.toUpperCase()}`]}
          </div>
          <div className={classes.userInfoSectionText}>
            {text}
          </div>
        </div>
      )
    }
    return null // if this field is empty, specifically return null (otherwise react crashes)
  }
}

function AboutBlock(props) {
  const { bioMarkdown, name, classes } = props
  if (bioMarkdown != "") { // If a bio has been written
    const bioHTML = bioMarkdown
      .replace(/"/gim, "&quot;")  // Sanitize HTML stuff (so you can't put XSS in your bio :P
      .replace(/'/gim, "&apos;")
      .replace(/</gim, "&lt;")
      .replace(/>/gim, "&gt;")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")  // Format markdown (incomplete, does not include: tables, using underscores, strikethrough, seperators, code & codeblocks, & more!)
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
      .replace(/\*(.*)\*/gim, "<i>$1</i>")
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' class='ppl-moe-link'>$1</a>")
      .replace(/  $/gim, "<br>")  // double space at end of lines is line break
      .replace(/\\\n/gim, "<br>") // "\⤶" is line break
      .replace(/\r\n\r\n/gim, "<br><br>") // double carridge return-line feed is paragraph break
      .replace(/(^|[^\n])\n{2}(?!\n)/g, "$1<br><br>") // double newline, no spaces is paragraph break, RegEx magic: https://stackoverflow.com/questions/18011260/regex-to-match-single-new-line-regex-to-match-double-new-line#answer-18012521

    return (
      <div className={classes.pplMoeSection}>
        <div className={classes.userInfoSectionHeader}>
          {Messages.PPL_MOE_ABOUT} {name}
        </div>
        <div className={classes.userInfoSectionText} dangerouslySetInnerHTML={{ __html: bioHTML }}></div>
      </div>
    )
  }
  return null
}

module.exports = class PplMoeProfile extends React.Component {
  render() {
    const { classes, profile } = this.props;
    return (
      <div className={classes.infoScroller} dir="ltr" style={{ 'overflow': "hidden scroll", 'padding-right': "12px" }}>
        <div className={classes.pplMoeSection}>
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