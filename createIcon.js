import React from "react";
import { StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";

export const FONT_FAMILY = "unicons-line";

const sizeStyles = {};

const styleForSize = size => {
  const key = String(size);
  if (!sizeStyles[key]) {
    const pixels = Number(size) || 24;
    sizeStyles[key] = StyleSheet.create({
      icon: {
        width: pixels,
        height: pixels,
        fontSize: pixels,
        lineHeight: pixels,
        color: "black",
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        fontFamily: FONT_FAMILY
      }
    }).icon;
  }
  return sizeStyles[key];
};

const createIcon = (glyph, displayName) => {
  const Icon = ({ color, size = 24, style, ...otherProps }) => (
    <Text
      allowFontScaling={false}
      selectable={false}
      accessible={false}
      importantForAccessibility="no"
      {...otherProps}
      style={[styleForSize(size), style, color != null && { color }]}
    >
      {glyph}
    </Text>
  );

  Icon.displayName = displayName;
  Icon.propTypes = {
    color: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  return React.memo(Icon);
};

export default createIcon;
