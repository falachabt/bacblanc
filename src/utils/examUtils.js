'use client';

/**
 * Collection of utility functions for the exam system
 */

/**
 * Convert a duration string (e.g. "2h30") to seconds
 * @param {string} durationStr - Duration in string format (e.g. "2h30", "1h45", "45m")
 * @returns {number} Duration in seconds
 */
export function convertDurationToSeconds(durationStr) {
    if (!durationStr) return 3600; // Default to 1 hour

    console.log("Converting duration:", durationStr);

    // Handle various formats
    let seconds = 0;

    // Format: "2h30"
    const hourMinRegex = /(\d+)h(\d+)?/;
    const hourMin = durationStr.match(hourMinRegex);
    if (hourMin) {
        const hours = parseInt(hourMin[1], 10) || 0;
        const minutes = parseInt(hourMin[2], 10) || 0;
        seconds = (hours * 3600) + (minutes * 60);
        console.log(`Parsed ${hours}h${minutes}m to ${seconds} seconds`);
        return seconds;
    }

    // Format: "30m"
    const minRegex = /(\d+)m/;
    const min = durationStr.match(minRegex);
    if (min) {
        const minutes = parseInt(min[1], 10) || 0;
        seconds = minutes * 60;
        console.log(`Parsed ${minutes}m to ${seconds} seconds`);
        return seconds;
    }

    // Format: "3600" (already in seconds)
    const secRegex = /^\d+$/;
    if (secRegex.test(durationStr)) {
        seconds = parseInt(durationStr, 10);
        console.log(`Parsed ${durationStr} (already in seconds) to ${seconds} seconds`);
        return seconds;
    }

    // If no format matches, default to 1 hour
    console.log(`No format matches for ${durationStr}, defaulting to 3600 seconds (1 hour)`);
    return 3600;
}

/**
 * Format seconds into HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    if (seconds == null || isNaN(seconds) || seconds < 0) {
        console.log("Invalid time value for formatting:", seconds);
        return "00:00:00";
    }

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedTime = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return formattedTime;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    if (!date) return 'Date inconnue';

    const dateObj = typeof date == 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString() + ' à ' + dateObj.toLocaleTimeString();
}

/**
 * Calculate the progress percentage of an exam
 * @param {number} answeredCount - Number of questions answered
 * @param {number} totalQuestions - Total number of questions
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(answeredCount, totalQuestions) {
    if (!totalQuestions || totalQuestions <= 0) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Save exam progress to localStorage
 * @param {string} examId - ID of the exam
 * @param {Object} progressData - Progress data to save
 */
export function saveExamProgress(examId, progressData) {
    try {
        console.log("Saving exam progress for exam:", examId, "with data:", progressData);
        localStorage.setItem(`exam_progress_${examId}`, JSON.stringify({
            ...progressData,
            timestamp: new Date().getTime()
        }));
        return true;
    } catch (error) {
        console.error("Error saving exam progress:", error);
        return false;
    }
}

/**
 * Load exam progress from localStorage
 * @param {string} examId - ID of the exam
 * @returns {Object|null} Progress data or null if not found
 */
export function loadExamProgress(examId) {
    try {
        const savedProgress = localStorage.getItem(`exam_progress_${examId}`);
        if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            console.log("Loaded exam progress for exam:", examId, "data:", parsedProgress);

            // Valider que le temps restant est positif
            if (!parsedProgress.timeLeft || parsedProgress.timeLeft <= 0) {
                console.warn("Invalid timeLeft value in saved progress:", parsedProgress.timeLeft);
                // Tenter de récupérer l'examen pour obtenir sa durée
                const examsData = localStorage.getItem('exams_data');
                if (examsData) {
                    const exams = JSON.parse(examsData);
                    const exam = exams.find(e => e.id == examId);
                    if (exam && exam.duration) {
                        parsedProgress.timeLeft = convertDurationToSeconds(exam.duration);
                        console.log("Reset timeLeft to full duration:", parsedProgress.timeLeft);
                    } else {
                        // Défaut: 1 heure
                        parsedProgress.timeLeft = 3600;
                        console.log("Reset timeLeft to default (1 hour)");
                    }
                }
            }

            return parsedProgress;
        }
        console.log("No saved progress found for exam:", examId);
        return null;
    } catch (error) {
        console.error("Error loading exam progress:", error);
        return null;
    }
}

/**
 * Check if the user has completed an exam
 * @param {string} examId - ID of the exam
 * @returns {boolean} True if the exam has been completed
 */
export function hasCompletedExam(examId) {
    return !!localStorage.getItem(`exam_result_${examId}`);
}

/**
 * Get the result of a completed exam
 * @param {string} examId - ID of the exam
 * @returns {Object|null} Exam result or null if not found
 */
export function getExamResult(examId) {
    try {
        const savedResult = localStorage.getItem(`exam_result_${examId}`);
        if (savedResult) {
            return JSON.parse(savedResult);
        }
        return null;
    } catch (error) {
        console.error("Error loading exam result:", error);
        return null;
    }
}

/**
 * Save exam result to localStorage
 * @param {string} examId - ID of the exam
 * @param {Object} resultData - Result data to save
 */
export function saveExamResult(examId, resultData) {
    try {
        // Add timestamp if not already present
        const dataToSave = {
            ...resultData,
            date: resultData.date || new Date().toISOString()
        };

        localStorage.setItem(`exam_result_${examId}`, JSON.stringify(dataToSave));

        // Clear progress since the exam is completed
        localStorage.removeItem(`exam_progress_${examId}`);

        return true;
    } catch (error) {
        console.error("Error saving exam result:", error);
        return false;
    }
}

/**
 * Check if an answer is correct for a given question
 * @param {Object} question - Question object
 * @param {*} userAnswer - User's answer
 * @returns {boolean} True if the answer is correct
 */
export function isAnswerCorrect(question, userAnswer) {
    if (!userAnswer) return false;

    // Parse correct_answer if it's a JSON string
    let correct_answer = question.correct_answer;
    if (typeof correct_answer === 'string' && (correct_answer.startsWith('[') || correct_answer.startsWith('{'))) {
        try {
            correct_answer = JSON.parse(correct_answer);
        } catch (e) {
            console.error("Error parsing correct_answer:", e);
        }
    }

    switch (question.type) {
        case 'multiple':
            // For multiple-choice, check if all correct answers are selected and no incorrect ones
            const correctSet = new Set(Array.isArray(correct_answer) ? correct_answer : [correct_answer]);
            const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);

            return correctSet.size === userSet.size &&
                [...correctSet].every(value => userSet.has(value));

        case 'single':
            // For single-choice, direct comparison
            return userAnswer === correct_answer;

        case 'text':
            // For text questions, case-insensitive comparison
            return userAnswer.toLowerCase().trim() === String(correct_answer).toLowerCase().trim();

        case 'true-false':
            // For true/false questions, direct comparison
            return userAnswer === correct_answer;

        default:
            return false;
    }
}

/**
 * Calculate partial score for multiple-choice questions
 * @param {Object} question - Question object
 * @param {*} userAnswer - User's answer
 * @returns {number} Partial score between 0 and 1
 */
export function calculatePartialScore(question, userAnswer) {
    if (!userAnswer) return 0;

    // Parse correct_answer if it's a JSON string
    let correct_answer = question.correct_answer;
    if (typeof correct_answer === 'string' && (correct_answer.startsWith('[') || correct_answer.startsWith('{'))) {
        try {
            correct_answer = JSON.parse(correct_answer);
        } catch (e) {
            console.error("Error parsing correct_answer:", e);
            return 0;
        }
    }

    // Only apply partial scoring to multiple-choice questions
    if (question.type !== 'multiple') {
        return isAnswerCorrect(question, userAnswer) ? 1 : 0;
    }

    const correctSet = new Set(Array.isArray(correct_answer) ? correct_answer : [correct_answer]);
    const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);

    // If the user got everything perfectly correct
    if (correctSet.size === userSet.size && [...correctSet].every(value => userSet.has(value))) {
        return 1;
    }

    // Calculate partial score based on correct selections minus incorrect selections
    let correctSelections = 0;
    let incorrectSelections = 0;

    // Count correct selections
    userSet.forEach(answer => {
        if (correctSet.has(answer)) {
            correctSelections++;
        } else {
            incorrectSelections++;
        }
    });

    // Count missed correct answers
    const missedCorrect = correctSet.size - correctSelections;

    // Partial score formula: (correct selections - incorrect selections) / total correct answers
    // Ensures score is between 0 and 1, penalizes wrong selections
    const partialScore = Math.max(0, (correctSelections - incorrectSelections) / correctSet.size);
    
    return partialScore;
}

/**
 * Calculate results for an exam
 * @param {Object} exam - Exam object
 * @param {Object} answers - User's answers
 * @returns {Object} Exam results
 */
export function calculateExamResults(exam, answers) {
    let score = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let partialCount = 0;

    console.log("Calculating exam results for exam:", exam.title);
    console.log("User answers:", answers);

    exam.questions.forEach(question => {
        const questionPoints = parseFloat(question.points) || 1; // Default to 1 point if not specified
        totalPoints += questionPoints;
        const userAnswer = answers[question.id];

        console.log(`Question ${question.id}: points=${questionPoints}, userAnswer=`, userAnswer);

        if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
            unansweredCount++;
            console.log(`Question ${question.id}: unanswered`);
            return;
        }

        // Calculate partial score (0 to 1)
        const partialScore = calculatePartialScore(question, userAnswer);
        const earnedPoints = partialScore * questionPoints;
        score += earnedPoints;

        console.log(`Question ${question.id}: partialScore=${partialScore}, earnedPoints=${earnedPoints}`);

        // Count as correct only if fully correct (score = 1.0)
        if (partialScore === 1) {
            correctCount++;
        } else if (partialScore > 0) {
            partialCount++;
        } else {
            incorrectCount++;
        }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    console.log("Final results:", {
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        total: totalPoints,
        percentage,
        correctCount,
        incorrectCount,
        partialCount,
        unansweredCount
    });

    const result = {
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        total: totalPoints,
        correctCount,
        incorrectCount,
        unansweredCount,
        partialCount,
        totalQuestions: exam.questions.length,
        date: new Date().toISOString(),
        percentage
    };

    return result;
}

/**
 * Get all completed exams
 * @returns {Array} Array of exam results with IDs
 */
export function getAllCompletedExams() {
    try {
        const results = [];
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Check if the key matches the pattern for exam results
            if (key.startsWith('exam_result_')) {
                const examId = key.replace('exam_result_', '');
                const result = getExamResult(examId);
                if (result) {
                    results.push({
                        examId,
                        ...result
                    });
                }
            }
        }

        // Sort by date (most recent first)
        results.sort((a, b) => new Date(b.date) - new Date(a.date));

        return results;
    } catch (error) {
        console.error("Error getting completed exams:", error);
        return [];
    }
}

/**
 * Get all exams in progress
 * @returns {Array} Array of exam progress with IDs
 */
export function getAllExamsInProgress() {
    try {
        const progressList = [];
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Check if the key matches the pattern for exam progress
            if (key.startsWith('exam_progress_')) {
                const examId = key.replace('exam_progress_', '');
                const progress = loadExamProgress(examId);
                if (progress) {
                    progressList.push({
                        examId,
                        ...progress
                    });
                }
            }
        }

        // Sort by timestamp (most recent first)
        progressList.sort((a, b) => b.timestamp - a.timestamp);

        return progressList;
    } catch (error) {
        console.error("Error getting exams in progress:", error);
        return [];
    }
}