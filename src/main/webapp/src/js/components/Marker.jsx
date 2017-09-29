import React from "react";
import PropTypes from "prop-types";

class Marker extends React.Component {

  constructor() {
    super();
    this.state = {
      hovering: false
    };
  }

  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    quality: PropTypes.number,
    count: PropTypes.number
  };

  countToDiameter(count) {
    var d = 1, steps = 6;
    if (count === 0) {
      d = 0;
    } else if (count < 3) {
      d = 1;
    } else if (count > 200) {
      d = steps;
    } else if (count) {
      d = Math.max(1, count / 200 * steps);
    }
    return d * 30;
  }

  hovering(bool) {
    this.setState({
      hovering: bool
    });
  }

  hoverProps = () =>{
    return {
      onMouseEnter: () => this.hovering(true),
      onMouseLeave: () => this.hovering(false)
    }
  };

  render() {
    const {x, y, quality, count, name} = this.props;

    const diameter = this.countToDiameter(count);

    let className = "";
    if (quality > -20)
      className = "Good"
    else if (quality > -40)
      className = "Average"
    else if (quality <= -40)
      className = "Bad";

    // console.log(x, y, count, diameter);

    return (
      <div className="marker-container" style={{top: y, left: x}}>
        <div className="marker-inner">
          <div className={"spread-circle "+className}
               style={{ width: diameter, height: diameter }}/>
          <div className="hover-circle"
               {...this.hoverProps()}/>
          <div className="inner-circle" {...this.hoverProps()} />
          {this.state.hovering &&
            <div className="count-text"
                 style={{position: "absolute"}}
                 {...this.hoverProps()}>
              <div>
                <span>AP name</span>
                <span>{name}</span>
              </div>
              <div>
                <span>Active connections</span>
                <span>{count || "-"}</span>
              </div>
              <div>
                <span>Signal strength</span>
                <span>{className || "-"}</span>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Marker;
