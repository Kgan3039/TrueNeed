import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  const palette =
    variant === "primary"
      ? {
          bg: theme.green,
          bgPressed: theme.greenDark,
          border: theme.green,
          text: "white",
        }
      : variant === "danger"
      ? {
          bg: "#fee2e2",
          bgPressed: "#fecaca",
          border: "#fca5a5",
          text: "#b91c1c",
        }
      : {
          bg: "white",
          bgPressed: theme.greenSoft,
          border: theme.border,
          text: theme.greenDark,
        };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: pressed ? palette.bgPressed : palette.bg,
        opacity: isDisabled ? 0.6 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        ...(style || {}),
      })}
    >
      {loading && <ActivityIndicator color={palette.text} />}
      <Text style={{ fontWeight: "900", color: palette.text }}>{title}</Text>
    </Pressable>
  );
}