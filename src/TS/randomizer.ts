// Import necessary modules
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as util from 'util';

// Load the shared library dynamically
const ffi = require('ffi-napi');

// Define default questions to use in case of errors or technical difficulties
const defaultQuestions: string[] = [
    "What is your name?",
    "How are you feeling today?",
    "What is your favorite hobby?",
    "What is the capital of France?",
    "Can you describe your ideal vacation?",
    "What motivates you to work hard?",
    "Who is your role model, and why?",
    "What is your favorite book, and why?",
    "How do you handle stress?",
    "What is one skill you would like to learn, and why?"
];

// Function to load a library from the given path
function loadLibrary(libraryPath: string) {
    console.log(`Checking if file exists: ${libraryPath}`);
    if (!fs.existsSync(libraryPath) || !fs.lstatSync(libraryPath).isFile()) {
        console.error(`File ${libraryPath} does not exist or is not a valid file.`);
        return null;
    }
    
    try {
        console.log(`Attempting to load library from ${libraryPath}`);
        const lib = ffi.Library(libraryPath, {
            'next_assessment_question': ['string', []]
        });
        return lib;
    } catch (error) {
        console.error(`Could not load library: ${error.message}`);
        return null;
    }
}

// Function to save logs to a file
function saveLog(message: string) {
    const logFilePath = path.resolve('application_logs.txt');
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

// Function to interact with the user and provide more comprehensive experience
async function interactWithUser(question: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const questionPromise = util.promisify(rl.question).bind(rl);
    try {
        const response = await questionPromise(`${question} `);
        console.log(`You answered: ${response}`);
        saveLog(`Question: ${question}, Response: ${response}`);
    } catch (error) {
        console.error(`Error in user interaction: ${error.message}`);
        saveLog(`Error during user interaction: ${error.message}`);
    } finally {
        rl.close();
    }
}

// Function to run diagnostics and check system requirements
function runDiagnostics() {
    console.log("Running diagnostics...");
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    console.log(`Memory Usage: RSS - ${memoryUsage.rss}, Heap Total - ${memoryUsage.heapTotal}, Heap Used - ${memoryUsage.heapUsed}`);
    console.log(`CPU Usage: User - ${cpuUsage.user}, System - ${cpuUsage.system}`);
    saveLog(`Diagnostics - Memory Usage: ${JSON.stringify(memoryUsage)}, CPU Usage: ${JSON.stringify(cpuUsage)}`);
}

async function main() {
    runDiagnostics();

    const libraryPath = path.resolve('/mnt/data/Randomized_Selection.so');
    const library = loadLibrary(libraryPath);

    let nextQuestion: string;

    if (library) {
        try {
            console.log("Calling 'next_assessment_question' function.");
            saveLog("Calling 'next_assessment_question' function.");
            const question = library.next_assessment_question();
            if (question) {
                nextQuestion = question;
                console.log(`Next assessment question: ${nextQuestion}`);
                saveLog(`Next assessment question: ${nextQuestion}`);
            } else {
                throw new Error("Received null or undefined from 'next_assessment_question' function.");
            }
        } catch (error) {
            console.error(`An error occurred while fetching the next question: ${error.message}`);
            saveLog(`Error fetching next question: ${error.message}`);
            nextQuestion = defaultQuestions[1];
        }
    } else {
        console.error("Failed to load the Randomized_Selection library.");
        saveLog("Failed to load the Randomized_Selection library.");
        nextQuestion = defaultQuestions[2];
    }

    console.log(`Output: ${nextQuestion}`);
    saveLog(`Output: ${nextQuestion}`);

    await interactWithUser(nextQuestion);
}

main();
