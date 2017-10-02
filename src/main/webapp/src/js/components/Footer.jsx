import React from "react";

class Footer extends React.Component {

  render() {
    return (
      <div className="footer">
        <span className="pixels">Pixels Camp 2017</span>
        <span>Bruno Maia <i className="github-i"/><a href="//github.com/queimadus" target="_blank">queimadus</a></span>
        <span>João Azevedo <i className="github-i"/><a href="//github.com/jcazevedo" target="_blank">jcazevedo</a></span>
        <span>João Costa <i className="github-i"/><a href="//github.com/jd557" target="_blank">jd557</a></span>
        <span>Leonora Henriques <i className="github-i"/><a href="//github.com/lldh" target="_blank">lldh</a></span>
      </div>
    );
  }
}

export default Footer;
