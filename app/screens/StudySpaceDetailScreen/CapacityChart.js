/* eslint react-native/no-inline-styles: 0 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Svg } from "expo";
import { AreaChart } from "react-native-svg-charts";
import Styles from "../../styles/Map";
import Colors from "../../constants/Colors";

const { Defs, G, LinearGradient, Rect, Stop } = Svg;

const Gradient = ({ index }) => (
  <Defs key={index}>
    <LinearGradient id="gradient" x1="0%" y="0%" x2="0%" y2="100%">
      <Stop offset="0%" stopColor={Colors.accentColor} stopOpacity={0.8} />
      <Stop offset="100%" stopColor={Colors.accentColor} stopOpacity={0.2} />
    </LinearGradient>
  </Defs>
);
Gradient.propTypes = {
  index: PropTypes.number.isRequired,
};

/* apparently ESLint does not like curried components!! */
/* eslint-disable react/prop-types */
const HighlightBar = (data, time, occupied) => ({ x, y, width, height }) => (
  <G key="tooltip" x={x(time)}>
    <Rect
      height={height}
      width={width / 24}
      opacity={0.3}
      fill={Colors.graphCurrentBar}
    />
    <Rect
      y={y(occupied)}
      height={height - y(occupied)}
      width={width / 24}
      fill={Colors.graphCurrentBar}
    />
  </G>
);
/* eslint-enable react/prop-types */

class CapacityChart extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    occupied: PropTypes.number,
  };

  static defaultProps = {
    data: [],
    occupied: 0,
  };

  state = {
    showData: false,
  };

  componentDidMount() {
    setTimeout(() => this.setState({ showData: true }), 600);
  }
  render() {
    const { data, occupied } = this.props;
    const { showData } = this.state;
    const hour = parseInt(moment().format("HH"), 10);
    // chart library will spleen between a list of 0s and the actual
    // data.
    const graphData = showData ? data : Array.from(Array(24)).map(() => 0);
    const highlightBar = HighlightBar(
      graphData,
      showData ? hour : -1,
      occupied,
    );
    return (
      <AreaChart
        animate
        animationDuration={500}
        contentInset={{ top: 10 }}
        data={graphData}
        showGrid={false}
        svg={{
          fill: showData ? "url(#gradient)" : "transparent",
          stroke: showData ? Colors.accentColor : "none",
          strokeWidth: showData ? 2 : 0,
        }}
        style={[
          Styles.wideMap,
          {
            backgroundColor: Colors.textInputBackground,
          },
        ]}
        extras={[Gradient, highlightBar]}
      />
    );
  }
}

export default CapacityChart;
