import { useTheme } from "@/shared/context/ThemeContext";
import { SketchPicker, ColorResult } from 'react-color';
import styles from "./ColorPalette.module.css";

export default function ColorPalette() {
    const { themeColor, setThemeColor } = useTheme();

    const handleChangeComplete = (color: ColorResult) => {
        setThemeColor(color.hex);
    };

    return (
        <div className={styles.pickerWrapper}>
            <SketchPicker
                color={themeColor}
                onChangeComplete={handleChangeComplete}
                className={styles.sketchPicker} // Apply custom class here
            />
        </div>
    );
}
