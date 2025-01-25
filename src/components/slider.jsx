
import React from "react";
import { useState } from "react";

/**
 
 * @param {Object} props 
 * @param {number} props.min 
 * @param {number} props.max 
 * @param {number} props.value 
 * @param {number} props.step 
 * @param {Function} props.onChange 
 * @returns {JSX.Element} 
 */

export default function Slider({ min, max, value, step, onChange }) {
    const [sliderValue, setSliderValue] = useState(value);

    /**
     * Handles the change event of the slider.
     * @param {React.ChangeEvent<HTMLInputElement>} e.
     */
    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        setSliderValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={handleChange}
                className="w-full appearance-none bg-gray-300 rounded-lg cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="mt-2 text-sm font-medium text-gray-700">{sliderValue}</div>
        </div>
    );
}
