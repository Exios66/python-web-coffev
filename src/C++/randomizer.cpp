#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <dlfcn.h>
#include <memory>

// Function to load a shared library from a given path
void* loadLibrary(const std::string& libraryPath) {
    std::cout << "Checking if file exists: " << libraryPath << std::endl;
    std::ifstream file(libraryPath);
    if (!file.good()) {
        std::cerr << "File " << libraryPath << " does not exist." << std::endl;
        return nullptr;
    }
    file.close();

    std::cout << "Attempting to load library from " << libraryPath << std::endl;
    void* handle = dlopen(libraryPath.c_str(), RTLD_LAZY);
    if (!handle) {
        std::cerr << "Could not load library: " << dlerror() << std::endl;
    }
    return handle;
}

// Function to get a function pointer from a loaded library
void* getFunctionPointer(void* libraryHandle, const std::string& functionName) {
    dlerror(); // Clear any existing error
    std::cout << "Attempting to retrieve function '" << functionName << "' from library." << std::endl;
    void* functionPointer = dlsym(libraryHandle, functionName.c_str());
    const char* error = dlerror();
    if (error) {
        std::cerr << "Error retrieving function: " << error << std::endl;
        return nullptr;
    }
    return functionPointer;
}

int main() {
    // Define a list of default questions in case of errors or technical difficulties
    std::vector<std::string> defaultQuestions = {
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
    };

    // Define the path to the Randomized_Selection shared library
    std::string libraryPath = "/mnt/data/Randomized_Selection.so";
    
    // Attempt to load the Randomized_Selection shared library
    void* libraryHandle = loadLibrary(libraryPath);

    std::string nextQuestion;

    if (libraryHandle) {
        // Use dlsym to get the function pointer for 'next_assessment_question'
        typedef const char* (*NextAssessmentQuestionFunc)();
        void* funcPtr = getFunctionPointer(libraryHandle, "next_assessment_question");

        if (funcPtr) {
            try {
                NextAssessmentQuestionFunc nextAssessmentQuestion = reinterpret_cast<NextAssessmentQuestionFunc>(funcPtr);
                std::cout << "Calling 'next_assessment_question' function." << std::endl;
                const char* question = nextAssessmentQuestion();
                if (question) {
                    nextQuestion = question;
                } else {
                    throw std::runtime_error("Received null pointer from 'next_assessment_question' function.");
                }
                std::cout << "Next assessment question: " << nextQuestion << std::endl;
            } catch (const std::exception& e) {
                // Handle any other exceptions that might occur
                std::cerr << "An error occurred while fetching the next question: " << e.what() << std::endl;
                // Fall back to a default question
                nextQuestion = defaultQuestions[1];
            }
        } else {
            // Handle the case where the expected function is not present or not callable
            std::cerr << "The function 'next_assessment_question' does not exist or is not callable in the provided file." << std::endl;
            // Fall back to a default question
            nextQuestion = defaultQuestions[0];
        }
    } else {
        // Handle the case where the library could not be loaded
        std::cerr << "Failed to load the Randomized_Selection library." << std::endl;
        nextQuestion = defaultQuestions[2];
    }

    // Output the result of the next question
    std::cout << "Output: " << nextQuestion << std::endl;

    // Close the library handle
    if (libraryHandle) {
        dlclose(libraryHandle);
    }

    return 0;
}
