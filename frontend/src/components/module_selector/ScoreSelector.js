import React, { useState } from 'react';

// Map scores to Tailwind CSS colors
const scoreColors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-400',
    5: 'bg-green-600',
};

// Score descriptions for hover text
const scoreDescriptions = {
    1: 'Poor',
    2: 'Needs Improvement',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
};

/**
 * Reusable component for a 1-5 score selection.
 * @param {object} props - The component props.
 * @param {string} props.questionId - The unique ID of the question this selector belongs to.
 * @param {number} props.currentScore - The currently selected score (1-5).
 * @param {function} props.onSelectScore - Callback function to handle score selection.
 */
export default function ScoreSelector({ questionId, currentScore, onSelectScore }) {
    const [hoveredScore, setHoveredScore] = useState(0);

    return (
        <div className="flex justify-between items-center w-full max-w-sm mx-auto relative">
            {[1, 2, 3, 4, 5].map((score) => (
                <div
                    key={score}
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center 
                        cursor-pointer font-bold text-white transition-all transform duration-300
                        ${currentScore === score 
                            ? scoreColors[score] + ' scale-110' 
                            : hoveredScore === score 
                                ? scoreColors[score] + ' scale-105'
                                : 'bg-gray-400'
                        }
                    `}
                    onClick={() => onSelectScore(questionId, score)}
                    onMouseEnter={() => setHoveredScore(score)}
                    onMouseLeave={() => setHoveredScore(0)}
                >
                    {score}
                </div>
            ))}
            <div className="text-center mt-2 h-6 absolute w-full -bottom-8">
                {hoveredScore > 0 && (
                    <span className="text-sm font-medium text-gray-600 transition-opacity duration-200">
                        {scoreDescriptions[hoveredScore]}
                    </span>
                )}
            </div>
        </div>
    );
}